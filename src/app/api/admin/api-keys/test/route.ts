import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/api-keys/test
 * Body: { id } — or — { provider, keyValue, baseUrl? }
 * Tests the API key by making a small request to the provider.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let provider: string, keyValue: string, baseUrl: string;

    if (body.id) {
      const key = await prisma.apiKey.findUnique({ where: { id: body.id } });
      if (!key) {
        return NextResponse.json({ success: false, message: "API Key tidak ditemukan" }, { status: 404 });
      }
      provider = key.provider;
      keyValue = key.keyValue;
      baseUrl = key.baseUrl || getDefaultBaseUrl(key.provider);
    } else {
      provider = body.provider || "openai";
      keyValue = body.keyValue;
      baseUrl = body.baseUrl || getDefaultBaseUrl(provider);
    }

    if (!keyValue) {
      return NextResponse.json({ success: false, message: "API Key tidak tersedia" }, { status: 400 });
    }

    const result = await testConnection(provider, keyValue, baseUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Test connection failed:", error);
    return NextResponse.json({ success: false, message: "Gagal menguji koneksi: " + (error instanceof Error ? error.message : "Unknown error") });
  }
}

function getDefaultBaseUrl(provider: string): string {
  switch (provider) {
    case "openai": return "https://api.openai.com/v1";
    case "anthropic": return "https://api.anthropic.com/v1";
    case "gemini": return "https://generativelanguage.googleapis.com/v1beta";
    case "deepseek": return "https://api.deepseek.com";
    case "huggingface": return "https://api-inference.huggingface.co/models";
    default: return "https://api.deepseek.com";
  }
}

async function testConnection(provider: string, keyValue: string, baseUrl: string): Promise<{ success: boolean; message: string; latency?: number }> {
  const start = Date.now();

  try {
    switch (provider) {
      case "deepseek": {
        const res = await fetch(`${baseUrl}/models`, {
          headers: { Authorization: `Bearer ${keyValue}` },
        });
        const latency = Date.now() - start;
        if (res.ok) {
          return { success: true, message: "Terhubung — DeepSeek API aktif", latency };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `Gagal (${res.status}): ${err.error?.message || res.statusText}`, latency };
      }

      case "openai": {
        const res = await fetch(`${baseUrl}/models`, {
          headers: { Authorization: `Bearer ${keyValue}` },
        });
        const latency = Date.now() - start;
        if (res.ok) {
          return { success: true, message: "Terhubung — OpenAI API aktif", latency };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `Gagal (${res.status}): ${err.error?.message || res.statusText}`, latency };
      }

      case "anthropic": {
        const res = await fetch(`${baseUrl}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": keyValue,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        const latency = Date.now() - start;
        if (res.ok) {
          return { success: true, message: "Terhubung — Anthropic API aktif", latency };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `Gagal (${res.status}): ${err.error?.message || res.statusText}`, latency };
      }

      case "gemini": {
        const res = await fetch(`${baseUrl}/models/gemini-3.1-pro-preview?key=${keyValue}`, {
          headers: { "Content-Type": "application/json" },
        });
        const latency = Date.now() - start;
        if (res.ok) {
          return { success: true, message: "Terhubung — Gemini API aktif", latency };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `Gagal (${res.status}): ${err.error?.message || res.statusText}`, latency };
      }

      default: {
        // Generic test — try a simple GET
        const res = await fetch(baseUrl, {
          headers: { Authorization: `Bearer ${keyValue}` },
        });
        const latency = Date.now() - start;
        if (res.ok || res.status === 404) {
          return { success: true, message: `Terhubung — ${provider} API aktif`, latency };
        }
        return { success: false, message: `Gagal (${res.status}): ${res.statusText}`, latency };
      }
    }
  } catch (error) {
    const latency = Date.now() - start;
    return {
      success: false,
      message: `Tidak dapat terhubung: ${error instanceof Error ? error.message : "Network error"}`,
      latency,
    };
  }
}
