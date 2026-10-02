const fs = require("node:fs");
const path = require("node:path");

const expected = [
  "claimsdesk-modernization.json",
  "clinical-intake-and-patient-support-assistant.json",
  "member-experience-modernisation-early-discovery.json",
  "unified-supply-chain-analytics.json",
];

const directory = path.resolve(process.argv[2] || "official-inputs");
const failures = [];
const packages = [];

for (const filename of expected) {
  const file = path.join(directory, filename);
  if (!fs.existsSync(file)) {
    failures.push(`${filename}: missing`);
    continue;
  }
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!value || Array.isArray(value) || typeof value !== "object") {
      failures.push(`${filename}: root must be a JSON object`);
      continue;
    }
    packages.push({
      filename,
      rootKeys: Object.keys(value).sort(),
      bytes: fs.statSync(file).size,
    });
  } catch (error) {
    failures.push(`${filename}: invalid JSON (${error.message})`);
  }
}

const result = { directory, expected: expected.length, valid: packages.length, packages, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
