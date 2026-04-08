/**
 * 火山方舟（豆包）接入 — 环境变量
 *
 * 必填：ARK_API_KEY（控制台 API Key）
 * 可选：ARK_BASE_URL，默认 https://ark.cn-beijing.volces.com/api/v3
 * 可选：ARK_MODEL，覆盖代码里的默认模型 / 接入点 ID
 */

const DEFAULT_ARK_BASE = "https://ark.cn-beijing.volces.com/api/v3";

export function getArkEnvOrError():
  | { ok: true; apiKey: string; baseUrl: string }
  | { ok: false; message: string } {
  const apiKey = process.env.ARK_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      message:
        "缺少环境变量 ARK_API_KEY（火山方舟 API Key）。请在方舟控制台创建密钥并配置到部署环境后重新部署。",
    };
  }

  const baseUrl = (process.env.ARK_BASE_URL?.trim() || DEFAULT_ARK_BASE).replace(/\/$/, "");
  return { ok: true, apiKey, baseUrl };
}
