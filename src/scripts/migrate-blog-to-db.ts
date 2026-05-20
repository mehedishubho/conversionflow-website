/**
 * Migration script: reads MDX blog files from src/content/blog/
 * and inserts them into the blog_posts database table.
 *
 * Run with: npx tsx src/scripts/migrate-blog-to-db.ts
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("No blog content directory found. Nothing to migrate.");
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`Found ${files.length} MDX files to migrate.`);

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const title = (data.title as string) || slug;
    const excerpt = (data.excerpt as string) || "";
    const date = (data.date as string) || new Date().toISOString();

    const htmlContent = content
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("## "))
          return `<h2>${trimmed.slice(3)}</h2>`;
        if (trimmed.startsWith("### "))
          return `<h3>${trimmed.slice(4)}</h3>`;
        if (trimmed.startsWith("- "))
          return `<ul>${trimmed
            .split("\n")
            .map((l) => `<li>${l.slice(2)}</li>`)
            .join("")}</ul>`;
        if (/^\d+\.\s/.test(trimmed))
          return `<ol>${trimmed
            .split("\n")
            .map((l) => `<li>${l.replace(/^\d+\.\s/, "")}</li>`)
            .join("")}</ol>`;
        return `<p>${trimmed}</p>`;
      })
      .filter(Boolean)
      .join("\n");

    try {
      await db.insert(blogPosts).values({
        title,
        slug,
        content: htmlContent,
        excerpt,
        authorName: "ConversionFlow Team",
        locale: "en",
        status: "published",
        publishedAt: new Date(date),
        tags: [],
      });
      console.log(`  Migrated: ${slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("unique") || msg.includes("duplicate")) {
        console.log(`  Skipped (already exists): ${slug}`);
      } else {
        console.error(`  Error migrating ${slug}:`, msg);
      }
    }
  }

  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
