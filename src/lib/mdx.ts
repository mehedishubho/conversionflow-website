import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readingTime: number;
}

export interface DocPostMeta {
  slug: string;
  title: string;
  category: string;
  order: number;
}

export function getBlogPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const words = content.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        excerpt: data.excerpt as string,
        readingTime: Math.ceil(words / 200),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getDocPosts(): DocPostMeta[] {
  const files = fs.readdirSync(DOCS_DIR).filter((file) => file.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
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
