-- Performance Optimization Indexes for ConversionFlow Database
-- These indexes address critical performance bottlenecks identified in the schema

-- ──────────────────────────────────────────────
-- MISSING CRITICAL INDEXES
-- ──────────────────────────────────────────────

-- 1. ORDERS table - Most queried table for customer dashboard
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_status_idx ON orders(user_id, status); -- Composite for dashboard queries

-- 2. LICENSES table - Critical for license validation (high frequency)
CREATE INDEX IF NOT EXISTS licenses_user_id_idx ON licenses(user_id);
CREATE INDEX IF NOT EXISTS licenses_status_idx ON licenses(status);
CREATE INDEX IF NOT EXISTS licenses_product_id_idx ON licenses(product_id);
CREATE INDEX IF NOT EXISTS licenses_user_status_idx ON licenses(user_id, status); -- For user license list
CREATE INDEX IF NOT EXISTS expires_at_idx ON licenses(expires_at); -- For expiration cleanup job

-- 3. BLOG_POSTS table - Critical for blog performance
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_status_locale_idx ON blog_posts(status, locale); -- Composite for public blog
CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts(category_id);

-- 4. NOTIFICATIONS table - Critical for user notification fetch
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read); -- For unread count
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- 5. TICKETS table - Support dashboard performance
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON tickets(user_id);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(createdAt DESC);
CREATE INDEX IF NOT EXISTS tickets_user_status_idx ON tickets(user_id, status);

-- 6. DOWNLOADS table - Access control and cleanup
CREATE INDEX IF NOT EXISTS downloads_user_id_idx ON downloads(user_id);
CREATE INDEX IF NOT EXISTS downloads_expires_at_idx ON downloads(expires_at); -- For cleanup job

-- 7. WEBHOOK_DELIVERIES table - Monitoring and retry logic
CREATE INDEX IF NOT EXISTS webhook_deliveries_webhook_id_idx ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS webhook_deliveries_success_idx ON webhook_deliveries(success);
CREATE INDEX IF NOT EXISTS webhook_deliveries_created_at_idx ON webhook_deliveries(createdAt);

-- 8. AUDIT_LOGS table - Compliance and security queries
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(createdAt DESC);
CREATE INDEX IF NOT EXISTS audit_logs_target_idx ON audit_logs(target_type, target_id); -- For entity history

-- 9. COUPONS table - E-commerce performance
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code); -- Already unique, but index helps lookup
CREATE INDEX IF NOT EXISTS coupons_active_idx ON coupons(active);
CREATE INDEX IF NOT EXISTS coupons_expires_at_idx ON coupons(expires_at); -- For cleanup job

-- ──────────────────────────────────────────────
-- PARTIAL INDEXES (Better Performance, Less Space)
-- ──────────────────────────────────────────────

-- Only index active redirects (most queries only need active ones)
CREATE INDEX IF NOT EXISTS redirects_active_status_idx ON redirects(fromUrl)
WHERE status = 'active';

-- Only index published blog posts (public blog only shows published)
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts(published_at DESC)
WHERE status = 'published';

-- Only index unread notifications (most common query)
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(user_id, created_at DESC)
WHERE read = false;

-- Only index active coupons
CREATE INDEX IF NOT EXISTS coupons_active_valid_idx ON coupons(code, expires_at)
WHERE active = true AND (expires_at IS NULL OR expires_at > NOW());

-- ──────────────────────────────────────────────
-- GIN INDEXES for JSONB columns
-- ──────────────────────────────────────────────

-- For searching blog post tags
CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON blog_posts USING GIN (tags);

-- For webhook event matching
CREATE INDEX IF NOT EXISTS webhooks_events_idx ON webhooks USING GIN (events);

-- For license activation domains queries
CREATE INDEX IF NOT EXISTS licenses_activation_domains_idx ON licenses USING GIN (activation_domains);

-- ──────────────────────────────────────────────
-- TEXT SEARCH INDEXES
-- ──────────────────────────────────────────────

-- Full-text search for blog posts
CREATE INDEX IF NOT EXISTS blog_posts_title_search_idx ON blog_posts USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS blog_posts_content_search_idx ON blog_posts USING GIN (to_tsvector('english', content));

-- Full-text search for tickets
CREATE INDEX IF NOT EXISTS tickets_subject_search_idx ON tickets USING GIN (to_tsvector('english', subject));
CREATE INDEX IF NOT EXISTS tickets_description_search_idx ON tickets USING GIN (to_tsvector('english', description));

-- ──────────────────────────────────────────────
-- CONCURRENT INDEX CREATION (Safe for production)
-- ──────────────────────────────────────────────

-- Note: In production, create indexes concurrently to avoid table locks:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS ...
-- But for migration files, regular CREATE INDEX is fine