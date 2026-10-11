import { assertEquals } from "jsr:@std/assert@1";
import { readBoundedBody } from "./bounded-request-body.ts";

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

Deno.test("reads bounded stream chunks into one byte array", async () => {
  const result = await readBoundedBody(streamOf(['{"a":', '"b"}']));
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(new TextDecoder().decode(result.bytes), '{"a":"b"}');
});

Deno.test("rejects an oversized streamed body even without Content-Length", async () => {
  const result = await readBoundedBody(streamOf(["x".repeat(9000), "y".repeat(9000)]));
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.status, 413);
});

Deno.test("supports an empty request body", async () => {
  const result = await readBoundedBody(null);
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.bytes.byteLength, 0);
});
