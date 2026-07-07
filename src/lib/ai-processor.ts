import { prisma } from "@/lib/db";

interface AiProvider {
  provider: string;
  keyValue: string;
  baseUrl: string;
  label: string;
  model: string;
}

/**
 * Check if DeepSeek API key is configured (from env or DB).
 */
export async function hasAiConfig(): Promise<boolean> {
  // Check env vars first
  if (process.env.DEEPSEEK_API_KEY) {
    return true;
  }

  // Check database for active keys
  try {
    const count = await prisma.apiKey.count({ where: { active: true } });
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * Get the first active AI provider config from database.
 */
export async function getActiveProvider(): Promise<AiProvider | null> {
  try {
    const key = await prisma.apiKey.findFirst({ where: { active: true } });
    if (!key) return null;
    return {
      provider: key.provider,
      keyValue: key.keyValue,
      baseUrl: key.baseUrl || getDefaultBaseUrl(key.provider),
      label: key.label,
      model: key.model || getDefaultModel(key.provider),
    };
  } catch {
    return null;
  }
}

function getDefaultBaseUrl(provider?: string): string {
  return "https://api.deepseek.com";
}

function getDefaultModel(provider?: string): string {
  return "deepseek-v4-pro";
}

// --- TYPESCRIPT INTERFACES --- //
export interface ExtractedFact {
  sourceRef: string;
}
export interface Role extends ExtractedFact {
  name: string;
  description: string;
}
export interface Requirement extends ExtractedFact {
  text: string;
  type: "functional" | "non-functional" | "reporting";
}
export interface WireframeField extends ExtractedFact {
  screenHint: string;
  field: string;
}
export interface BusinessProcessStep extends ExtractedFact {
  step: string;
  actor: string;
}
export interface OutOfScopeItem {
  item: string;
  reason: string;
}
export interface ExtractedFacts {
  roles: Role[];
  requirements: Requirement[];
  wireframeFields: WireframeField[];
  businessProcess: BusinessProcessStep[];
  outOfScope: OutOfScopeItem[];
}

// --- RUNTIME VALIDATORS --- //
function validateFacts(raw: any): ExtractedFacts {
  const safe = (arr: any) => (Array.isArray(arr) ? arr : []);
  return {
    roles: safe(raw?.roles).filter((r: any) => r?.name && r?.sourceRef),
    requirements: safe(raw?.requirements).filter((r: any) => r?.text && r?.sourceRef),
    wireframeFields: safe(raw?.wireframeFields).filter((f: any) => f?.field && f?.sourceRef),
    businessProcess: safe(raw?.businessProcess).filter((b: any) => b?.step && b?.sourceRef),
    outOfScope: safe(raw?.outOfScope).filter((o: any) => o?.item),
  };
}

function validateAggregatedResult(raw: any): any {
  const tasks = Array.isArray(raw?.final_result?.tasks) ? raw.final_result.tasks : [];
  const validTasks = tasks
    .filter((t: any) => t?.title && t?.description)
    .map((t: any) => ({
      ...t,
      subTasks: Array.isArray(t.subTasks)
        ? t.subTasks.filter((st: any) => st?.title && st?.description)
        : [],
    }));
  return {
    reasoning: raw?.reasoning || "Alasan tidak disertakan oleh model.",
    final_result: {
      projectName: raw?.final_result?.projectName || "Project",
      tasks: validTasks,
    },
  };
}

/**
 * STEP 1: Ekstraksi Fakta Fundamental (Grounding)
 * Mengekstrak data literal dari BRD tanpa melakukan perancangan modul/screen.
 */
async function extractFacts(
  text: string,
  provider: AiProvider,
  apiUrl: string,
  fetchHeaders: Record<string, string>
): Promise<ExtractedFacts> {
  const emptyFacts: ExtractedFacts = {
    roles: [],
    requirements: [],
    wireframeFields: [],
    businessProcess: [],
    outOfScope: [],
  };

  const systemPrompt = `Anda adalah asisten AI ekstraktor fakta objektif. Tugas Anda HANYA mengekstrak fakta literal dari dokumen BRD, BUKAN merancang sistem, BUKAN memecah modul/screen.

ATURAN KRITIS (GUARDRAILS):
1. Jika informasi tidak eksplisit ada di teks, JANGAN diisi — kosongkan array, jangan menebak.
2. Setiap item WAJIB menyertakan "sourceRef" (kutipan singkat dari teks BRD asli yang menjadi dasar fakta tersebut).
3. Output HANYA MURNI JSON yang valid, tanpa teks pengantar/penutup, menggunakan skema persis seperti ini:

{
  "roles": [{ "name": "string", "description": "string", "sourceRef": "string" }],
  "requirements": [{ "text": "string", "type": "functional|non-functional|reporting", "sourceRef": "string" }],
  "wireframeFields": [{ "screenHint": "string", "field": "string", "sourceRef": "string" }],
  "businessProcess": [{ "step": "string", "actor": "string", "sourceRef": "string" }],
  "outOfScope": [{ "item": "string", "reason": "string" }]
}`;

  const startTime = Date.now();
  console.log(`[extractFacts] Memulai ekstraksi fakta. Panjang input: ${text.length} karakter...`);

  const fetchBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ekstrak fakta dari dokumen BRD berikut:\n\n${text}` },
    ],
    temperature: 0,
    max_tokens: 32000,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(fetchBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`AI API error saat ekstraksi fakta (${response.status}): ${errText}`);
      return emptyFacts;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("AI response is empty saat ekstraksi fakta.");
      return emptyFacts;
    }

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let rawFacts: any;
    try {
      rawFacts = JSON.parse(jsonStr);
    } catch (e) {
      const bracketCount = (jsonStr.match(/{/g) || []).length - (jsonStr.match(/}/g) || []).length;
      if (bracketCount > 0) {
        jsonStr += "\n}".repeat(bracketCount);
        const arrayOpen = (jsonStr.match(/\[/g) || []).length;
        const arrayClose = (jsonStr.match(/\]/g) || []).length;
        if (arrayOpen > arrayClose) {
          jsonStr += "\n]".repeat(arrayOpen - arrayClose);
        }
      }

      try {
        rawFacts = JSON.parse(jsonStr);
      } catch (innerErr) {
        console.error("[extractFacts] JSON repair failed, falling back to emptyFacts", innerErr);
        throw innerErr;
      }
    }

    const validFacts = validateFacts(rawFacts);

    const duration = Date.now() - startTime;
    const numRoles = validFacts.roles.length;
    const numReqs = validFacts.requirements.length;
    const numFields = validFacts.wireframeFields.length;
    const numSteps = validFacts.businessProcess.length;

    console.log(`[extractFacts] Selesai dalam ${duration}ms. Ter-ekstrak: ${numRoles} roles, ${numReqs} reqs, ${numFields} fields, ${numSteps} steps.`);

    if (text.length > 2000 && numReqs === 0) {
      console.warn("[extractFacts] Suspicious: long BRD but 0 requirements extracted");
    }

    return validFacts;

  } catch (error) {
    console.error("[extractFacts] Gagal mengekstrak atau memparsing fakta:", error);
    return emptyFacts;
  }
}

/**
 * STEP 2: Generate Drafts (Dekomposisi Modul & Screen)
 * Membuat rancangan dari kombinasi fakta ekstraksi dan teks BRD asli.
 */
async function generateDraft(
  temp: number,
  facts: ExtractedFacts,
  text: string,
  provider: AiProvider,
  apiUrl: string,
  fetchHeaders: Record<string, string>
): Promise<string> {
  const systemPrompt = `Anda adalah asisten AI ahli (Senior System Analyst & Lead UI/UX Designer) yang bertugas mengubah dokumen BRD (Business Requirements Document) menjadi struktur tugas hierarki 4-level yang komprehensif dan siap dieksekusi.

## PROSES ANALISIS & PENGECEKAN BERLAPIS (MULTI-LAYER VERIFICATION)
Lakukan proses kognitif berikut secara internal secara berurutan dan ketat sebelum menghasilkan output:

### Tahap 1: Ekstraksi Konteks Fundamental
1. Pahami latar belakang, tujuan bisnis, ruang lingkup (in-scope), dan daftar pengguna/stakeholder (roles).
2. Identifikasi sistem pihak ketiga atau fungsi backend murni (out-of-scope). Pastikan TIDAK membuatkan rancangan UI untuk sistem tersebut.

### Tahap 2: Dekomposisi Modul (Layer 1)
1. Petakan alur bisnis utama menjadi Modul Fungsional yang kohesif.
2. **VERIFIKASI TAHAP 2**: Evaluasi silang dengan seluruh requirement di BRD. Apakah ada fitur wajib yang belum masuk ke dalam daftar modul? Pastikan coverage 100% dari BRD.

### Tahap 3: Breakdown Halaman / Screen (Layer 2)
1. Pecah setiap modul menjadi halaman/screen spesifik berdasarkan User Journey dan keputusan aktor.
2. Terapkan best-practice UX: Pisahkan proses kompleks.
3. **VERIFIKASI TAHAP 3**: Pastikan setiap screen memiliki tujuan yang jelas, aktor yang spesifik, dan tidak tumpang tindih.

### Tahap 4: Spesifikasi Elemen UI & DoD (Layer 3 & 4)
1. Identifikasi Elemen UI konkret yang wajib ada di setiap screen.
2. Formulasikan Definition of Done (DoD) yang SANGAT SPESIFIK dan TERUKUR.
3. **VERIFIKASI FINAL**:
   - Apakah saya mengarang fitur yang tidak ada di BRD? Jika ya, HAPUS.
   - Apakah istilah bisnis (naming convention) yang digunakan sudah SAMA PERSIS dengan di BRD?
   - Apakah struktur data sudah sepenuhnya sesuai dengan skema JSON yang diminta?

## OUTPUT — HANYA JSON (Tanpa teks pengantar/penutup)

RESPON MURNI HANYA DENGAN FORMAT JSON BERIKUT:
{
  "projectName": "Nama Proyek — persis dari BRD",
  "tasks": [
    {
      "title": "Nama Modul — singkat dan jelas",
      "description": "Deskripsi modul — fungsi utama, aktor yang terlibat, cakupan proses bisnis",
      "goals": ["Goal 1 — nilai bisnis/masalah yang diselesaikan", "Goal 2"],
      "definitionOfDone": "Kriteria terukur Modul selesai (misal: 'Proses checkout berhasil diuji').",
      "priority": "high|medium|low",
      "subTasks": [
        {
          "title": "Nama Screen — spesifik",
          "description": "Deskripsi screen — user intent, data yang ditampilkan, aksi utama",
          "goals": ["Goal 1 — solusi yang diberikan screen ini"],
          "definitionOfDone": "Kriteria terukur Screen selesai",
          "elements": ["Input Email", "Tombol Lanjutkan", "Tabel (Kolom: ID, Nama, Status)"]
        }
      ]
    }
  ]
}

ATURAN KRITIS (GUARDRAILS):
0. PRIORITAS SUMBER: 'facts' yang diberikan adalah HASIL EKSTRAKSI YANG SUDAH DIVERIFIKASI dan menjadi SUMBER KEBENARAN UTAMA. Teks BRD asli hanya untuk membantu memahami konteks kalimat atau istilah yang ambigu di dalam facts — JANGAN mengambil requirement/field/proses baru dari teks asli yang TIDAK ada representasinya di dalam facts.
1. JANGAN HALUSINASI. Hanya gunakan informasi yang secara eksplisit atau implisit kuat ada di dalam BRD.
2. Elemen UI (elements) HANYA berisi array string nama komponen (jangan beri deskripsi panjang di dalamnya).
3. DoD harus berupa kalimat spesifik, bukan sekadar "Selesai didesain".
4. GROUNDING WAJIB: Setiap Modul (task) dan Screen (subTask) yang kamu buat HARUS bisa ditelusuri ke salah satu item di facts.requirements atau facts.businessProcess yang diberikan. Setiap item di 'elements' HARUS match dengan salah satu facts.wireframeFields. Jika kamu ingin menambahkan sesuatu yang TIDAK didukung oleh facts yang diberikan, JANGAN — itu tergolong halusinasi dan akan ditolak di tahap verifikasi berikutnya.
5. EXCLUSION WAJIB: JANGAN buat Task atau SubTask apa pun untuk item yang terdaftar di facts.outOfScope. Item tersebut adalah sistem pihak ketiga/backend yang secara eksplisit di luar cakupan UI/UX.`;

  const fetchBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Berikut adalah fakta yang sudah diekstrak dan diverifikasi dari BRD:\n${JSON.stringify(facts, null, 2)}\n\nBerikut teks asli BRD sebagai referensi tambahan jika diperlukan:\n${text}`
      },
    ],
    temperature: temp,
    max_tokens: 32000,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: fetchHeaders,
    body: JSON.stringify(fetchBody),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`AI API error pada generateDraft (temp: ${temp}) (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * STEP 3: Aggregasi Draft (Majority Voting & Verification)
 * Menggabungkan beberapa draft dan memverifikasi silang dengan fakta (grounding).
 */
async function aggregateDrafts(
  validDrafts: string[],
  facts: ExtractedFacts,
  provider: AiProvider,
  apiUrl: string,
  fetchHeaders: Record<string, string>
): Promise<any> {
  const aggregatorSystemPrompt = `Anda adalah AI Aggregator & Senior System Analyst.
Tugas Anda adalah membandingkan beberapa draf hasil ekstraksi BRD menjadi struktur tugas (JSON) dari beberapa eksekusi AI, lalu menggabungkannya menjadi 1 struktur JSON final yang paling akurat, komprehensif, dan konsisten (mayoritas).

ATURAN AGREGASI:
1. Bandingkan semua draf yang diberikan.
2. Ambil Modul (Task) dan Screen (SubTask) yang konsisten dan paling sering muncul di mayoritas draf.
3. Gabungkan elemen UI, goals, dan Definition of Done. Hilangkan bagian yang terlihat seperti halusinasi atau tidak nyambung dengan mayoritas draf.
4. Output HANYA MURNI JSON yang valid, TANPA teks pengantar/penutup, TANPA blok kode markdown jika memungkinkan (atau di dalam blok \`\`\`json jika terpaksa). Gunakan struktur yang PERSIS SAMA dengan standar berikut:
5. VERIFIKASI SILANG: Selain membandingkan mayoritas antar draf, verifikasi juga setiap Task dan SubTask terhadap 'facts' yang diberikan di awal pesan. Jika sebuah Task/SubTask/Element muncul di mayoritas draf TAPI TIDAK didukung oleh facts (tidak ada requirement/businessProcess/wireframeField yang cocok), JANGAN dihapus — tandai dengan menambahkan field 'needsReview': true dan 'reviewNote': <alasan singkat> pada item tersebut.
6. FILTER OUT-OF-SCOPE: Jika ada Task atau SubTask yang merujuk pada item di facts.outOfScope (meskipun muncul di salah satu draf), JANGAN masukkan ke final_result sama sekali — ini adalah pelanggaran scope yang harus dibuang, bukan sekadar ditandai needsReview.

{
  "reasoning": "Jelaskan dengan detail alasan pemilihan struktur final ini, apa yang digabungkan, dan mengapa",
  "final_result": {
    "projectName": "Nama Proyek",
    "tasks": [
      {
        "title": "Nama Modul",
        "description": "Deskripsi",
        "goals": ["Goal 1"],
        "definitionOfDone": "DoD Modul",
        "priority": "high|medium|low",
        "needsReview": false,
        "reviewNote": "",
        "subTasks": [
          {
            "title": "Nama Screen",
            "description": "Deskripsi",
            "goals": ["Goal 1"],
            "definitionOfDone": "DoD Screen",
            "elements": ["Elemen 1", "Elemen 2"],
            "needsReview": false,
            "reviewNote": ""
          }
        ]
      }
    ]
  }
}`;

  const draftsContent = validDrafts.map((draft, idx) => `=== DRAF ${idx + 1} ===\n${draft}\n`).join("\n");

  const aggregatorBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: aggregatorSystemPrompt },
      {
        role: "user",
        content: `Berikut adalah fakta yang sudah diekstrak dan diverifikasi dari BRD (gunakan sebagai rujukan validasi):\n${JSON.stringify(facts, null, 2)}\n\nBerikut adalah ${validDrafts.length} draf rancangan struktur dari dokumen BRD:\nSilakan analisa, ambil keputusan terbanyak/terbaik (majority voting), verifikasi terhadap facts di atas, dan hasilkan 1 JSON final:\n\n${draftsContent}`
      },
    ],
    temperature: 0,
    max_tokens: 32000,
  };

  const aggregatorResponse = await fetch(apiUrl, {
    method: "POST",
    headers: fetchHeaders,
    body: JSON.stringify(aggregatorBody),
  });

  if (!aggregatorResponse.ok) {
    const errText = await aggregatorResponse.text().catch(() => "");
    throw new Error(`Aggregator AI API error (${aggregatorResponse.status}): ${errText}`);
  }

  const aggregatorData = await aggregatorResponse.json();
  const content = aggregatorData.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response is empty at aggregator.");
  }

  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  let rawResult: any;
  try {
    rawResult = JSON.parse(jsonStr);
  } catch (e) {
    const bracketCount = (jsonStr.match(/{/g) || []).length - (jsonStr.match(/}/g) || []).length;
    if (bracketCount > 0) {
      jsonStr += "\n}".repeat(bracketCount);
      const arrayOpen = (jsonStr.match(/\[/g) || []).length;
      const arrayClose = (jsonStr.match(/\]/g) || []).length;
      if (arrayOpen > arrayClose) {
        jsonStr += "\n]".repeat(arrayOpen - arrayClose);
      }
    }
    try {
      rawResult = JSON.parse(jsonStr);
    } catch {
      console.error("[aggregateDrafts] JSON repair failed, returning fallback structure.");
      const nameMatch = jsonStr.match(/"projectName"\s*:\s*"([^"]+)"/);
      rawResult = {
        reasoning: "Struktur tidak lengkap atau rusak parah pada tahap agregasi.",
        final_result: {
          projectName: nameMatch ? nameMatch[1] : "Project",
          tasks: [],
        }
      };
    }
  }

  const validated = validateAggregatedResult(rawResult);

  const numTasks = validated.final_result.tasks.length;
  const numSubtasks = validated.final_result.tasks.reduce(
    (sum: number, t: any) => sum + (t.subTasks?.length || 0), 0
  );
  const numNeedsReview = validated.final_result.tasks.filter((t: any) => t.needsReview).length +
    validated.final_result.tasks.reduce(
      (sum: number, t: any) => sum + (t.subTasks?.filter((st: any) => st.needsReview).length || 0), 0
    );

  console.log(`[aggregateDrafts] Selesai. Final: ${numTasks} tasks, ${numSubtasks} subtasks, ${numNeedsReview} item ditandai needsReview.`);

  return validated;
}

