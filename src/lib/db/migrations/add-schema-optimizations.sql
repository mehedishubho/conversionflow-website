-- Schema Optimization Improvements for ConversionFlow Database
-- These changes improve data integrity, add missing constraints, and optimize storage

-- ──────────────────────────────────────────────
-- ADD MISSING FOREIGN KEY CONSTRAINTS
-- ──────────────────────────────────────────────

-- Orders should reference users table
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS orders_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Licenses should reference users table
ALTER TABLE licenses
ADD CONSTRAINT IF NOT EXISTS licenses_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Downloads should reference users table
ALTER TABLE downloads
ADD CONSTRAINT IF NOT EXISTS downloads_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Tickets should reference users table
ALTER TABLE tickets
ADD CONSTRAINT IF NOT EXISTS tickets_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Ticket messages should reference users table
ALTER TABLE ticket_messages
ADD CONSTRAINT IF NOT EXISTS ticket_messages_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- Notifications should reference users table
ALTER TABLE notifications
ADD CONSTRAINT IF NOT EXISTS notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────
-- ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- ──────────────────────────────────────────────

-- Ensure order amounts are positive
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS orders_amount_positive
CHECK (amount > 0);

-- Ensure discount amounts are non-negative
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS orders_discount_amount_positive
CHECK (discount_amount >= 0);

-- Ensure tax amounts are non-negative
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS orders_tax_amount_positive
CHECK (tax_amount >= 0);

-- Ensure coupon values are positive
ALTER TABLE coupons
ADD CONSTRAINT IF NOT EXISTS coupons_value_positive
CHECK (value > 0);

-- Ensure current uses don't exceed max uses
ALTER TABLE coupons
ADD CONSTRAINT IF NOT EXISTS coupons_current_uses_valid
CHECK (current_uses <= max_uses OR max_uses IS NULL);

-- Ensure license activations don't exceed maximum
ALTER TABLE licenses
ADD CONSTRAINT IF NOT EXISTS licenses_activations_valid
CHECK (current_activations <= max_activations);

-- Ensure hit counts are non-negative
ALTER TABLE redirects
ADD CONSTRAINT IF NOT EXISTS redirects_hit_count_positive
CHECK (hit_count >= 0);

ALTER TABLE seo_404_errors
ADD CONSTRAINT IF NOT EXISTS seo_404_errors_hit_count_positive
CHECK (hit_count >= 0);

-- ──────────────────────────────────────────────
-- OPTIMIZE DATA TYPES FOR STORAGE EFFICIENCY
-- ──────────────────────────────────────────────

-- Note: These require careful data migration and should be tested thoroughly
-- Uncomment after backing up your data and testing in staging

/*
-- Change text columns with limited values to enums for better performance
ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'BDT';
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS orders_currency_valid
CHECK (currency IN ('BDT', 'USD', 'EUR', 'GBP'));

-- Change timestamp columns to NOT NULL where appropriate
ALTER TABLE orders ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE orders ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add NOT NULL constraints to critical fields
ALTER TABLE blog_posts ALTER COLUMN excerpt SET NOT NULL;
ALTER TABLE blog_posts ALTER COLUMN author_name SET NOT NULL;
*/

-- ──────────────────────────────────────────────
-- ADD TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ──────────────────────────────────────────────

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need automatic timestamp updates
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_accounts_updated_at BEFORE UPDATE ON payment_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON redirects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- ADD VIEWS FOR COMMON QUERIES
-- ──────────────────────────────────────────────

-- View for active licenses with user info
CREATE OR REPLACE VIEW active_licenses_view AS
SELECT
    l.id,
    l.user_id,
    u.name as user_name,
    u.email as user_email,
    l.product_id,
    l.plan,
    l.license_key,
    l.status,
    l.expires_at,
    l.current_activations,
    l.max_activations
FROM licenses l
JOIN user u ON l.user_id = u.id
WHERE l.status = 'active';

-- View for recent orders with user info
CREATE OR REPLACE VIEW recent_orders_view AS
SELECT
    o.id,
    o.user_id,
    u.name as user_name,
    u.email as user_email,
    o.product_id,
    o.plan,
    o.amount,
    o.currency,
    o.status,
    o.payment_method,
    o.created_at
FROM orders o
JOIN user u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 100;

-- View for published blog posts with category info
CREATE OR REPLACE VIEW published_blog_posts_view AS
SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.cover_image,
    bp.author_name,
    bp.locale,
    bp.published_at,
    bc.name as category_name,
    bc.slug as category_slug,
    bp.tags
FROM blog_posts bp
LEFT JOIN blog_categories bc ON bp.category_id = bc.id
WHERE bp.status = 'published'
ORDER BY bp.published_at DESC;

-- ──────────────────────────────────────────────
-- CLEANUP JOBS UTILITIES (Optional)
-- ──────────────────────────────────────────────

-- Function to cleanup expired downloads
CREATE OR REPLACE FUNCTION cleanup_expired_downloads()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM downloads
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup soft-expired coupons
CREATE OR REPLACE FUNCTION cleanup_expired_coupons()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    UPDATE coupons
    SET active = false
    WHERE expires_at < NOW() AND active = true;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get database size statistics
CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS TABLE(
    table_name text,
    row_count bigint,
    total_size text,
    index_size text,
    table_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;