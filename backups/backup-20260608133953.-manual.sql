--
-- PostgreSQL database dump
--

\restrict PGrVCygLL8Kn9hIFU6hTZl8ic9AGP379tkiNaixqs4Uy9IvDHgCnroPG6beFLUv

-- Dumped from database version 17.7
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: wpmhs
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO wpmhs;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: wpmhs
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO wpmhs;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: wpmhs
--

COMMENT ON SCHEMA public IS '';


--
-- Name: activation_action; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.activation_action AS ENUM (
    'activate',
    'deactivate'
);


ALTER TYPE public.activation_action OWNER TO wpmhs;

--
-- Name: backup_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.backup_status AS ENUM (
    'in_progress',
    'completed',
    'failed'
);


ALTER TYPE public.backup_status OWNER TO wpmhs;

--
-- Name: backup_type; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.backup_type AS ENUM (
    'manual',
    'scheduled',
    'pre_restore'
);


ALTER TYPE public.backup_type OWNER TO wpmhs;

--
-- Name: billing_cycle; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.billing_cycle AS ENUM (
    'monthly',
    'yearly',
    'custom'
);


ALTER TYPE public.billing_cycle OWNER TO wpmhs;

--
-- Name: blog_post_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.blog_post_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.blog_post_status OWNER TO wpmhs;

--
-- Name: coupon_scope; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.coupon_scope AS ENUM (
    'all',
    'product',
    'plan'
);


ALTER TYPE public.coupon_scope OWNER TO wpmhs;

--
-- Name: coupon_type; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.coupon_type AS ENUM (
    'percentage',
    'flat'
);


ALTER TYPE public.coupon_type OWNER TO wpmhs;

--
-- Name: delivery_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.delivery_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed'
);


ALTER TYPE public.delivery_status OWNER TO wpmhs;

--
-- Name: license_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.license_status AS ENUM (
    'active',
    'expired',
    'revoked',
    'suspended',
    'grace_period'
);


ALTER TYPE public.license_status OWNER TO wpmhs;

--
-- Name: license_type; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.license_type AS ENUM (
    'lifetime',
    'subscription'
);


ALTER TYPE public.license_type OWNER TO wpmhs;

--
-- Name: notification_channel; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.notification_channel AS ENUM (
    'email',
    'in_app'
);


ALTER TYPE public.notification_channel OWNER TO wpmhs;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.order_status OWNER TO wpmhs;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.payment_method AS ENUM (
    'bkash',
    'nagad',
    'rocket',
    'bank_transfer',
    'ssl_commerz'
);


ALTER TYPE public.payment_method OWNER TO wpmhs;

--
-- Name: redirect_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.redirect_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.redirect_status OWNER TO wpmhs;

--
-- Name: redirect_type; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.redirect_type AS ENUM (
    '301',
    '302'
);


ALTER TYPE public.redirect_type OWNER TO wpmhs;

--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.ticket_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.ticket_priority OWNER TO wpmhs;

--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public.ticket_status OWNER TO wpmhs;

--
-- Name: transfer_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.transfer_status AS ENUM (
    'pending',
    'completed',
    'expired'
);


ALTER TYPE public.transfer_status OWNER TO wpmhs;

--
-- Name: verification_method; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.verification_method AS ENUM (
    'dns',
    'file',
    'meta'
);


ALTER TYPE public.verification_method OWNER TO wpmhs;

--
-- Name: version_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.version_status AS ENUM (
    'stable',
    'beta',
    'draft'
);


ALTER TYPE public.version_status OWNER TO wpmhs;

--
-- Name: webhook_status; Type: TYPE; Schema: public; Owner: wpmhs
--

CREATE TYPE public.webhook_status AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.webhook_status OWNER TO wpmhs;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: wpmhs
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO wpmhs;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: wpmhs
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO wpmhs;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: wpmhs
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: account; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.account (
    id text NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    scope text,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO wpmhs;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id text,
    actor_role text,
    action text NOT NULL,
    target_type text,
    target_id text,
    details jsonb,
    ip_address text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO wpmhs;

--
-- Name: backups; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.backups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size_bytes integer DEFAULT 0,
    type public.backup_type DEFAULT 'manual'::public.backup_type NOT NULL,
    status public.backup_status DEFAULT 'in_progress'::public.backup_status NOT NULL,
    triggered_by text,
    cloud_uploaded boolean DEFAULT false,
    cloud_provider text,
    cloud_path text,
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.backups OWNER TO wpmhs;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    locale text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_categories OWNER TO wpmhs;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    cover_image text,
    author_name text NOT NULL,
    locale text NOT NULL,
    status public.blog_post_status DEFAULT 'draft'::public.blog_post_status NOT NULL,
    category_id uuid,
    tags jsonb DEFAULT '[]'::jsonb,
    seo_title text,
    seo_description text,
    og_image text,
    seo_overrides jsonb,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO wpmhs;

--
-- Name: coupon_applicable_plans; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.coupon_applicable_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    plan_id uuid NOT NULL
);


ALTER TABLE public.coupon_applicable_plans OWNER TO wpmhs;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    type public.coupon_type NOT NULL,
    value integer NOT NULL,
    min_order_amount integer DEFAULT 0,
    max_uses integer,
    current_uses integer DEFAULT 0,
    expires_at timestamp without time zone,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    scope public.coupon_scope DEFAULT 'all'::public.coupon_scope NOT NULL,
    applicable_product_id uuid
);


ALTER TABLE public.coupons OWNER TO wpmhs;

--
-- Name: downloads; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.downloads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    product_id text NOT NULL,
    version text NOT NULL,
    file_name text NOT NULL,
    download_token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    downloaded_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.downloads OWNER TO wpmhs;

--
-- Name: events; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.events (
    id text NOT NULL,
    type text NOT NULL,
    aggregate_id text NOT NULL,
    payload jsonb NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    correlation_id text,
    metadata jsonb
);


ALTER TABLE public.events OWNER TO wpmhs;

--
-- Name: license_activations; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.license_activations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_id uuid NOT NULL,
    domain text NOT NULL,
    action public.activation_action NOT NULL,
    ip_address text,
    user_agent text,
    verification_method public.verification_method,
    suspicious_flags jsonb DEFAULT '[]'::jsonb,
    geo jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_activations OWNER TO wpmhs;

--
-- Name: license_analytics_cache; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.license_analytics_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    snapshot_date timestamp without time zone NOT NULL,
    total_licenses integer DEFAULT 0 NOT NULL,
    active_licenses integer DEFAULT 0 NOT NULL,
    expired_licenses integer DEFAULT 0 NOT NULL,
    revoked_licenses integer DEFAULT 0 NOT NULL,
    suspended_licenses integer DEFAULT 0 NOT NULL,
    grace_period_licenses integer DEFAULT 0 NOT NULL,
    activation_rate integer DEFAULT 0 NOT NULL,
    product_breakdown jsonb DEFAULT '{}'::jsonb,
    geo_distribution jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_analytics_cache OWNER TO wpmhs;

--
-- Name: license_reminders; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.license_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_id uuid NOT NULL,
    milestone text NOT NULL,
    sent_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_reminders OWNER TO wpmhs;

--
-- Name: license_transfers; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.license_transfers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_id uuid NOT NULL,
    transfer_code text NOT NULL,
    from_user_id text NOT NULL,
    to_user_id text,
    status public.transfer_status DEFAULT 'pending'::public.transfer_status NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.license_transfers OWNER TO wpmhs;

--
-- Name: licenses; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    order_id uuid,
    product_id text NOT NULL,
    plan text NOT NULL,
    license_key text NOT NULL,
    status public.license_status DEFAULT 'active'::public.license_status NOT NULL,
    activation_domains jsonb DEFAULT '[]'::jsonb,
    max_activations integer DEFAULT 1,
    current_activations integer DEFAULT 0,
    api_token_hash text,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.licenses OWNER TO wpmhs;

--
-- Name: notification_deliveries; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.notification_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid NOT NULL,
    channel public.notification_channel NOT NULL,
    status public.delivery_status DEFAULT 'pending'::public.delivery_status NOT NULL,
    provider_id text,
    error text,
    attempts integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_deliveries OWNER TO wpmhs;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO wpmhs;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    product_id text NOT NULL,
    plan text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    payment_method public.payment_method,
    payment_ref text,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    coupon_code text,
    discount_amount integer DEFAULT 0,
    tax_amount integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO wpmhs;

--
-- Name: payment_accounts; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.payment_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    method public.payment_method NOT NULL,
    account_name text NOT NULL,
    account_number text NOT NULL,
    bank_name text,
    branch text,
    routing_number text,
    instructions text,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_accounts OWNER TO wpmhs;

--
-- Name: product_plans; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.product_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price_bdt integer DEFAULT 0 NOT NULL,
    price_usd integer DEFAULT 0 NOT NULL,
    license_type public.license_type DEFAULT 'subscription'::public.license_type NOT NULL,
    billing_cycle public.billing_cycle,
    billing_duration_months integer,
    max_activations integer DEFAULT 1,
    features jsonb DEFAULT '{}'::jsonb,
    sort_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_plans OWNER TO wpmhs;

--
-- Name: product_versions; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.product_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    version text NOT NULL,
    download_url text,
    changelog text,
    status public.version_status DEFAULT 'draft'::public.version_status NOT NULL,
    released_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_versions OWNER TO wpmhs;

--
-- Name: products; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    current_version text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO wpmhs;

--
-- Name: redirects; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.redirects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_url text NOT NULL,
    to_url text NOT NULL,
    type public.redirect_type DEFAULT '301'::public.redirect_type NOT NULL,
    is_regex boolean DEFAULT false NOT NULL,
    hit_count integer DEFAULT 0 NOT NULL,
    status public.redirect_status DEFAULT 'active'::public.redirect_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.redirects OWNER TO wpmhs;

--
-- Name: seo_404_errors; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.seo_404_errors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    referrer text,
    hit_count integer DEFAULT 1 NOT NULL,
    last_seen_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.seo_404_errors OWNER TO wpmhs;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO wpmhs;