/**
 * Process BRD text using DeepSeek (or any OpenAI-compatible) API.
 * Returns structured task breakdown, modules, and mermaid diagram syntax.
 */
export async function processWithAi(text: string): Promise<{
  projectName: string;
  tasks: any[];
  modules: any[];
  mermaidSyntax: string;
  nodeDetails: Record<string, any>;
  drafts: any[];
  reasoning: string;
  erdMermaid: string;
  flowMermaid: string;
  facts: ExtractedFacts;
}> {
  const provider = await getActiveProvider();
  if (!provider) {
    throw new Error("No active AI provider configured");
  }

  const apiUrl = provider.baseUrl.endsWith("/chat/completions")
    ? provider.baseUrl
    : `${provider.baseUrl}/chat/completions`;

  const fetchHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${provider.keyValue}`,
  };

  const facts = await extractFacts(text, provider, apiUrl, fetchHeaders);

  const isFactsEmpty = facts.roles.length === 0 && facts.requirements.length === 0 &&
    facts.wireframeFields.length === 0 && facts.businessProcess.length === 0;
  if (isFactsEmpty) {
    console.warn("[processWithAi] PERINGATAN: extractFacts() mengembalikan hasil kosong total. Draft generation akan berjalan TANPA grounding — risiko halusinasi tinggi.");
  }

  const draftPromises = [];
  for (let i = 0; i < 5; i++) {
    draftPromises.push(generateDraft(0.1 + (i * 0.1), facts, text, provider, apiUrl, fetchHeaders));
  }

  const draftResults = await Promise.allSettled(draftPromises);
  const validDrafts = draftResults
    .filter((res) => res.status === "fulfilled" && res.value.trim().length > 0)
    .map((res) => (res as PromiseFulfilledResult<string>).value);

  if (validDrafts.length === 0) {
    throw new Error("Gagal menghasilkan satupun draft rancangan dari AI.");
  }

  if (validDrafts.length < 3) {
    console.warn(`[processWithAi] PERINGATAN: hanya ${validDrafts.length}/5 draft berhasil dibuat. Majority voting di tahap agregasi mungkin kurang reliable.`);
  }

  const result = await aggregateDrafts(validDrafts, facts, provider, apiUrl, fetchHeaders);

  const reasoning = result.reasoning;
  const finalData = result.final_result;

  const diagramPrompt = `Berdasarkan struktur JSON tugas/modul proyek berikut, buatlah diagram spesifik menggunakan sintaks Mermaid.js.\nStruktur Proyek:\n${JSON.stringify(finalData, null, 2)}`;

  const erdBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: "Buat Entity Relationship Diagram (ERD) dari struktur data yang dibutuhkan oleh sistem ini. Gunakan sintaks Mermaid `erDiagram`. PENTING: Nama entitas TIDAK BOLEH mengandung spasi atau karakter khusus (gunakan underscore). Atribut tidak boleh mengandung tanda kurung. Output HARUS murni kode mermaid saja, tanpa teks pengantar, dan tanpa dibungkus markdown ```mermaid. Pastikan relasi dan atribut jelas." },
      { role: "user", content: diagramPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  };

  const flowBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: "Buat User Flow Diagram (Bagan Alur Pengguna) tingkat tinggi dari aplikasi ini. Gunakan sintaks Mermaid `flowchart TD` atau `graph TD`. PENTING: Jika label node mengandung spasi atau tanda kurung, WAJIB dibungkus tanda kutip ganda, contoh: A[\"Label (Opsional)\"]. Output HARUS murni kode mermaid saja, tanpa teks pengantar, dan tanpa dibungkus markdown ```mermaid." },
      { role: "user", content: diagramPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  };

  const [erdRes, flowRes] = await Promise.allSettled([
    fetch(apiUrl, { method: "POST", headers: fetchHeaders, body: JSON.stringify(erdBody) }),
    fetch(apiUrl, { method: "POST", headers: fetchHeaders, body: JSON.stringify(flowBody) })
  ]);

  let erdMermaid = "";
  let flowMermaid = "";

  if (erdRes.status === "fulfilled" && erdRes.value.ok) {
    const data = await erdRes.value.json();
    erdMermaid = (data.choices?.[0]?.message?.content || "").replace(/```mermaid\n?|```/g, "").trim();
  }
  if (flowRes.status === "fulfilled" && flowRes.value.ok) {
    const data = await flowRes.value.json();
    flowMermaid = (data.choices?.[0]?.message?.content || "").replace(/```mermaid\n?|```/g, "").trim();
  }

  if (!erdMermaid.includes("erDiagram")) erdMermaid = "erDiagram\n  PROJECT ||--o{ MODULE : contains";
  if (!flowMermaid.includes("graph ") && !flowMermaid.includes("flowchart ")) flowMermaid = "flowchart TD\n  Start --> End";

  const mermaidSyntax = buildMermaidSyntax(finalData.projectName || "Project", finalData.tasks || []);
  const nodeDetails = buildNodeDetails(finalData.tasks || []);
  const modules = (finalData.tasks || []).map((t: any) => ({
    name: t.title,
    screens: (t.subTasks || []).map((st: any) => st.title),
  }));

  console.log(`[processWithAi] Pipeline selesai. Draft berhasil: ${validDrafts.length}/5, Total tasks: ${(finalData.tasks || []).length}.`);

  return {
    projectName: finalData.projectName || "Project",
    tasks: finalData.tasks || [],
    modules,
    mermaidSyntax,
    nodeDetails,
    drafts: validDrafts.map((d) => {
      const match = d.match(/```(?:json)?\s*([\s\S]*?)```/);
      const str = match ? match[1] : d;
      try { return JSON.parse(str); } catch { return { raw: d }; }
    }),
    reasoning,
    erdMermaid,
    flowMermaid,
    facts,
  };
}

