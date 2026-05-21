-- ============================================
-- Phase 12 Database Setup
-- Advanced SEO Controls Tables
-- ============================================
-- Run this SQL in your PostgreSQL database to create
-- the tables required for Phase 12 functionality.
--
-- Tables included:
-- - redirects (for Redirect Manager)
-- - blog_categories (for blog system)
-- - blog_posts (for blog system)
--
-- After running this, the following features will work:
-- - Redirect Manager (12-01)
-- - Page-Level SEO with blog integration (12-05)
-- ============================================

-- Create ENUM types if they don't exist
DO $$ BEGIN
    CREATE TYPE redirect_type AS ENUM ('301', '302');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE redirect_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE blog_post_status AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- redirects table
-- ============================================
CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_url TEXT NOT NULL,
    to_url TEXT NOT NULL,
    type redirect_type NOT NULL DEFAULT '301',
    is_regex BOOLEAN NOT NULL DEFAULT false,
    hit_count INTEGER NOT NULL DEFAULT 0,
    status redirect_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for redirects
CREATE INDEX IF NOT EXISTS redirects_from_url_idx ON redirects(from_url);
CREATE INDEX IF NOT EXISTS redirects_status_idx ON redirects(status);

-- ============================================
-- blog_categories table
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    locale TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (slug, locale)
);

-- Index for blog_categories
CREATE INDEX IF NOT EXISTS blog_categories_locale_idx ON blog_categories(locale);

-- ============================================
-- blog_posts table
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_name TEXT NOT NULL,
    locale TEXT NOT NULL,
    status blog_post_status NOT NULL DEFAULT 'draft',
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    seo_overrides JSONB,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (slug, locale)
);

-- Indexes for blog_posts
CREATE INDEX IF NOT EXISTS blog_posts_locale_idx ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts(status);

-- ============================================
-- Trigger for updated_at on redirects
-- ============================================
CREATE OR REPLACE FUNCTION update_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_redirects_updated_at ON redirects;
CREATE TRIGGER trigger_update_redirects_updated_at
    BEFORE UPDATE ON redirects
    FOR EACH ROW
    EXECUTE FUNCTION update_redirects_updated_at();

-- ============================================
-- Trigger for updated_at on blog_categories
-- ============================================
CREATE OR REPLACE FUNCTION update_blog_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER trigger_update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_categories_updated_at();

-- ============================================
-- Trigger for updated_at on blog_posts
-- ============================================
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- ============================================
-- Verification queries (uncomment to check)
-- ============================================
-- \d redirects
-- \d blog_categories
-- \d blog_posts
-- SELECT COUNT(*) FROM redirects;
-- SELECT COUNT(*) FROM blog_categories;
-- SELECT COUNT(*) FROM blog_posts;

-- ============================================
-- Sample data for testing (optional)
-- ============================================
-- INSERT INTO redirects (from_url, to_url, type, is_regex, status) VALUES
-- ('/old-page', '/new-page', '301', false, 'active'),
-- ('/blog/.*', '/articles/$1', '301', true, 'active');

-- INSERT INTO blog_categories (name, slug, locale, description) VALUES
-- ('Tutorials', 'tutorials', 'en', 'Step-by-step guides'),
-- ('টিউটোরিয়াল', 'tutorials', 'bn', 'ধাপে ধাপে গাইড');
