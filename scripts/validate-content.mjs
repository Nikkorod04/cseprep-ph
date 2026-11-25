import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "assets", "content", "v1");
const read = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));

const questionFiles = readdirSync(dir)
  .filter((name) => /^questions(-[a-z0-9]+)*\.json$/.test(name))
  .sort();

const questions = questionFiles.flatMap((name) => read(name));
const sections = read("sections.json");
const tips = read("tips.json");

const errors = [];
const warnings = [];

const ids = new Set();
const stems = new Set();
const sectionIds = new Set(sections.map((s) => s.id));
const topicIds = new Set(
  sections.flatMap((s) => s.topics.map((t) => `${s.id}:${t.id}`)),
);
for (const q of questions) {
  const where = q.id ?? "(missing id)";

  if (!/^[a-z0-9]+(-[a-z0-9]+){2,}-\d{4}$/.test(q.id ?? "")) {
    errors.push(`${where}: bad id format`);
  }
  if (ids.has(q.id)) errors.push(`${where}: duplicate id`);
  ids.add(q.id);

  const stemKey = (q.stem ?? "").trim();
  if (stemKey.length >= 40) {
    if (stems.has(stemKey)) errors.push(`${where}: duplicate stem`);
    stems.add(stemKey);
  }

  if (!sectionIds.has(q.section)) errors.push(`${where}: unknown section`);
  if (!topicIds.has(`${q.section}:${q.topic}`)) {
    errors.push(`${where}: unknown topic ${q.section}:${q.topic}`);
  }

  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    errors.push(`${where}: needs exactly 4 choices`);
  } else {
    const keys = q.choices.map((c) => c.key).join("");
    if (keys !== "ABCD") errors.push(`${where}: keys must be A,B,C,D (got ${keys})`);
    if (!q.choices.some((c) => c.key === q.answer)) {
      errors.push(`${where}: answer not among choices`);
    }
    if (new Set(q.choices.map((c) => c.text)).size !== 4) {
      errors.push(`${where}: duplicate choice text`);
    }
    if (q.choices.some((c) => !c.text || !c.text.trim())) {
      errors.push(`${where}: empty choice text`);
    }
  }

  if (![1, 2, 3].includes(q.difficulty)) {
    errors.push(`${where}: difficulty must be 1, 2, or 3`);
  }

  if (!q.explanation) {
    errors.push(`${where}: missing explanation`);
  } else if (q.explanation.split(/\s+/).length > 70) {
    errors.push(`${where}: explanation longer than 70 words`);
  }

  if (!Array.isArray(q.tracks) || q.tracks.length === 0) {
    errors.push(`${where}: no tracks`);
  }
  for (const track of q.tracks ?? []) {
    if (!["professional", "subprofessional"].includes(track)) {
      errors.push(`${where}: bad track ${track}`);
    }
  }

  if (q.section === "analytical" && !q.tracks?.includes("professional")) {
    errors.push(`${where}: analytical items must include professional`);
  }
  if (q.section === "clerical" && !q.tracks?.includes("subprofessional")) {
    errors.push(`${where}: clerical items must include subprofessional`);
  }
}

const counts = { A: 0, B: 0, C: 0, D: 0 };
for (const q of questions) counts[q.answer] = (counts[q.answer] ?? 0) + 1;

if (questions.length >= 20) {
  for (const [key, value] of Object.entries(counts)) {
    const share = value / questions.length;
    if (share > 0.4) {
      warnings.push(
        `answer ${key} is ${Math.round(share * 100)}% of items (aim for 25%)`,
      );
    }
  }
}

const tipSlugs = new Set();
for (const tip of tips) {
  if (!/^[a-z0-9-]+$/.test(tip.slug ?? "")) {
    errors.push(`tip ${tip.slug}: bad slug`);
  }
  if (tipSlugs.has(tip.slug)) errors.push(`tip ${tip.slug}: duplicate slug`);
  tipSlugs.add(tip.slug);
  if (tip.section !== "general" && !sectionIds.has(tip.section)) {
    errors.push(`tip ${tip.slug}: unknown section`);
  }
  if (!tip.body || tip.body.length < 100) {
    errors.push(`tip ${tip.slug}: body too short`);
  }
}

const bySection = Object.fromEntries(
  [...sectionIds].map((id) => [
    id,
    questions.filter((q) => q.section === id).length,
  ]),
);

console.log(`Questions: ${questions.length}`);
console.log("Files:", questionFiles.join(", "));
console.log("By section:", bySection);
console.log("Answer balance:", counts);
console.log("Tips:", tips.length);

for (const warning of warnings) console.log(`WARN  ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}

console.log("\nContent OK.");