function buildMermaidSyntax(projectName: string, tasks: any[]): string {
  const moduleLetters = "BCDEFGHIJ";
  let mermaid = "graph LR\n";
  mermaid += `  A["${projectName}"]\n`;

  const moduleColors = [
    { bg: "#dbeafe", fg: "#1e3a5f" },
    { bg: "#d1fae5", fg: "#14532d" },
    { bg: "#fef3c7", fg: "#78350f" },
    { bg: "#e0e7ff", fg: "#312e81" },
    { bg: "#fce7f3", fg: "#831843" },
    { bg: "#d1d5db", fg: "#1f2937" },
    { bg: "#ede9fe", fg: "#4c1d95" },
    { bg: "#ccfbf1", fg: "#134e4a" },
    { bg: "#fef2f2", fg: "#991b1b" },
    { bg: "#fef9c3", fg: "#713f12" },
  ];

  tasks.forEach((t, i) => {
    const letter = moduleLetters[i] || String.fromCharCode(66 + i);
    mermaid += `  A --> ${letter}["${t.title}"]\n`;
    (t.subTasks || []).forEach((st: any, si: number) => {
      const nodeId = `${letter}${si + 1}`;
      mermaid += `  ${letter} --> ${nodeId}["${st.title}"]\n`;
      (st.elements || []).forEach((el: string, ei: number) => {
        const compId = `${nodeId}${String.fromCharCode(97 + ei)}`;
        mermaid += `  ${nodeId} --> ${compId}["${el}"]\n`;
      });
    });
  });

  mermaid += `\n  style A fill:#18181b,color:#fff\n`;
  tasks.forEach((t, i) => {
    const letter = moduleLetters[i] || String.fromCharCode(66 + i);
    const color = moduleColors[i % moduleColors.length];
    mermaid += `  style ${letter} fill:${color.bg},color:${color.fg}\n`;
  });

  return mermaid;
}

