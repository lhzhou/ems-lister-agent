const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const pageName = args.find((arg) => !arg.startsWith("--"));

if (!pageName || !/^[a-z][a-z0-9-]*$/.test(pageName)) {
  console.error("Usage: bun run page:create <kebab-case-page-name> [--dry-run] [--force]");
  process.exit(1);
}

const pascal = pageName.replace(/(^|-)([a-z])/g, (_, _dash, letter) => letter.toUpperCase());
const target = `src/pages/${pageName}`;
const filePath = `${target}/index.tsx`;
const template = `/** @route
meta:
  layout: default
  title: ${pageName}
*/

export default function ${pascal}Page() {
  return <section aria-label="${pageName}">${pageName}</section>;
}
`;

if (dryRun) {
  console.log(`Would create ${filePath}`);
  process.exit(0);
}

const file = Bun.file(filePath);
if ((await file.exists()) && !force) {
  console.error(`Page already exists: ${target} (pass --force to overwrite)`);
  process.exit(1);
}

await Bun.write(file, template);
console.log(`Created ${filePath}`);