--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id text NOT NULL,
    message text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_messages OWNER TO wpmhs;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status public.ticket_status DEFAULT 'open'::public.ticket_status NOT NULL,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority NOT NULL,
    assigned_to text,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tickets OWNER TO wpmhs;

--
-- Name: two_factor; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.two_factor (
    id text NOT NULL,
    secret text NOT NULL,
    backup_codes text NOT NULL,
    user_id text NOT NULL,
    verified boolean DEFAULT true
);


ALTER TABLE public.two_factor OWNER TO wpmhs;

--
-- Name: user; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    image text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    role text DEFAULT 'customer'::text,
    banned boolean DEFAULT false,
    ban_reason text,
    ban_expires timestamp without time zone,
    two_factor_enabled boolean DEFAULT false,
    phone text NOT NULL,
    notification_preferences jsonb DEFAULT '{"system": true, "billing": true, "license": true, "support": true, "channels": {"email": true, "in_app": true}}'::jsonb
);


ALTER TABLE public."user" OWNER TO wpmhs;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification OWNER TO wpmhs;

--
-- Name: webhook_deliveries; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.webhook_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webhook_id uuid NOT NULL,
    event text NOT NULL,
    payload jsonb,
    status_code integer,
    response text,
    success boolean DEFAULT false,
    attempts integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webhook_deliveries OWNER TO wpmhs;