function buildNodeDetails(tasks: any[]): Record<string, any> {
  const details: Record<string, any> = {};
  const moduleLetters = "BCDEFGHIJ";

  details["A"] = {
    description: "Proyek utama dari hasil analisis BRD.",
    goals: ["Implementasi semua kebutuhan bisnis", "UI/UX yang intuitif dan responsif"],
    definitionOfDone: "Aplikasi selesai, diuji, dan siap produksi.",
  };

  tasks.forEach((t, i) => {
    const letter = moduleLetters[i] || String.fromCharCode(66 + i);
    details[letter] = {
      description: t.description || `Modul ${t.title}`,
      goals: t.goals || [],
      definitionOfDone: t.definitionOfDone || "",
    };

    (t.subTasks || []).forEach((st: any, si: number) => {
      const nodeId = `${letter}${si + 1}`;
      details[nodeId] = {
        description: st.description || "",
        goals: st.goals || [],
        definitionOfDone: st.definitionOfDone || "",
      };

      (st.elements || []).forEach((el: string, ei: number) => {
        const compId = `${nodeId}${String.fromCharCode(97 + ei)}`;
        details[compId] = {
          description: `Elemen UI: ${el}`,
          goals: ["Berfungsi sesuai spesifikasi"],
          definitionOfDone: `${el} selesai dan responsif.`,
        };
      });
    });
  });

  return details;
}

