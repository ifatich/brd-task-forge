import { prisma } from "@/lib/db";

/**
 * Load active knowledge files and format them as context prepended to BRD text.
 */
export async function enrichWithKnowledge(text: string): Promise<string> {
  try {
    const files = await prisma.knowledgeFile.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    if (files.length === 0) return text;

    const sections = files.map(
      (f) => `[CONTEXT: ${f.name}] [TYPE: ${f.type}]\n${f.content}\n[/CONTEXT]`
    );

    return sections.join("\n\n") + "\n\n--- BRD CONTENT ---\n\n" + text;
  } catch {
    // If the knowledge table doesn't exist or any error, just return original text
    return text;
  }
}
