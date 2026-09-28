// Run against a local dev or production server: node scripts/check-landing.mjs [url]
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3000";

const landing = await fetch(base);
assert.equal(landing.status, 200);
const html = await landing.text();
assert.match(html, /Your classes\./);
assert.match(html, /name="id"/, "Missing student ID field");
assert.match(html, /type="submit"/);
for (const anchor of ["start", "how-it-works", "faq"]) {
  assert.ok(html.includes(`id="${anchor}"`), `Missing ${anchor} destination`);
}
assert.equal((html.match(/<details/g) ?? []).length, 6, "Expected six FAQ items");
assert.ok(html.includes('href="/changelog"'), "Missing changelog link");

const changelog = await fetch(new URL("/changelog", base));
assert.equal(changelog.status, 200);
assert.match(await changelog.text(), /What&#x27;s new\.|What's new\./);

console.log("Landing page smoke check passed.");
