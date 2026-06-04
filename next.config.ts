import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const remarkGfm = "remark-gfm";
const rehypeSlug = "rehype-slug";
const rehypeAutolinkHeadings = "rehype-autolink-headings";

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});

export default withMDX(nextConfig);
