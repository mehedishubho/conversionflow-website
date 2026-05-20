import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/lib/seo.ts';
let content = readFileSync(filePath, 'utf8');

const startMarker = 'export function organizationSchema(overrides?: Record<string, string>)';
const endMarker = '/**\n * Schema settings stored in the DB as tracking keys.';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('ERROR: Markers not found', { startIdx, endIdx });
  process.exit(1);
}

const replacement = 'export { organizationSchema, websiteSchema, productSchema, breadcrumbSchema } from "@/lib/schema-helpers";\n\n';

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
writeFileSync(filePath, newContent);
console.log('SUCCESS: seo.ts updated');
