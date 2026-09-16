const pageName = process.argv[2];

if (!pageName || !/^[a-z][a-z0-9-]*$/.test(pageName)) {
  console.error("Usage: bun run page:create <kebab-case-page-name>");
  process.exit(1);
}

const target = `src/pages/${pageName}`;
const file = Bun.file(`${target}/index.tsx`);
if (await file.exists()) {
  console.error(`Page already exists: ${target}`);
  process.exit(1);
}

await Bun.write(
  file,
  `<route lang="yaml">\nmeta:\n  layout: default\n  title: ${pageName}\n</route>\n\nexport default function ${pageName.replace(/(^|-)([a-z])/g, (_, _dash, letter) => letter.toUpperCase())}Page() {\n  return <section aria-label="${pageName}">${pageName}</section>;\n}\n`,
);
console.log(`Created ${target}/index.tsx`);
