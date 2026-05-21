-- Add seo_overrides column to blog_posts table
-- This migration adds the JSONB column for storing page-level SEO overrides
-- Note: If the blog_posts table doesn't exist yet, it will be created via drizzle-kit push

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_overrides JSONB;

-- Create index on seo_overrides for efficient querying (optional, for GIN indexing)
-- CREATE INDEX IF NOT EXISTS blog_posts_seo_overrides_idx ON blog_posts USING GIN (seo_overrides);