/**
 * Regenerates the ERD, Flow, and Module Architecture diagrams based on updated tasks.
 */
export async function generateDiagramsForTasks(projectName: string, tasks: any[]): Promise<{
  erdMermaid: string;
  flowMermaid: string;
  mermaidSyntax: string;
  nodeDetails: Record<string, any>;
  modules: any[];
}> {
  const provider = await getActiveProvider();
  if (!provider) {
    throw new Error("No active AI provider configured");
  }

  const apiUrl = `${provider.baseUrl}/v1/chat/completions`;
  const fetchHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.keyValue}`,
  };

  const finalData = { projectName, tasks };
  const diagramPrompt = `Berdasarkan struktur JSON tugas/modul proyek berikut, buatlah diagram spesifik menggunakan sintaks Mermaid.js.\nStruktur Proyek:\n${JSON.stringify(finalData, null, 2)}`;

  const erdBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: "Buat Entity Relationship Diagram (ERD) dari struktur data yang dibutuhkan oleh sistem ini. Gunakan sintaks Mermaid `erDiagram`. PENTING: Nama entitas TIDAK BOLEH mengandung spasi atau karakter khusus (gunakan underscore). Atribut tidak boleh mengandung tanda kurung. Output HARUS murni kode mermaid saja, tanpa teks pengantar, dan tanpa dibungkus markdown ```mermaid. Pastikan relasi dan atribut jelas." },
      { role: "user", content: diagramPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  };

  const flowBody = {
    model: provider.model || "deepseek-v4-pro",
    messages: [
      { role: "system", content: "Buat User Flow Diagram (Bagan Alur Pengguna) tingkat tinggi dari aplikasi ini. Gunakan sintaks Mermaid `flowchart TD` atau `graph TD`. PENTING: Jika label node mengandung spasi atau tanda kurung, WAJIB dibungkus tanda kutip ganda, contoh: A[\"Label (Opsional)\"]. Output HARUS murni kode mermaid saja, tanpa teks pengantar, dan tanpa dibungkus markdown ```mermaid." },
      { role: "user", content: diagramPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  };

  const [erdRes, flowRes] = await Promise.allSettled([
    fetch(apiUrl, { method: "POST", headers: fetchHeaders, body: JSON.stringify(erdBody) }),
    fetch(apiUrl, { method: "POST", headers: fetchHeaders, body: JSON.stringify(flowBody) })
  ]);

  let erdMermaid = "";
  let flowMermaid = "";

  if (erdRes.status === "fulfilled" && erdRes.value.ok) {
    const data = await erdRes.value.json();
    const content = data.choices?.[0]?.message?.content || "";
    erdMermaid = content.replace(/```mermaid\n?|```/g, "").trim();
  }

  if (flowRes.status === "fulfilled" && flowRes.value.ok) {
    const data = await flowRes.value.json();
    const content = data.choices?.[0]?.message?.content || "";
    flowMermaid = content.replace(/```mermaid\n?|```/g, "").trim();
  }

  if (!erdMermaid.includes("erDiagram")) erdMermaid = "erDiagram\n  PROJECT ||--o{ MODULE : contains";
  if (!flowMermaid.includes("graph ") && !flowMermaid.includes("flowchart ")) flowMermaid = "flowchart TD\n  Start --> End";

  const mermaidSyntax = buildMermaidSyntax(projectName, tasks);
  const nodeDetails = buildNodeDetails(tasks);
  const modules = tasks.map((t: any) => ({
    name: t.title,
    screens: (t.subTasks || []).map((st: any) => st.title),
  }));

  return {
    erdMermaid,
    flowMermaid,
    mermaidSyntax,
    nodeDetails,
    modules,
  };
}
