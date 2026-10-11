export type BoundedBodyResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; status: 400 | 413; error: string };

export async function readBoundedBody(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes = 16_384,
): Promise<BoundedBodyResult> {
  if (!stream) return { ok: true, bytes: new Uint8Array() };
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: "Request body exceeds 16 KiB" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Unable to read request body" };
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}
