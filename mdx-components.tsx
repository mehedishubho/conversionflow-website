import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Documentation-specific MDX components can be added here
    // For example: custom code blocks, callouts, etc.
  };
}