--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: wpmhs
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    events jsonb NOT NULL,
    secret text NOT NULL,
    status public.webhook_status DEFAULT 'active'::public.webhook_status NOT NULL,
    last_triggered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webhooks OWNER TO wpmhs;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: wpmhs
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: wpmhs
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
KI4cK2X4GSkaqc0ppWf73gFAX75qRRv3	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	credential	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	\N	\N	\N	\N	\N	13fb2453dcd84efb13e542c9b3e20fa2:7934f3b25b1f4b27819d758a285174a28c39386bd08af0d8d0077682bba07fe3a40a03798604c27cd2249b905d83d2eb9f393d47e0589c03abdabddadd378492	2026-06-05 02:26:56.869	2026-06-05 02:26:56.869
8ERcAVN90HqmLwgKbdxT7GyfT5gwqLbS	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	credential	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	\N	\N	\N	\N	\N	\N	37d4011fed45223098d139f568fdece1:718240aa83710286c51723fa79e8c56e9aac30bdeeeda7a5fc7603b144cbc2c5b18e9861b50e5497b9a0ebc27f80601ec62d3e810616c5f224ebf3a8e766d5ac	2026-06-05 20:51:31.705	2026-06-05 20:51:31.705
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.audit_logs (id, actor_id, actor_role, action, target_type, target_id, details, ip_address, created_at) FROM stdin;
03da5ff9-39f2-4815-be00-217bb5a693a8	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	user.registered	user	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	{"name": "Super Admin MHS", "email": "admin@salesconversionflow.com"}	\N	2026-06-05 02:26:58.077084
c923751c-366c-49d4-ab0d-45bc775efdb8	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	user.login	session	khasa6IZd7nZncobSa8nuieVb8gdBsYs	\N	\N	2026-06-05 02:26:58.080163
50d6ea76-2152-4fb1-9541-ab86164fe9e6	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	user.login	session	YZHT99YQUddZSHICV4kUeYdtyNVI3Q0r	\N	\N	2026-06-05 02:38:43.158469
19355020-a60a-443e-866f-d5d7c4de73f7	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	order.created	order	1b3b4ac2-86b2-4196-8b70-ed73e81e93ae	{"plan": "Starter", "amount": 2150, "couponCode": null, "totalAmount": 2473}	\N	2026-06-05 20:48:58.696457
3206cb9b-767c-405d-80e5-98587a2d3dc8	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	settings	vat	{"mode": "exclusive", "rate": 15, "action": "vat_settings_updated"}	\N	2026-06-05 20:49:25.348063
46a464e1-01ea-41ad-81d1-293d4026e811	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	bkash	{"action": "payment_account_updated", "method": "bkash"}	\N	2026-06-05 20:49:25.375225
e76ef61e-cfb5-4085-a7f7-0d7957a6c307	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	nagad	{"action": "payment_account_updated", "method": "nagad"}	\N	2026-06-05 20:49:25.399508
9e8a5fd7-6c64-4c5e-921d-78a516c91a50	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	rocket	{"action": "payment_account_updated", "method": "rocket"}	\N	2026-06-05 20:49:25.420293
3e8ba066-9e04-40e9-a773-87bff4e797a2	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	bank_transfer	{"action": "payment_account_updated", "method": "bank_transfer"}	\N	2026-06-05 20:49:25.444649
87f5dc3f-4d47-41bb-82d7-6bb56a4e76d8	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	ssl_commerz	{"action": "ssl_commerz_settings_updated", "sandbox": true}	\N	2026-06-05 20:49:25.475926
ef30d224-7da2-42d9-8d3b-185604bfbdcb	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.created	order	5e6779a0-2226-40a4-9be4-7ebf33326d96	\N	\N	2026-06-05 20:50:01.84455
85fbb5c0-9c98-4faf-bb6a-4502c8206c1b	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	5e6779a0-2226-40a4-9be4-7ebf33326d96	{"to": "completed", "from": "pending"}	\N	2026-06-05 20:50:31.567425
1503ae4e-1f5e-4453-9bb8-81400a8546ee	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	\N	user.registered	user	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	{"name": "MEHEDI HASSAN SHUBHO", "email": "mehedihassanshubho@gmail.com"}	\N	2026-06-05 20:51:32.051896
5eb08f59-9ed5-483d-a232-48bce4bde584	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	\N	user.login	session	CPJhnVj1xNeBhviJrAZntPm41SShgTTF	\N	\N	2026-06-05 20:51:32.053705
a1955ecf-3c7a-4251-b527-eafc96423900	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	9ff4c5cb-e01c-4635-b062-1f2f4332c7db	\N	\N	2026-06-05 20:51:48.434036
99d8d6f4-17c5-45b5-9468-fe41ad876aa4	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	\N	user.login	session	G6bTErTnEiPRU6GVUnmNmXgCOUuFeSvx	\N	\N	2026-06-05 20:52:26.908387
8ef52303-8de1-4f0d-b0e5-c50631d3dcb0	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	9ff4c5cb-e01c-4635-b062-1f2f4332c7db	{"to": "completed", "from": "pending"}	\N	2026-06-05 20:52:43.465203
4548caab-9622-4c23-bf51-56b0609a23c0	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.created	product	b74f8861-5f3e-405d-9a71-b5f870e37f6e	{"name": "ConversionFlow WP Plugin", "slug": "conversionflow-wp-plugin"}	\N	2026-06-05 20:53:28.01057
c40269b7-26a5-4997-bd72-c05dcb490315	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	email_provider	{"action": "email_provider_settings_updated", "provider": "resend"}	\N	2026-06-06 12:49:17.431078
47e5c19b-a85f-4741-8370-175316bf3819	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_sitemap_enabled", "seo_sitemap_pages", "seo_sitemap_blog", "seo_sitemap_docs", "seo_sitemap_landing", "seo_sitemap_excludes", "seo_sitemap_frequency", "seo_sitemap_auto_regenerate"], "action": "seo_settings_updated"}	\N	2026-06-06 12:54:16.278611
1f938410-a5ac-4fa8-bd19-74f60295a003	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_sitemap_enabled", "seo_sitemap_pages", "seo_sitemap_blog", "seo_sitemap_docs", "seo_sitemap_landing", "seo_sitemap_excludes", "seo_sitemap_frequency", "seo_sitemap_auto_regenerate"], "action": "seo_settings_updated"}	\N	2026-06-06 12:54:24.41788
cc3ef318-d9e6-4463-b354-bdcafd594fbd	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_image_auto_alt", "seo_image_webp", "seo_image_lazy_loading", "seo_image_compression"], "action": "seo_settings_updated"}	\N	2026-06-06 12:56:11.062452
77deb5c8-4f7f-42ad-8948-3d25ff171d64	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["meta_pixel_id", "meta_capi_token", "meta_dataset_id", "meta_test_event_code", "meta_advanced_matching", "meta_matching_fields", "meta_events", "meta_event_deduplication"], "action": "tracking_settings_updated"}	\N	2026-06-06 12:57:04.789862
bbd295fc-bac8-4736-809a-0d07908e1d8a	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_title", "seo_description", "seo_keywords", "seo_canonical_url", "seo_separator", "seo_robots_default", "seo_og_image", "seo_auto_meta", "seo_lowercase_urls", "seo_trailing_slash"], "action": "seo_settings_updated"}	\N	2026-06-06 15:26:04.234443
8ed8478f-db72-4772-a219-6c7a751db8e7	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_title", "seo_description", "seo_keywords", "seo_canonical_url", "seo_separator", "seo_robots_default", "seo_og_image", "seo_auto_meta", "seo_lowercase_urls", "seo_trailing_slash"], "action": "seo_settings_updated"}	\N	2026-06-06 15:26:27.561497
d7bc1c02-3f8b-46b4-ad9c-a1a3f241d6c3	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_verify_google", "seo_verify_bing", "seo_verify_yandex", "seo_verify_baidu", "seo_verify_pinterest"], "action": "seo_settings_updated"}	\N	2026-06-06 15:32:28.907008
b58fb62e-fde3-4cd8-920a-56dfd8967b5a	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_verify_google", "seo_verify_bing", "seo_verify_yandex", "seo_verify_baidu", "seo_verify_pinterest"], "action": "seo_settings_updated"}	\N	2026-06-06 15:32:31.768167
8bab34e5-04a6-4161-bc39-f72a8c624619	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_sitemap_enabled", "seo_sitemap_pages", "seo_sitemap_blog", "seo_sitemap_docs", "seo_sitemap_landing", "seo_sitemap_excludes", "seo_sitemap_frequency", "seo_sitemap_auto_regenerate"], "action": "seo_settings_updated"}	\N	2026-06-06 15:39:04.663447
10e0665f-33f8-49a1-a823-8cbe8022fb4e	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 15:41:10.314404
f86a534e-8941-420c-a42a-8a3d139dc32f	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 15:41:25.849986
4f36bc75-adc5-4e19-91b2-c263adca1847	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 15:41:35.306696
e2822e0a-bae9-4242-8517-730be26f178d	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 15:42:15.471156
0f44bbe6-c913-46b8-9336-1e5ddea70168	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:01:39.641709
aaafefcd-bcea-4639-ac42-7fbaa10f1119	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:01:54.016019
7c48ed9d-885f-452d-8ee0-d417bc00f501	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:02:01.962885
125b2272-eba5-4bbf-867b-72e296c89b68	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:02:10.522499
65bb9058-22e7-410c-b029-565a60954ca1	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:02:43.128322
ca268f88-9668-405d-8491-eb6e5445cd54	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_robots_txt", "seo_ai_bots"], "action": "seo_settings_updated"}	\N	2026-06-06 16:03:04.552196
fcdf8c27-7b0f-4084-a2c2-61bb5a3ef547	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["meta_pixel_id", "meta_capi_token", "meta_dataset_id", "meta_test_event_code", "meta_advanced_matching", "meta_matching_fields", "meta_events", "meta_event_deduplication"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:13:04.371912
ebe16192-3be3-4a09-bee3-1ee3be6cf467	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["meta_pixel_id", "meta_capi_token", "meta_dataset_id", "meta_test_event_code", "meta_advanced_matching", "meta_matching_fields", "meta_events", "meta_event_deduplication"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:13:19.131425
49bacb2f-6b47-4fb6-9ea1-eebe33dddcf4	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["tiktok_pixel_id", "tiktok_events_token", "tiktok_advanced_matching", "tiktok_matching_fields", "tiktok_server_side", "tiktok_events"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:15:39.85249
7afbb7c8-78f5-4296-a2cd-c6d91fa21c11	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["tiktok_pixel_id", "tiktok_events_token", "tiktok_advanced_matching", "tiktok_matching_fields", "tiktok_server_side", "tiktok_events"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:15:46.436979
518c3ee5-0941-440b-93c0-87f35deee66a	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["tiktok_pixel_id", "tiktok_events_token", "tiktok_advanced_matching", "tiktok_matching_fields", "tiktok_server_side", "tiktok_events"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:15:52.283658
17d3f26c-b82f-482f-8c3f-a62f00e6bbb2	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["google_analytics_id", "google_tag_manager_id", "google_ads_conversion_id", "google_ads_conversion_label", "google_server_side", "google_enhanced_ecommerce"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:17:28.636469
c23572aa-4521-4ac8-a638-76975eda9521	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["seo_schema_auto_generate", "seo_schema_overrides", "seo_schema_types_enabled"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:19:29.76356
7dcbabfd-4c09-4950-a06c-ab622111d384	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["seo_schema_auto_generate", "seo_schema_overrides", "seo_schema_types_enabled"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:19:35.134613
e7863056-4f70-4f4f-8dce-16cd7e5f5656	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["seo_fb_app_id", "seo_share_title", "seo_share_description", "seo_share_image", "seo_twitter_handle", "seo_twitter_card_type", "seo_linkedin_image"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:22:52.536702
819887fa-90b7-4276-9a70-2b49bc9efa5e	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.tracking_settings_updated	settings	tracking	{"keys": ["seo_fb_app_id", "seo_share_title", "seo_share_description", "seo_share_image", "seo_twitter_handle", "seo_twitter_card_type", "seo_linkedin_image"], "action": "tracking_settings_updated"}	\N	2026-06-06 16:23:05.773536
08022089-845e-461f-880a-5318aa711ad4	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_ai_usage_rules"], "action": "seo_settings_updated"}	\N	2026-06-06 16:30:28.332992
439a44bb-f5d9-4b50-b670-b3be12d308e9	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_ai_usage_rules"], "action": "seo_settings_updated"}	\N	2026-06-06 16:30:32.408281
acbaa024-0323-482f-96bc-9c331014a731	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_image_auto_alt", "seo_image_webp", "seo_image_lazy_loading", "seo_image_compression"], "action": "seo_settings_updated"}	\N	2026-06-06 16:32:04.010109
067cecf0-c8b5-4a28-b623-15d02eeffd7d	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_perf_critical_css", "seo_perf_js_defer", "seo_perf_minification", "seo_perf_cdn_url", "seo_perf_cache_settings"], "action": "seo_settings_updated"}	\N	2026-06-06 16:35:36.226525
d22604c5-e831-4a3a-9874-b8c6f110e67b	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.seo_settings_updated	settings	seo	{"keys": ["seo_title", "seo_description", "seo_keywords", "seo_canonical_url", "seo_separator", "seo_robots_default", "seo_og_image", "seo_auto_meta", "seo_lowercase_urls", "seo_trailing_slash"], "action": "seo_settings_updated"}	\N	2026-06-06 16:36:55.505407
21c9c2b3-9664-44a1-a5c0-3c7cb6623978	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	page_seo.updated	page_seo	home	{"pageKey": "home", "overrides": {"title": "ConversionFlow — WooCommerce Automation for Bangladesh 1", "schemaType": "WebPage"}}	\N	2026-06-06 16:41:59.406448
03df4239-29b2-438d-95a5-e9676c75e90f	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	page_seo.updated	page_seo	home	{"pageKey": "home", "overrides": {"title": "ConversionFlow — WooCommerce Automation for Bangladesh h", "schemaType": "WebPage"}}	\N	2026-06-07 10:57:34.262655
a15d5635-68dc-4c04-b8e9-6a8b7fae157c	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	page_seo.updated	page_seo	home	{"pageKey": "home", "overrides": {"title": "ConversionFlow — WooCommerce Automation", "schemaType": "WebPage"}}	\N	2026-06-07 10:58:26.100686
3ec84df8-f1e8-4c53-a7fd-41808e699c70	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	page_seo.updated	page_seo	home	{"pageKey": "home", "overrides": {"title": "My Custom Test Title", "schemaType": "WebPage"}}	\N	2026-06-07 11:01:44.343842
c75bdeab-dbf9-42c0-8109-c0a1b6b729ef	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	page_seo.updated	page_seo	home	{"pageKey": "home", "overrides": {"title": "ConversionFlow — WooCommerce Automation for Bangladesh", "schemaType": "WebPage"}}	\N	2026-06-07 11:02:01.222557
8419cbbf-8d7f-4def-888d-18a02b7c04b9	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.version.created	product_version	1370975d-ffc5-4798-921a-3d795b3f0e92	{"status": "draft", "version": "0.0.191", "productId": "b74f8861-5f3e-405d-9a71-b5f870e37f6e"}	\N	2026-06-07 11:29:25.444651
eee6207f-53a3-47a0-bf8f-0e007fb03941	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	b8106ba3-fc49-4763-b19b-4ea3a71c31e4	{"name": "Starter", "priceBDT": 2150, "priceUSD": 15, "productId": "b74f8861-5f3e-405d-9a71-b5f870e37f6e", "licenseType": "subscription"}	\N	2026-06-07 11:30:58.560313
f23b98a4-132b-496b-b266-bf4f11c9531e	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.updated	product_plan	b8106ba3-fc49-4763-b19b-4ea3a71c31e4	{"updatedFields": ["name", "slug", "description", "priceBDT", "priceUSD", "maxActivations", "sortOrder", "active", "licenseType", "billingCycle", "billingDurationMonths", "features"]}	\N	2026-06-07 11:37:23.764799
392a5f02-8e8a-4ac0-bf49-5bc30d7ef6aa	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.updated	product_plan	b8106ba3-fc49-4763-b19b-4ea3a71c31e4	{"updatedFields": ["name", "slug", "description", "priceBDT", "priceUSD", "maxActivations", "sortOrder", "active", "licenseType", "billingCycle", "billingDurationMonths", "features"]}	\N	2026-06-07 11:37:55.000037
1eda5ad5-368c-4036-8436-95363d42c32d	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.version.released	product_version	1370975d-ffc5-4798-921a-3d795b3f0e92	{"status": "stable"}	\N	2026-06-07 11:38:27.656645
fcaa4d3f-6367-4b16-b185-c5ce67c28749	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	\N	user.login	session	5dxdnzkzMszcvJT3ErsrqcCYfmTftEUu	\N	\N	2026-06-07 12:00:48.298663
fe54aaca-c34d-49a7-9d1d-fd9f5040eaf6	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	45f14518-d4ad-4042-a908-d52092ea8431	\N	\N	2026-06-07 12:01:29.546372
6cf61205-2227-4161-abca-3d4c0dc346f3	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	45f14518-d4ad-4042-a908-d52092ea8431	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:01:44.453083
43caf007-4317-4790-837b-77fd6b724720	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	1238854a-ae24-4b5c-b42f-e7bbd0ee2c1c	\N	\N	2026-06-07 12:09:41.671934
241aec51-091a-476d-915a-7fa05ca80670	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	1238854a-ae24-4b5c-b42f-e7bbd0ee2c1c	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:09:56.552251
b55723b9-9a51-451a-9f69-7e7e64462c82	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	a3e6c398-fe32-4388-9bc1-c8e7c1a855b6	\N	\N	2026-06-07 12:10:58.100869
8d93df4e-9459-4d40-97ac-06a6e5152d46	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	a3e6c398-fe32-4388-9bc1-c8e7c1a855b6	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:11:20.188618
f4a6b5a0-f67a-4dd8-8854-497abf3f2f97	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	883dfe5c-6ab9-4a59-9a80-06f57ec60b22	{"name": "Professional", "priceBDT": 3000, "priceUSD": 28, "productId": "b74f8861-5f3e-405d-9a71-b5f870e37f6e", "licenseType": "subscription"}	\N	2026-06-07 12:12:44.248802
fb57325c-43e1-4a07-8f8a-6b719dd87757	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	ce861122-330b-4b7c-8330-4bc28916a30a	{"name": "Lifetime", "priceBDT": 8000, "priceUSD": 75, "productId": "b74f8861-5f3e-405d-9a71-b5f870e37f6e", "licenseType": "lifetime"}	\N	2026-06-07 12:13:28.862081
465e9582-4bea-4698-bf2e-617dfc0e2a0e	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	483788f6-49b5-4544-9601-a55aa23c1300	\N	\N	2026-06-07 12:26:22.956236
12d98998-b3b7-467e-ac47-e42410559ba0	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	483788f6-49b5-4544-9601-a55aa23c1300	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:26:30.754587
64413d6f-f6a4-4a8f-bd93-e539a28fa5f5	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	3c3c963c-9acb-4bf4-af7a-c1c700704573	\N	\N	2026-06-07 12:32:29.971395
ad7aae51-ebad-4793-a069-2a9bc6839648	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	3c3c963c-9acb-4bf4-af7a-c1c700704573	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:32:37.184411
3219b7d4-2abf-49b9-a239-17bad88b84e7	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.updated	product	b74f8861-5f3e-405d-9a71-b5f870e37f6e	{"updatedFields": ["name", "slug", "description"]}	\N	2026-06-07 12:36:05.31137
0894433a-a41e-439c-962b-01ca5a8cb61f	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.deleted	product	b74f8861-5f3e-405d-9a71-b5f870e37f6e	\N	\N	2026-06-07 12:36:17.099239
13fe2eab-2c43-457c-80d5-23ad51b26cd7	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.created	product	87e39189-22a8-40df-a77f-d6f87c6e8bc7	{"name": "ConversionFlow WP", "slug": "conversionflow-wp"}	\N	2026-06-07 12:36:28.79215
df92a3ff-114d-4fad-9901-a8d98aa295fb	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.version.created	product_version	110c3503-4960-457d-a4c5-261533c4a4dd	{"status": "draft", "version": "0.0.191", "productId": "87e39189-22a8-40df-a77f-d6f87c6e8bc7"}	\N	2026-06-07 12:36:42.443332
9b62006d-3b8e-4fdf-9fb3-18a3697d70de	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	25440e70-4be4-44d3-9f84-eb35fe9ec5b3	{"name": "Starter", "priceBDT": 2150, "priceUSD": 16, "productId": "87e39189-22a8-40df-a77f-d6f87c6e8bc7", "licenseType": "subscription"}	\N	2026-06-07 12:37:13.397788
72ec0a95-cc23-4b65-945c-d015985310fe	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.updated	product_plan	25440e70-4be4-44d3-9f84-eb35fe9ec5b3	{"updatedFields": ["name", "slug", "description", "priceBDT", "priceUSD", "maxActivations", "sortOrder", "active", "licenseType", "billingCycle", "billingDurationMonths", "features"]}	\N	2026-06-07 12:38:02.068998
b5105866-5c2e-4d0c-a236-0f8d284641ee	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	14775e99-5310-40b5-96d0-d7de90372f76	{"name": "Professional", "priceBDT": 3000, "priceUSD": 28, "productId": "87e39189-22a8-40df-a77f-d6f87c6e8bc7", "licenseType": "subscription"}	\N	2026-06-07 12:38:41.26117
e71d8896-ccbb-41f6-a4d4-4f744212618f	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.created	product_plan	b1bba1b9-3b64-4054-9a98-955ff0e89d95	{"name": "Agency", "priceBDT": 8000, "priceUSD": 74, "productId": "87e39189-22a8-40df-a77f-d6f87c6e8bc7", "licenseType": "lifetime"}	\N	2026-06-07 12:39:05.365476
8f539f42-0d46-49a5-a435-5976f4ede49c	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	91c49d7e-89e7-477b-81d5-696a589f3512	\N	\N	2026-06-07 12:39:35.886691
49e82e88-2ead-4254-9f3b-ee30b2ff78ce	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	91c49d7e-89e7-477b-81d5-696a589f3512	{"to": "completed", "from": "pending"}	\N	2026-06-07 12:39:40.96958
d1dcf17e-5030-4d29-a63d-4f2980a811cf	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	91aeb957-7890-47a1-ae1c-a4bc5206a9f8	\N	\N	2026-06-07 17:49:02.356204
34f02c78-63d2-416b-9c90-578253d35f5a	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	91aeb957-7890-47a1-ae1c-a4bc5206a9f8	{"to": "completed", "from": "pending"}	\N	2026-06-07 17:49:31.659903
8b81f437-7565-4582-97c5-df7c52b2f052	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	205a2b90-f242-4e37-ac4f-7b8616cce538	\N	\N	2026-06-07 17:54:40.729799
d390c345-c97a-4a1d-abea-da82d7fc9651	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	205a2b90-f242-4e37-ac4f-7b8616cce538	{"to": "completed", "from": "pending"}	\N	2026-06-07 17:54:46.750408
c0a66a38-2d13-4fc5-b15c-09eaed7053d0	\N	\N	license.created	license	7e7850dd-de28-422d-8837-41dca5bfb70b	{"source": "order_completed_event", "orderId": "205a2b90-f242-4e37-ac4f-7b8616cce538", "licenseKey": "5RMWCS4X877QZMB9MMD8"}	\N	2026-06-07 17:54:46.79122
f2812687-21bd-4da7-8735-e16124c39465	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	settings	vat	{"mode": "inclusive", "rate": 15, "action": "vat_settings_updated"}	\N	2026-06-07 18:37:39.886383
c76865d2-59bc-4235-961c-574ef97eaa99	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	bkash	{"action": "payment_account_updated", "method": "bkash"}	\N	2026-06-07 18:37:39.912514
b496296d-15e1-4a70-a3f2-3788647d9538	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	nagad	{"action": "payment_account_updated", "method": "nagad"}	\N	2026-06-07 18:37:39.93409
9eba891c-86ad-4e5f-9211-46b492024fe6	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	rocket	{"action": "payment_account_updated", "method": "rocket"}	\N	2026-06-07 18:37:39.956033
5baee835-8df6-4d2d-9cf9-02f9d50a8366	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.setup_completed	payment_account	bank_transfer	{"action": "payment_account_updated", "method": "bank_transfer"}	\N	2026-06-07 18:37:39.977494
1bd5cb46-585a-4129-82a9-c5ed7a29baac	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	ssl_commerz	{"action": "ssl_commerz_settings_updated", "sandbox": true}	\N	2026-06-07 18:37:40.006463
264a4e0b-0a8e-4dc7-a61a-c65631601de9	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	6fe53d74-d041-40c2-a9dc-421f266e3345	\N	\N	2026-06-07 18:42:56.916092
0059dea9-af43-4942-91a1-500f7bee273f	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	6fe53d74-d041-40c2-a9dc-421f266e3345	{"to": "completed", "from": "pending"}	\N	2026-06-07 18:43:15.569808
9c96f4e7-f0f3-436d-a030-1a3a574f0a48	\N	\N	license.created	license	fb2f05fc-59e9-4b7b-a052-ca329a202954	{"source": "order_completed_event", "orderId": "6fe53d74-d041-40c2-a9dc-421f266e3345", "licenseKey": "M7SGQZJX9XYNF3ZNX6DC"}	\N	2026-06-07 18:43:15.600992
7b18c2a0-dafe-438a-96c1-f20b4be8cf79	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	1b3b4ac2-86b2-4196-8b70-ed73e81e93ae	{"to": "failed", "from": "pending", "reason": "For test"}	\N	2026-06-07 18:48:33.616627
03f16adc-08e9-4cd3-804b-40832e898143	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	license.status_changed	license	7e7850dd-de28-422d-8837-41dca5bfb70b	{"to": "revoked", "from": "active", "reason": "order_refunded"}	\N	2026-06-07 18:50:13.711608
6ed60f21-a3b8-456c-b7c2-5adb71ae652a	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	205a2b90-f242-4e37-ac4f-7b8616cce538	{"to": "refunded", "from": "completed", "reason": "Admin issued refund"}	\N	2026-06-07 18:50:13.713292
11d18baf-6e26-4a67-9edc-4f0dc6ce85d6	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	product.plan.updated	product_plan	25440e70-4be4-44d3-9f84-eb35fe9ec5b3	{"updatedFields": ["name", "slug", "description", "priceBDT", "priceUSD", "maxActivations", "sortOrder", "active", "licenseType", "billingCycle", "billingDurationMonths", "features"]}	\N	2026-06-07 18:54:51.455341
892bacb6-b218-4257-875c-74059ff3928c	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	coupon.toggled	coupon	b1aefcb9-9edf-4d68-9daa-a378f008e321	{"code": "LAUNCH20", "active": false}	\N	2026-06-07 19:25:56.240276
4a9b54c8-df5d-4920-aae3-6700cf594c67	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	coupon.toggled	coupon	b1aefcb9-9edf-4d68-9daa-a378f008e321	{"code": "LAUNCH20", "active": true}	\N	2026-06-08 05:36:44.349289
c082419b-05d1-4384-bf0c-baea1f484a79	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	coupon.toggled	coupon	b1aefcb9-9edf-4d68-9daa-a378f008e321	{"code": "LAUNCH20", "active": false}	\N	2026-06-08 05:36:48.431653
5957f3cf-d321-4fc5-99c1-73e169ac18d4	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	coupon.toggled	coupon	b1aefcb9-9edf-4d68-9daa-a378f008e321	{"code": "LAUNCH20", "active": true}	\N	2026-06-08 05:36:50.046599
8e68c3df-322e-4a77-a995-cb0de9fa9513	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	coupon.toggled	coupon	b1aefcb9-9edf-4d68-9daa-a378f008e321	{"code": "LAUNCH20", "active": false}	\N	2026-06-08 05:36:53.371417
1c993391-150c-4fbd-a8b9-d86d40a88fbc	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	user	order.created	order	50030e8e-72cc-45ea-b25b-95dbd3007034	\N	\N	2026-06-08 11:07:16.053085
ab4e111b-a256-40ad-be79-8eb769e29601	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	order.status_changed	order	50030e8e-72cc-45ea-b25b-95dbd3007034	{"to": "completed", "from": "pending"}	\N	2026-06-08 11:07:40.992497
c1458608-cfea-4fb0-8a3f-5996a5e1f461	\N	\N	license.created	license	2a3c4549-bf91-4f09-9d7f-66ae2ec8b2ea	{"source": "order_completed_event", "orderId": "50030e8e-72cc-45ea-b25b-95dbd3007034", "licenseKey": "8GK8JR8W5UBGZPX79KEB"}	\N	2026-06-08 11:07:41.028754
70d902c0-aaa0-424a-927f-4e7d3d130fa3	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	admin	subscription.check_triggered	system	subscription-worker	{"success": true}	\N	2026-06-08 11:08:32.802285
6c6d50a0-e1b4-4d56-84d5-e294ea6fe38b	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	admin	subscription.check_triggered	system	subscription-worker	{"success": true}	\N	2026-06-08 11:14:09.385469
2157ae48-9d61-4a8e-8e3a-43266060c9db	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	transfer	{"action": "transfer_settings_updated", "maxTransfersPerMonth": 2}	\N	2026-06-08 11:35:29.214944
a48fa544-5521-4d41-8779-b8eca9889864	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	transfer	{"action": "transfer_settings_updated", "maxTransfersPerMonth": 1}	\N	2026-06-08 11:35:32.616025
d05d1586-b6ef-48ab-b612-a66aa53de694	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	transfer	{"action": "transfer_settings_updated", "maxTransfersPerMonth": 1}	\N	2026-06-08 11:36:49.962321
ec5ac27a-823c-4452-8f12-b2ab16bafe15	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	customer	license.transferred	license	fb2f05fc-59e9-4b7b-a052-ca329a202954	{"direction": "initiated", "licenseId": "fb2f05fc-59e9-4b7b-a052-ca329a202954", "fromUserId": "D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG"}	\N	2026-06-08 12:02:14.880797
6e850bd0-ecb9-47ab-b518-ed911fa145e1	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	backup	{"action": "backup_settings_updated", "interval": "daily", "retentionCount": 10}	\N	2026-06-08 12:17:01.669369
3be53b00-288e-48af-a391-81155219db28	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	backup	{"action": "backup_settings_updated", "interval": "weekly", "retentionCount": 10}	\N	2026-06-08 12:18:33.198862
89dfe29c-5997-4e8a-b785-4dba6473c4be	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	backup	{"action": "backup_settings_updated", "interval": "weekly", "retentionCount": 3}	\N	2026-06-08 12:18:49.194369
57f3026f-202b-48c3-ae76-e03a473f2dc7	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	backup_cloud	{"action": "backup_cloud_settings_updated", "provider": "gdrive"}	\N	2026-06-08 12:39:34.872044
23b2f1af-9e4a-4a78-a811-fef009ec65ef	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	super_admin	admin.settings_updated	settings	backup_cloud	{"action": "backup_cloud_settings_updated", "provider": "gdrive"}	\N	2026-06-08 12:41:19.392736
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.backups (id, filename, file_path, file_size_bytes, type, status, triggered_by, cloud_uploaded, cloud_provider, cloud_path, error_message, created_at, completed_at) FROM stdin;
020bcbc2-5113-4c1c-9f92-dd2a1802854e	backup-20260608133953.-manual.sql	D:\\Devsroom-Work\\conversionflow-website\\backups\\backup-20260608133953.-manual.sql	0	manual	in_progress	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	f	\N	\N	\N	2026-06-08 13:39:55.278127	\N
\.


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.blog_categories (id, name, slug, locale, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.blog_posts (id, title, slug, content, excerpt, cover_image, author_name, locale, status, category_id, tags, seo_title, seo_description, og_image, seo_overrides, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coupon_applicable_plans; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.coupon_applicable_plans (id, coupon_id, plan_id) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.coupons (id, code, type, value, min_order_amount, max_uses, current_uses, expires_at, active, created_at, updated_at, scope, applicable_product_id) FROM stdin;
b1aefcb9-9edf-4d68-9daa-a378f008e321	LAUNCH20	percentage	20	0	100	0	\N	f	2026-06-05 02:30:16.541941	2026-06-08 05:36:53.356	all	\N
\.


--
-- Data for Name: downloads; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.downloads (id, user_id, product_id, version, file_name, download_token, expires_at, downloaded_at, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.events (id, type, aggregate_id, payload, "timestamp", correlation_id, metadata) FROM stdin;
\.


--
-- Data for Name: license_activations; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.license_activations (id, license_id, domain, action, ip_address, user_agent, verification_method, suspicious_flags, geo, created_at) FROM stdin;
\.


--
-- Data for Name: license_analytics_cache; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.license_analytics_cache (id, snapshot_date, total_licenses, active_licenses, expired_licenses, revoked_licenses, suspended_licenses, grace_period_licenses, activation_rate, product_breakdown, geo_distribution, created_at) FROM stdin;
\.


--
-- Data for Name: license_reminders; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.license_reminders (id, license_id, milestone, sent_at) FROM stdin;
7d6612bd-cd10-4cc1-a5f8-08bef8bfc58d	2a3c4549-bf91-4f09-9d7f-66ae2ec8b2ea	grace_entered	2026-06-08 11:14:09.379779
\.


--
-- Data for Name: license_transfers; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.license_transfers (id, license_id, transfer_code, from_user_id, to_user_id, status, expires_at, completed_at, created_at) FROM stdin;
ac99d9a4-9b41-4333-9665-d2425c28c9cc	fb2f05fc-59e9-4b7b-a052-ca329a202954	CF-XFER-D4BC2T	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	\N	pending	2026-06-10 12:02:14.159	\N	2026-06-08 12:02:14.877749
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.licenses (id, user_id, order_id, product_id, plan, license_key, status, activation_domains, max_activations, current_activations, api_token_hash, expires_at, created_at, updated_at) FROM stdin;
7e7850dd-de28-422d-8837-41dca5bfb70b	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	205a2b90-f242-4e37-ac4f-7b8616cce538	conversionflow-wp	Professional	5RMWCS4X877QZMB9MMD8	revoked	[]	1	0	fdf22327425b56ac13cdf172dd30a8146c85cfa48d6d0b47cf1d6c5d7ced1d30	2028-06-07 11:54:46.753	2026-06-07 17:54:46.768676	2026-06-07 18:50:13.746
fb2f05fc-59e9-4b7b-a052-ca329a202954	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	6fe53d74-d041-40c2-a9dc-421f266e3345	conversionflow-wp	Starter	M7SGQZJX9XYNF3ZNX6DC	active	[]	1	0	f0815e4c0ccf7a11796d16cca968021a530be8b70256ebeae93d7f674c288be6	2027-06-07 12:43:15.585	2026-06-07 18:43:15.585713	2026-06-07 18:43:15.585713
2a3c4549-bf91-4f09-9d7f-66ae2ec8b2ea	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	50030e8e-72cc-45ea-b25b-95dbd3007034	conversionflow-wp	Starter	8GK8JR8W5UBGZPX79KEB	grace_period	[]	1	0	1779a76fdca3672394a6993ba20594f6a6e9ee5d431e95f18bf7fee22a838186	2026-06-05 11:12:02.387	2026-06-08 11:07:41.01058	2026-06-08 11:14:06.841
\.


--
-- Data for Name: notification_deliveries; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.notification_deliveries (id, notification_id, channel, status, provider_id, error, attempts, created_at, updated_at) FROM stdin;
9dc6ce1c-a69c-4836-bb7b-af381c74020c	bdbb838b-8259-4b1d-b776-8c28d0aca95f	in_app	pending	\N	\N	1	2026-06-07 12:09:56.594391	2026-06-07 12:09:56.594391
58553131-2b75-4611-a262-1da495bfdf72	bdbb838b-8259-4b1d-b776-8c28d0aca95f	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 12:09:56.594391	2026-06-07 12:10:03.805
0cf0c730-c023-4ca9-83de-5bfdf87059c9	1621e265-b8be-47e8-9893-363f34dd2964	in_app	pending	\N	\N	1	2026-06-07 12:11:20.198214	2026-06-07 12:11:20.198214
47382366-14b1-4120-948a-25b5520a004c	1621e265-b8be-47e8-9893-363f34dd2964	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 12:11:20.198214	2026-06-07 12:11:27.49
444c24e9-243e-4ddd-a716-73350ad6228b	2ad0854f-fe2c-42a4-816c-d6f55dbffa6e	in_app	pending	\N	\N	1	2026-06-07 12:26:30.792532	2026-06-07 12:26:30.792532
d02ba5e8-6cab-4d7a-920c-94bbd1c56c10	2ad0854f-fe2c-42a4-816c-d6f55dbffa6e	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 12:26:30.792532	2026-06-07 12:26:36.102
55e1adb9-c629-49af-a406-48476d3edb7b	94a5f0f6-9c8f-4e87-9aff-6a48d568c159	in_app	pending	\N	\N	1	2026-06-07 12:32:37.193561	2026-06-07 12:32:37.193561
1560b003-11b5-4966-bd33-14e78773810e	94a5f0f6-9c8f-4e87-9aff-6a48d568c159	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 12:32:37.193561	2026-06-07 12:32:43.532
1b50108f-7422-4223-9377-2092a91f090a	3dc7ddbc-1937-4b41-8915-76de10da5a3b	in_app	pending	\N	\N	1	2026-06-07 12:39:40.988152	2026-06-07 12:39:40.988152
42745be6-6bc3-4095-a1fc-a75ee8088244	3dc7ddbc-1937-4b41-8915-76de10da5a3b	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 12:39:40.988152	2026-06-07 12:39:45.115
485dd071-252b-469e-a90f-58289c2cfb4a	c23a9b20-4dd0-48cd-806d-356b08dcf4e6	in_app	pending	\N	\N	1	2026-06-07 17:49:31.684529	2026-06-07 17:49:31.684529
4bfcf2db-fd61-4889-88cc-d248d3ae2a93	c23a9b20-4dd0-48cd-806d-356b08dcf4e6	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 17:49:31.684529	2026-06-07 17:49:37.924
a5f3b9c3-b9da-42f9-9ab9-6f7bb3994eff	a6af5b32-b4f0-4219-8d43-3ec3335f4064	in_app	pending	\N	\N	1	2026-06-07 17:54:46.75932	2026-06-07 17:54:46.75932
1b9209c0-61c4-403b-af8b-d9d8b03a563f	66b29b84-7be3-42f1-8e4a-2bf2f0571ade	in_app	pending	\N	\N	1	2026-06-07 17:54:46.80031	2026-06-07 17:54:46.80031
8284eb90-2b18-4dc1-beae-3d5762bbe41e	66b29b84-7be3-42f1-8e4a-2bf2f0571ade	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 17:54:46.80031	2026-06-07 17:54:54.177
0cc02a8d-18f5-47b0-ba9f-6c73a6f4c972	a6af5b32-b4f0-4219-8d43-3ec3335f4064	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 17:54:46.75932	2026-06-07 17:54:54.239
31ee364f-dbcb-4514-8a90-b69f810ae04c	737d67ae-a66b-466d-b111-a39fa6699190	in_app	pending	\N	\N	1	2026-06-07 18:43:15.590765	2026-06-07 18:43:15.590765
278a1675-6e1e-401e-88a0-9be0ae074781	7149de12-2a91-452d-9a93-f5688bc621e2	in_app	pending	\N	\N	1	2026-06-07 18:43:15.594924	2026-06-07 18:43:15.594924
cb9845e0-710a-4c67-a143-7c175c5c9fe6	737d67ae-a66b-466d-b111-a39fa6699190	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 18:43:15.590765	2026-06-07 18:43:22.656
b1616b0c-397d-40d7-8880-585b6f39b24e	7149de12-2a91-452d-9a93-f5688bc621e2	email	failed	\N	Missing `html` or `text` field.	3	2026-06-07 18:43:15.594924	2026-06-07 18:43:22.736
2062faec-1e70-4745-91a4-959f090377ca	1dc5ebd6-f03b-47bf-9b4e-ff6f42908a39	in_app	pending	\N	\N	1	2026-06-08 11:07:41.003396	2026-06-08 11:07:41.003396
d43fd39c-03d9-48f6-a6af-b6f180bb946d	cca70466-2cc8-4c09-bc2d-a608e23653f4	in_app	pending	\N	\N	1	2026-06-08 11:07:41.030469	2026-06-08 11:07:41.030469
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.notifications (id, user_id, type, title, message, data, read, created_at) FROM stdin;
c23a9b20-4dd0-48cd-806d-356b08dcf4e6	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 91aeb957-7890-47a1-ae1c-a4bc5206a9f8	{"eventType": "order.completed", "aggregateId": "91aeb957-7890-47a1-ae1c-a4bc5206a9f8"}	t	2026-06-07 17:49:31.684529
bdbb838b-8259-4b1d-b776-8c28d0aca95f	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 1238854a-ae24-4b5c-b42f-e7bbd0ee2c1c	{"eventType": "order.completed", "aggregateId": "1238854a-ae24-4b5c-b42f-e7bbd0ee2c1c"}	t	2026-06-07 12:09:56.594391
1621e265-b8be-47e8-9893-363f34dd2964	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: a3e6c398-fe32-4388-9bc1-c8e7c1a855b6	{"eventType": "order.completed", "aggregateId": "a3e6c398-fe32-4388-9bc1-c8e7c1a855b6"}	t	2026-06-07 12:11:20.198214
2ad0854f-fe2c-42a4-816c-d6f55dbffa6e	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 483788f6-49b5-4544-9601-a55aa23c1300	{"eventType": "order.completed", "aggregateId": "483788f6-49b5-4544-9601-a55aa23c1300"}	t	2026-06-07 12:26:30.792532
94a5f0f6-9c8f-4e87-9aff-6a48d568c159	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 3c3c963c-9acb-4bf4-af7a-c1c700704573	{"eventType": "order.completed", "aggregateId": "3c3c963c-9acb-4bf4-af7a-c1c700704573"}	t	2026-06-07 12:32:37.193561
3dc7ddbc-1937-4b41-8915-76de10da5a3b	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 91c49d7e-89e7-477b-81d5-696a589f3512	{"eventType": "order.completed", "aggregateId": "91c49d7e-89e7-477b-81d5-696a589f3512"}	t	2026-06-07 12:39:40.988152
a6af5b32-b4f0-4219-8d43-3ec3335f4064	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 205a2b90-f242-4e37-ac4f-7b8616cce538	{"eventType": "order.completed", "aggregateId": "205a2b90-f242-4e37-ac4f-7b8616cce538"}	f	2026-06-07 17:54:46.75932
66b29b84-7be3-42f1-8e4a-2bf2f0571ade	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	license	License Key Generated	License Key Generated: 7e7850dd-de28-422d-8837-41dca5bfb70b	{"eventType": "license.created", "aggregateId": "7e7850dd-de28-422d-8837-41dca5bfb70b"}	f	2026-06-07 17:54:46.80031
737d67ae-a66b-466d-b111-a39fa6699190	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 6fe53d74-d041-40c2-a9dc-421f266e3345	{"eventType": "order.completed", "aggregateId": "6fe53d74-d041-40c2-a9dc-421f266e3345"}	f	2026-06-07 18:43:15.590765
7149de12-2a91-452d-9a93-f5688bc621e2	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	license	License Key Generated	License Key Generated: fb2f05fc-59e9-4b7b-a052-ca329a202954	{"eventType": "license.created", "aggregateId": "fb2f05fc-59e9-4b7b-a052-ca329a202954"}	f	2026-06-07 18:43:15.594924
1dc5ebd6-f03b-47bf-9b4e-ff6f42908a39	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	billing	Order Confirmed	Order Confirmed: 50030e8e-72cc-45ea-b25b-95dbd3007034	{"eventType": "order.completed", "aggregateId": "50030e8e-72cc-45ea-b25b-95dbd3007034"}	f	2026-06-08 11:07:41.003396
cca70466-2cc8-4c09-bc2d-a608e23653f4	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	license	License Key Generated	License Key Generated: 2a3c4549-bf91-4f09-9d7f-66ae2ec8b2ea	{"eventType": "license.created", "aggregateId": "2a3c4549-bf91-4f09-9d7f-66ae2ec8b2ea"}	f	2026-06-08 11:07:41.030469
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.orders (id, user_id, product_id, plan, amount, currency, payment_method, payment_ref, status, coupon_code, discount_amount, tax_amount, created_at, updated_at) FROM stdin;
5e6779a0-2226-40a4-9be4-7ebf33326d96	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	conversionflow-wp	Starter	2150	BDT	bkash	7B6D8U2K3A	completed	\N	0	323	2026-06-05 20:50:01.842572	2026-06-05 20:50:31.311
9ff4c5cb-e01c-4635-b062-1f2f4332c7db	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	6ICOTYGEYS	completed	\N	0	323	2026-06-05 20:51:48.431906	2026-06-05 20:52:43.507
45f14518-d4ad-4042-a908-d52092ea8431	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	BHSLSJKMKM21	completed	\N	0	323	2026-06-07 12:01:29.543895	2026-06-07 12:01:44.432
1238854a-ae24-4b5c-b42f-e7bbd0ee2c1c	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Professional	3000	BDT	bkash	dhfghghjjuk	completed	\N	0	450	2026-06-07 12:09:41.669866	2026-06-07 12:09:56.251
a3e6c398-fe32-4388-9bc1-c8e7c1a855b6	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	HABNDVYE321	completed	\N	0	323	2026-06-07 12:10:58.097701	2026-06-07 12:11:20.36
483788f6-49b5-4544-9601-a55aa23c1300	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	fhghghghghg	completed	\N	0	323	2026-06-07 12:26:22.954084	2026-06-07 12:26:30.736
3c3c963c-9acb-4bf4-af7a-c1c700704573	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	AKJBSHJGD432	completed	\N	0	323	2026-06-07 12:32:29.969225	2026-06-07 12:32:37.104
91c49d7e-89e7-477b-81d5-696a589f3512	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	FSDSDSDMNSKLD	completed	\N	0	323	2026-06-07 12:39:35.884762	2026-06-07 12:39:40.707
91aeb957-7890-47a1-ae1c-a4bc5206a9f8	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	AHAKDKDYR321	completed	\N	0	323	2026-06-07 17:49:02.353205	2026-06-07 17:49:31.428
6fe53d74-d041-40c2-a9dc-421f266e3345	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2150	BDT	bkash	SOFMSOKFNF	completed	\N	0	280	2026-06-07 18:42:56.913842	2026-06-07 18:43:15.132
1b3b4ac2-86b2-4196-8b70-ed73e81e93ae	bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	conversionflow-wp-plugin	Starter	2150	BDT	ssl_commerz	\N	failed	\N	0	323	2026-06-05 20:48:58.692646	2026-06-07 18:48:33.464
205a2b90-f242-4e37-ac4f-7b8616cce538	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Professional	3000	BDT	bkash	JHALDMALDNBEVG	refunded	\N	0	450	2026-06-07 17:54:40.727638	2026-06-07 18:50:13.743
50030e8e-72cc-45ea-b25b-95dbd3007034	D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	conversionflow-wp	Starter	2250	BDT	bkash	JHSKDHKNDND	completed	\N	0	293	2026-06-08 11:07:16.046081	2026-06-08 11:07:39.88
\.


--
-- Data for Name: payment_accounts; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.payment_accounts (id, method, account_name, account_number, bank_name, branch, routing_number, instructions, active, created_at, updated_at) FROM stdin;
67de7b35-550f-44c4-bdfc-5f1bd442e2d3	ssl_commerz	Configure in Admin Settings	0000000000	\N	\N	\N	\N	f	2026-06-05 02:30:16.540968	2026-06-05 02:30:16.540968
357af755-5fbc-4cd4-98b1-755e5995bcab	bkash	Configure in Admin Settings	01721328992					t	2026-06-05 02:30:16.536541	2026-06-07 18:37:39.598
80f60786-5665-4244-b589-b5f707996926	nagad	Configure in Admin Settings	0000000000					f	2026-06-05 02:30:16.538356	2026-06-07 18:37:39.622
078020ed-60f8-4a66-9c2a-9d7cf975c1ff	rocket	Configure in Admin Settings	0000000000					f	2026-06-05 02:30:16.539245	2026-06-07 18:37:39.645
8bc5fe1d-e2e7-46fb-9378-d83af1b3cb3d	bank_transfer	Configure in Admin Settings	0000000000					f	2026-06-05 02:30:16.540092	2026-06-07 18:37:39.667
\.


--
-- Data for Name: product_plans; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.product_plans (id, product_id, name, slug, description, price_bdt, price_usd, license_type, billing_cycle, billing_duration_months, max_activations, features, sort_order, active, created_at, updated_at) FROM stdin;
14775e99-5310-40b5-96d0-d7de90372f76	87e39189-22a8-40df-a77f-d6f87c6e8bc7	Professional	professional	\N	3000	28	subscription	yearly	24	1	{}	1	t	2026-06-07 12:38:41.258256	2026-06-07 12:38:41.258256
b1bba1b9-3b64-4054-9a98-955ff0e89d95	87e39189-22a8-40df-a77f-d6f87c6e8bc7	Agency	agency	\N	8000	74	lifetime	\N	\N	1	{}	2	t	2026-06-07 12:39:05.363411	2026-06-07 12:39:05.363411
25440e70-4be4-44d3-9f84-eb35fe9ec5b3	87e39189-22a8-40df-a77f-d6f87c6e8bc7	Starter	starter	\N	2250	18	subscription	yearly	12	1	{}	0	t	2026-06-07 12:37:13.394795	2026-06-07 18:54:51.482
\.


--
-- Data for Name: product_versions; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.product_versions (id, product_id, version, download_url, changelog, status, released_at, created_at, updated_at) FROM stdin;
110c3503-4960-457d-a4c5-261533c4a4dd	87e39189-22a8-40df-a77f-d6f87c6e8bc7	0.0.191	https://github.com/mehedishubho/Devsroom-ConversionFlow/archive/refs/tags/0.0.1.zip	\N	draft	\N	2026-06-07 12:36:42.441021	2026-06-07 12:36:42.441021
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.products (id, name, slug, description, current_version, created_at, updated_at) FROM stdin;
87e39189-22a8-40df-a77f-d6f87c6e8bc7	ConversionFlow WP	conversionflow-wp	\N	\N	2026-06-07 12:36:28.790213	2026-06-07 12:36:28.790213
\.


--
-- Data for Name: redirects; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.redirects (id, from_url, to_url, type, is_regex, hit_count, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seo_404_errors; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.seo_404_errors (id, url, referrer, hit_count, last_seen_at, created_at) FROM stdin;
46faf572-b85c-4b29-93bf-693331ac1743	/admin	http://localhost:3000/admin	21	2026-06-05 12:17:53.787	2026-06-05 12:15:29.687506
dbab1107-7c15-4026-a4ed-526497942e56	/test		2	2026-06-05 19:42:32.62	2026-06-05 19:42:31.355274
d6d2da8b-80f0-466e-9129-893d6d06e582	/styles.css.map		18	2026-06-06 16:42:03.734	2026-06-05 19:37:50.180543
55248d1d-349a-4e8f-8061-91905ef514ff	/.well-known/appspecific/com.chrome.devtools.json		32	2026-06-07 19:26:40.778	2026-06-05 16:34:49.219098
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.settings (key, value, updated_at) FROM stdin;
max_transfers_per_month	1	2026-06-08 11:36:50.266
email_provider	resend	2026-06-06 12:49:17.415287
smtp_host		2026-06-06 12:49:17.41949
smtp_port		2026-06-06 12:49:17.421791
smtp_user	admin@salesconversionflow.com	2026-06-06 12:49:17.424176
smtp_pass	Clay125524#	2026-06-06 12:49:17.426427
smtp_from	support@salesconversionflow.com	2026-06-06 12:49:17.429371
meta_matching_fields		2026-06-06 16:13:17.927
meta_events	{"PageView":true,"ViewContent":true,"AddToCart":true,"InitiateCheckout":true,"Purchase":true,"Lead":true}	2026-06-06 16:13:17.929
meta_event_deduplication	false	2026-06-06 16:13:17.932
backup_cloud_s3_access_key	admin@salesconversionflow.com	2026-06-08 12:41:18.045
backup_cloud_s3_secret_key	Clay125524#	2026-06-08 12:41:19.381713
seo_page_overrides_home	{"title":"ConversionFlow — WooCommerce Automation for Bangladesh","schemaType":"WebPage"}	2026-06-07 11:02:01.146
vat_rate	15	2026-06-07 18:37:39.566
vat_mode	inclusive	2026-06-07 18:37:39.57
vat_enabled	true	2026-06-07 18:37:39.573
ssl_commerz_store_id	mehedihassanshubho@gmail.com	2026-06-07 18:37:39.689
ssl_commerz_store_password	Clay125524#	2026-06-07 18:37:39.692
ssl_commerz_sandbox	true	2026-06-07 18:37:39.695
seo_verify_google	<meta name="google-site-verification" content="4zXN_m_82kd843JKDS_example_uOgoh1KUoQcgr9o2s" />	2026-06-06 15:32:31.693
seo_verify_bing		2026-06-06 15:32:31.696
seo_verify_yandex		2026-06-06 15:32:31.699
seo_verify_baidu		2026-06-06 15:32:31.701
seo_verify_pinterest		2026-06-06 15:32:31.704
seo_sitemap_enabled		2026-06-06 15:39:05.231
seo_sitemap_pages	true	2026-06-06 15:39:05.234
seo_sitemap_blog	true	2026-06-06 15:39:05.237
seo_sitemap_docs	true	2026-06-06 15:39:05.24
seo_sitemap_landing	true	2026-06-06 15:39:05.243
seo_sitemap_excludes		2026-06-06 15:39:05.245
seo_sitemap_frequency		2026-06-06 15:39:05.248
seo_sitemap_auto_regenerate	true	2026-06-06 15:39:05.251
seo_sitemap_last_generated	2026-06-06T15:39:05.272Z	2026-06-06 15:39:05.746
seo_robots_txt	User-agent: Applebot-Extended\nAllow: /\n\nSitemap: https://conversionflow.com/sitemap.xml	2026-06-06 16:03:05.167
seo_ai_bots	{"GPTBot":true,"ChatGPT-User":true,"ClaudeBot":true,"PerplexityBot":true,"Google-Extended":true,"Bytespider":true,"FacebookBot":true,"Applebot-Extended":true}	2026-06-06 16:03:05.169
seo_linkedin_image		2026-06-06 16:23:05.219
seo_ai_usage_rules	{"allowSummarization":true,"allowTraining":true,"requireAttribution":true,"allowCommercialUse":true}	2026-06-06 16:30:31.576
seo_image_auto_alt	true	2026-06-06 16:32:02.871
seo_image_webp	true	2026-06-06 16:32:02.874
seo_image_lazy_loading	false	2026-06-06 16:32:02.876
tiktok_pixel_id	admin@salesconversionflow.comh	2026-06-06 16:15:52.766
seo_image_compression	true	2026-06-06 16:32:02.878
seo_perf_critical_css	true	2026-06-06 16:35:36.215114
seo_perf_js_defer	true	2026-06-06 16:35:36.217874
meta_pixel_id	admin@salesconversionflow.com	2026-06-06 16:13:17.913
meta_capi_token	Clay125524#	2026-06-06 16:13:17.916
meta_dataset_id	jjgg	2026-06-06 16:13:17.919
meta_test_event_code		2026-06-06 16:13:17.921
meta_advanced_matching		2026-06-06 16:13:17.924
tiktok_events_token	Clay125524#	2026-06-06 16:15:52.774
tiktok_advanced_matching		2026-06-06 16:15:52.784
tiktok_matching_fields		2026-06-06 16:15:52.792
tiktok_server_side		2026-06-06 16:15:52.796
tiktok_events	{"PageView":false,"ViewContent":true}	2026-06-06 16:15:52.804
google_analytics_id		2026-06-06 16:17:28.622837
google_tag_manager_id		2026-06-06 16:17:28.625555
google_ads_conversion_id		2026-06-06 16:17:28.627893
google_ads_conversion_label		2026-06-06 16:17:28.630118
google_server_side	true	2026-06-06 16:17:28.632378
google_enhanced_ecommerce	true	2026-06-06 16:17:28.634486
seo_schema_auto_generate		2026-06-06 16:19:35.609
seo_schema_overrides		2026-06-06 16:19:35.612
seo_schema_types_enabled	{"Organization":true,"WebSite":true,"BreadcrumbList":true,"Product":true,"FAQ":false}	2026-06-06 16:19:35.615
seo_fb_app_id		2026-06-06 16:23:05.203
seo_share_title		2026-06-06 16:23:05.206
seo_share_description		2026-06-06 16:23:05.209
seo_share_image	https://www.pexels.com/photo/men-in-crown-and-with-drum-on-traditional-ceremony-15228018/	2026-06-06 16:23:05.212
seo_twitter_handle		2026-06-06 16:23:05.214
seo_twitter_card_type		2026-06-06 16:23:05.216
seo_perf_minification	true	2026-06-06 16:35:36.220869
seo_perf_cdn_url		2026-06-06 16:35:36.223124
seo_perf_cache_settings	{"maxAge":"3600","staleWhileRevalidate":"86400"}	2026-06-06 16:35:36.225203
seo_title	ConversionFlow — WooCommerce Automation for Bangladesh	2026-06-06 16:36:54.483
seo_description		2026-06-06 16:36:54.486
seo_keywords		2026-06-06 16:36:54.489
seo_canonical_url		2026-06-06 16:36:54.491
seo_separator		2026-06-06 16:36:54.493
seo_robots_default		2026-06-06 16:36:54.496
seo_og_image		2026-06-06 16:36:54.498
seo_auto_meta		2026-06-06 16:36:54.502
seo_lowercase_urls		2026-06-06 16:36:54.504
seo_trailing_slash		2026-06-06 16:36:54.507
ssl_commerz_enabled	true	2026-06-07 18:37:39.697
backup_cloud_s3_bucket		2026-06-08 12:41:18.05
backup_interval	weekly	2026-06-08 12:18:47.998
backup_retention_count	3	2026-06-08 12:18:48
backup_cloud_provider	gdrive	2026-06-08 12:41:18.039
backup_cloud_s3_endpoint		2026-06-08 12:41:18.043
backup_cloud_gdrive_client_id	admin@salesconversionflow.com	2026-06-08 12:41:18.052
backup_cloud_gdrive_client_secret	Clay125524#	2026-06-08 12:41:18.055
backup_cloud_gdrive_folder_id		2026-06-08 12:41:18.058
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.ticket_messages (id, ticket_id, user_id, message, attachments, created_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.tickets (id, user_id, subject, description, status, priority, assigned_to, attachments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: two_factor; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.two_factor (id, secret, backup_codes, user_id, verified) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at, role, banned, ban_reason, ban_expires, two_factor_enabled, phone, notification_preferences) FROM stdin;
bjm2tln0OQS34xGwoqwwGawjWmTLKh8C	Super Admin MHS	admin@salesconversionflow.com	f	\N	2026-06-05 02:26:56.864	2026-06-05 02:26:56.924	super_admin	f	\N	\N	f	+880000000000	{"system": true, "billing": true, "license": true, "support": true, "channels": {"email": true, "in_app": true}}
D4Yo7Icxi1QE3gzAcVNv21AqDhHpkhLG	MEHEDI HASSAN SHUBHO	mehedihassanshubho@gmail.com	f	\N	2026-06-05 20:51:31.7	2026-06-05 20:51:31.7	user	f	\N	\N	f	+8801721328992	{"system": true, "billing": true, "license": true, "support": true, "channels": {"email": true, "in_app": true}}
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webhook_deliveries; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.webhook_deliveries (id, webhook_id, event, payload, status_code, response, success, attempts, created_at) FROM stdin;
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: wpmhs
--

COPY public.webhooks (id, url, events, secret, status, last_triggered_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: wpmhs
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: wpmhs
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_locale_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_locale_unique UNIQUE (slug, locale);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_locale_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_locale_unique UNIQUE (slug, locale);


--
-- Name: coupon_applicable_plans coupon_applicable_plans_coupon_plan_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupon_applicable_plans
    ADD CONSTRAINT coupon_applicable_plans_coupon_plan_unique UNIQUE (coupon_id, plan_id);


--
-- Name: coupon_applicable_plans coupon_applicable_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupon_applicable_plans
    ADD CONSTRAINT coupon_applicable_plans_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: downloads downloads_download_token_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_download_token_unique UNIQUE (download_token);


--
-- Name: downloads downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: license_activations license_activations_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_activations
    ADD CONSTRAINT license_activations_pkey PRIMARY KEY (id);


--
-- Name: license_analytics_cache license_analytics_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_analytics_cache
    ADD CONSTRAINT license_analytics_cache_pkey PRIMARY KEY (id);


--
-- Name: license_reminders license_reminders_license_id_milestone_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_reminders
    ADD CONSTRAINT license_reminders_license_id_milestone_unique UNIQUE (license_id, milestone);


--
-- Name: license_reminders license_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_reminders
    ADD CONSTRAINT license_reminders_pkey PRIMARY KEY (id);


--
-- Name: license_transfers license_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_transfers
    ADD CONSTRAINT license_transfers_pkey PRIMARY KEY (id);


--
-- Name: license_transfers license_transfers_transfer_code_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_transfers
    ADD CONSTRAINT license_transfers_transfer_code_unique UNIQUE (transfer_code);


--
-- Name: licenses licenses_license_key_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_license_key_unique UNIQUE (license_key);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: notification_deliveries notification_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.notification_deliveries
    ADD CONSTRAINT notification_deliveries_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_accounts payment_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.payment_accounts
    ADD CONSTRAINT payment_accounts_pkey PRIMARY KEY (id);


--
-- Name: product_plans product_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_plans
    ADD CONSTRAINT product_plans_pkey PRIMARY KEY (id);


--
-- Name: product_plans product_plans_product_id_slug_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_plans
    ADD CONSTRAINT product_plans_product_id_slug_unique UNIQUE (product_id, slug);


--
-- Name: product_versions product_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_versions
    ADD CONSTRAINT product_versions_pkey PRIMARY KEY (id);


--
-- Name: product_versions product_versions_product_id_version_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_versions
    ADD CONSTRAINT product_versions_product_id_version_unique UNIQUE (product_id, version);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: seo_404_errors seo_404_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.seo_404_errors
    ADD CONSTRAINT seo_404_errors_pkey PRIMARY KEY (id);


--
-- Name: seo_404_errors seo_404_errors_url_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.seo_404_errors
    ADD CONSTRAINT seo_404_errors_url_unique UNIQUE (url);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: two_factor two_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.two_factor
    ADD CONSTRAINT two_factor_pkey PRIMARY KEY (id);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX "account_userId_idx" ON public.account USING btree (user_id);


--
-- Name: backups_created_at_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX backups_created_at_idx ON public.backups USING btree (created_at);


--
-- Name: backups_status_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX backups_status_idx ON public.backups USING btree (status);


--
-- Name: backups_type_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX backups_type_idx ON public.backups USING btree (type);


--
-- Name: blog_categories_locale_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX blog_categories_locale_idx ON public.blog_categories USING btree (locale);


--
-- Name: blog_posts_locale_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX blog_posts_locale_idx ON public.blog_posts USING btree (locale);


--
-- Name: blog_posts_status_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX blog_posts_status_idx ON public.blog_posts USING btree (status);


--
-- Name: coupon_applicable_plans_coupon_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX coupon_applicable_plans_coupon_id_idx ON public.coupon_applicable_plans USING btree (coupon_id);


--
-- Name: events_aggregate_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX events_aggregate_id_idx ON public.events USING btree (aggregate_id);


--
-- Name: events_correlation_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX events_correlation_id_idx ON public.events USING btree (correlation_id);


--
-- Name: events_timestamp_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX events_timestamp_idx ON public.events USING btree ("timestamp");


--
-- Name: events_type_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX events_type_idx ON public.events USING btree (type);


--
-- Name: license_activations_created_at_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_activations_created_at_idx ON public.license_activations USING btree (created_at);


--
-- Name: license_activations_domain_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_activations_domain_idx ON public.license_activations USING btree (domain);


--
-- Name: license_activations_license_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_activations_license_id_idx ON public.license_activations USING btree (license_id);


--
-- Name: license_analytics_cache_snapshot_date_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_analytics_cache_snapshot_date_idx ON public.license_analytics_cache USING btree (snapshot_date);


--
-- Name: license_reminders_license_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_reminders_license_id_idx ON public.license_reminders USING btree (license_id);


--
-- Name: license_transfers_from_user_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_transfers_from_user_id_idx ON public.license_transfers USING btree (from_user_id);


--
-- Name: license_transfers_license_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_transfers_license_id_idx ON public.license_transfers USING btree (license_id);


--
-- Name: license_transfers_transfer_code_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX license_transfers_transfer_code_idx ON public.license_transfers USING btree (transfer_code);


--
-- Name: notification_deliveries_channel_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX notification_deliveries_channel_idx ON public.notification_deliveries USING btree (channel);


--
-- Name: notification_deliveries_notification_id_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX notification_deliveries_notification_id_idx ON public.notification_deliveries USING btree (notification_id);


--
-- Name: notification_deliveries_status_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX notification_deliveries_status_idx ON public.notification_deliveries USING btree (status);


--
-- Name: redirects_from_url_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX redirects_from_url_idx ON public.redirects USING btree (from_url);


--
-- Name: redirects_status_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX redirects_status_idx ON public.redirects USING btree (status);


--
-- Name: seo_404_errors_last_seen_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX seo_404_errors_last_seen_idx ON public.seo_404_errors USING btree (last_seen_at);


--
-- Name: twoFactor_secret_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX "twoFactor_secret_idx" ON public.two_factor USING btree (secret);


--
-- Name: twoFactor_userId_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX "twoFactor_userId_idx" ON public.two_factor USING btree (user_id);


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: wpmhs
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: account account_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_category_id_blog_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_blog_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.blog_categories(id);


--
-- Name: coupon_applicable_plans coupon_applicable_plans_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupon_applicable_plans
    ADD CONSTRAINT coupon_applicable_plans_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: coupon_applicable_plans coupon_applicable_plans_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupon_applicable_plans
    ADD CONSTRAINT coupon_applicable_plans_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.product_plans(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_applicable_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_applicable_product_id_fkey FOREIGN KEY (applicable_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: license_activations license_activations_license_id_licenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_activations
    ADD CONSTRAINT license_activations_license_id_licenses_id_fk FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: license_reminders license_reminders_license_id_licenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_reminders
    ADD CONSTRAINT license_reminders_license_id_licenses_id_fk FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: license_transfers license_transfers_license_id_licenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.license_transfers
    ADD CONSTRAINT license_transfers_license_id_licenses_id_fk FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: licenses licenses_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: notification_deliveries notification_deliveries_notification_id_notifications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.notification_deliveries
    ADD CONSTRAINT notification_deliveries_notification_id_notifications_id_fk FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: product_plans product_plans_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_plans
    ADD CONSTRAINT product_plans_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_versions product_versions_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.product_versions
    ADD CONSTRAINT product_versions_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: ticket_messages ticket_messages_ticket_id_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: two_factor two_factor_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.two_factor
    ADD CONSTRAINT two_factor_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: webhook_deliveries webhook_deliveries_webhook_id_webhooks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: wpmhs
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_webhook_id_webhooks_id_fk FOREIGN KEY (webhook_id) REFERENCES public.webhooks(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: wpmhs
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict PGrVCygLL8Kn9hIFU6hTZl8ic9AGP379tkiNaixqs4Uy9IvDHgCnroPG6beFLUv

