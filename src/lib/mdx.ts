import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

export interface DocPostMeta {
  slug: string;
  title: string;
  category: string;
  order: number;
}

export function getDocPosts(locale: string = "en"): DocPostMeta[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files = fs.readdirSync(DOCS_DIR).filter((file) => file.endsWith(".mdx"));

  // Create a map of base slug to available locales
  const slugsMap = new Map<string, Set<string>>();
  files.forEach(file => {
    const parts = file.split('.');
    const slug = parts[0];
    const isLocaleFile = parts.length === 3 && parts[1] !== 'mdx';
    const fileLocale = isLocaleFile ? parts[1] : 'en';

    if (!slugsMap.has(slug)) slugsMap.set(slug, new Set());
    slugsMap.get(slug)?.add(fileLocale);
  });

  const uniqueSlugs = Array.from(slugsMap.keys());

  return uniqueSlugs
    .map((slug) => {
      const availableLocales = slugsMap.get(slug);
      const targetLocale = (locale === "bn" && availableLocales?.has("bn")) ? "bn" : "en";
      const fileName = targetLocale === "bn" ? `${slug}.bn.mdx` : `${slug}.mdx`;

      const raw = fs.readFileSync(path.join(DOCS_DIR, fileName), "utf-8");
      const { data } = matter(raw);

      return {
        slug,
        title: data.title as string,
        category: data.category as string,
        order: data.order as number,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getMdxBySlug(slug: string, locale: string = "en") {
  const bnPath = path.join(DOCS_DIR, `${slug}.bn.mdx`);
  const enPath = path.join(DOCS_DIR, `${slug}.mdx`);

  let targetPath = enPath;
  if (locale === "bn" && fs.existsSync(bnPath)) {
    targetPath = bnPath;
  }

  if (!fs.existsSync(targetPath)) return null;

  const raw = fs.readFileSync(targetPath, "utf-8");
  return matter(raw);
}
