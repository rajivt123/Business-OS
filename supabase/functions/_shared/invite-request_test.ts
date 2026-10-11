import { assertEquals } from "jsr:@std/assert@1";
import { parseInviteRequestBody } from "./invite-request.ts";

function bytes(value: string): ArrayBuffer {
  return new TextEncoder().encode(value).buffer;
}

Deno.test("accepts an object body", () => {
  const result = parseInviteRequestBody(bytes(JSON.stringify({
    email: "team@example.com",
    role: "TEAM",
    tenant_id: "00000000-0000-0000-0000-000000000001",
    tenant_company_id: "00000000-0000-0000-0000-000000000002",
  })));
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.body.email, "team@example.com");
});

Deno.test("rejects malformed JSON", () => {
  assertEquals(parseInviteRequestBody(bytes("{")).ok, false);
});

Deno.test("rejects null, arrays, and primitive JSON", () => {
  for (const value of ["null", "[]", '"text"', "42", "true"]) {
    const result = parseInviteRequestBody(bytes(value));
    assertEquals(result.ok, false, `expected rejection for ${value}`);
  }
});

Deno.test("rejects request bodies above 16 KiB", () => {
  const result = parseInviteRequestBody(bytes(JSON.stringify({ data: "x".repeat(16_500) })));
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.status, 413);
});
