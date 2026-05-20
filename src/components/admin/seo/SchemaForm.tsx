"use client";

import { useState, useTransition, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { saveTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import {
  SCHEMA_KEYS,
  type TrackingSettingsData,
} from "@/lib/tracking-keys";
import {
  organizationSchema,
  websiteSchema,
  productSchema,
  breadcrumbSchema,
} from "@/lib/schema-helpers";
import { ChevronDown, ExternalLink } from "lucide-react";

interface SchemaFormProps {
  initialData: TrackingSettingsData;
}

function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const RICH_RESULTS_TEST_URL = "https://search.google.com/test/rich-results";

interface SchemaFieldDef {
  id: string;
  label: string;
  multiline?: boolean;
  select?: boolean;
  options?: string[];
}

interface GlobalSchemaDef {
  key: string;
  label: string;
  desc: string;
  fields: SchemaFieldDef[];
}

interface ContentSchemaDef {
  key: string;
  label: string;
  desc: string;
  fields: SchemaFieldDef[];
  hasJsonTextarea?: boolean;
  jsonTextareaKey?: string;
  jsonTextareaHelp?: string;
}

const GLOBAL_SCHEMAS: GlobalSchemaDef[] = [
  {
    key: "Organization",
    label: "Organization Schema",
    desc: "Your organization's structured data for search engines.",
    fields: [
      { id: "org_name", label: "Organization Name" },
      { id: "org_url", label: "URL" },
      { id: "org_email", label: "Email" },
      { id: "org_logo", label: "Logo URL" },
      { id: "org_same_as", label: "Same-As Links (comma-separated URLs)", multiline: true },
    ],
  },
  {
    key: "WebSite",
    label: "Website Schema",
    desc: "Your website's structured data including search action.",
    fields: [
      { id: "site_name", label: "Site Name" },
      { id: "site_url", label: "URL" },
      { id: "search_action_url", label: "Search Action URL" },
    ],
  },
  {
    key: "BreadcrumbList",
    label: "Breadcrumb Schema",
    desc: "Breadcrumbs are auto-generated from page hierarchy. Override base URL below if needed.",
    fields: [
      { id: "breadcrumb_base_url", label: "Base URL for Breadcrumbs" },
    ],
  },
];

const CONTENT_SCHEMAS: ContentSchemaDef[] = [
  {
    key: "Product",
    label: "Product Schema",
    desc: "Product/SoftwareApplication structured data with pricing.",
    fields: [
      { id: "product_name", label: "Product Name" },
      { id: "product_description", label: "Description" },
      { id: "product_url", label: "URL" },
      { id: "product_category", label: "Category" },
      { id: "product_os", label: "Operating System" },
      { id: "product_low_price", label: "Low Price" },
      { id: "product_high_price", label: "High Price" },
      { id: "product_currency", label: "Currency" },
      { id: "product_offer_count", label: "Offer Count" },
    ],
  },
  {
    key: "Article",
    label: "Article Schema",
    desc: "Blog posting or news article structured data.",
    fields: [
      { id: "article_type", label: "Article Type", select: true, options: ["Article", "NewsArticle", "BlogPosting"] },
      { id: "article_author", label: "Author Name" },
      { id: "article_publisher", label: "Publisher Name" },
      { id: "article_image", label: "Image URL" },
    ],
  },
  {
    key: "FAQ",
    label: "FAQ Schema",
    desc: "FAQ page structured data with question/answer pairs.",
    fields: [],
    hasJsonTextarea: true,
    jsonTextareaKey: "faq_items",
    jsonTextareaHelp: "Enter FAQ items as JSON array: [{\"question\": \"...\", \"answer\": \"...\"}]",
  },
  {
    key: "HowTo",
    label: "HowTo Schema",
    desc: "How-to guide structured data with steps.",
    fields: [
      { id: "howto_name", label: "HowTo Name" },
      { id: "howto_description", label: "Description" },
    ],
    hasJsonTextarea: true,
    jsonTextareaKey: "howto_steps",
    jsonTextareaHelp: "Enter steps as JSON array: [{\"name\": \"Step 1\", \"text\": \"...\"}]",
  },
  {
    key: "Review",
    label: "Review Schema",
    desc: "Product or service review structured data.",
    fields: [
      { id: "review_item", label: "Item Reviewed" },
      { id: "review_rating", label: "Rating Value (1-5)" },
      { id: "review_author", label: "Author Name" },
    ],
  },
];

// Breadcrumb preview items (example)
const BREADCRUMB_PREVIEW = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/features" },
];

// Article schema generator (not in seo.ts, generated inline for preview)
function articleSchemaPreview(overrides: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@type": overrides.article_type || "Article",
    author: { "@type": "Person", name: overrides.article_author || "Admin" },
    publisher: {
      "@type": "Organization",
      name: overrides.article_publisher || "ConversionFlow",
    },
    ...(overrides.article_image ? { image: overrides.article_image } : {}),
  };
}

function faqSchemaPreview(overrides: Record<string, string>) {
  const raw = overrides.faq_items;
  if (!raw) return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [] };
  try {
    const items = JSON.parse(raw);
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: Array.isArray(items)
        ? items.map((item: { question: string; answer: string }) => ({
            "@type": "Question",
            name: item.question || "",
            acceptedAnswer: { "@type": "Answer", text: item.answer || "" },
          }))
        : [],
    };
  } catch {
    return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [], _error: "Invalid JSON" };
  }
}

function howToSchemaPreview(overrides: Record<string, string>) {
  const raw = overrides.howto_steps;
  let steps: { name: string; text: string }[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) steps = parsed;
    } catch {
      // keep empty
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: overrides.howto_name || "How to Use ConversionFlow",
    description: overrides.howto_description || "",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name || `Step ${i + 1}`,
      text: s.text || "",
    })),
  };
}

function reviewSchemaPreview(overrides: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: overrides.review_item || "ConversionFlow",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: overrides.review_rating || "5",
      bestRating: "5",
    },
    author: { "@type": "Person", name: overrides.review_author || "Admin" },
  };
}

function JsonLdPreview({ data }: { data: Record<string, unknown> }) {
  const cleanData = { ...data };
  // Remove _error from output
  if ("_error" in cleanData) delete cleanData._error;

  return (
    <div className="relative mt-3">
      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-auto max-h-64 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        {JSON.stringify(cleanData, null, 2)}
      </pre>
    </div>
  );
}

function RichResultsLink() {
  return (
    <a
      href={RICH_RESULTS_TEST_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors mt-2"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Validate with Google Rich Results Test
    </a>
  );
}

export default function SchemaForm({ initialData }: SchemaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Core state: 3 schema keys from SCHEMA_KEYS
  const [data, setData] = useState<TrackingSettingsData>({
    seo_schema_auto_generate: "true",
    seo_schema_types_enabled: '{"Organization":true,"WebSite":true,"BreadcrumbList":true}',
    seo_schema_overrides: "{}",
    ...initialData,
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Parsed derived state
  const autoGenerate = data.seo_schema_auto_generate !== "false";
  const typesEnabled: Record<string, boolean> = parseJsonSetting(
    data.seo_schema_types_enabled,
    { Organization: true, WebSite: true, BreadcrumbList: true }
  );
  const overrides: Record<string, string> = parseJsonSetting(
    data.seo_schema_overrides,
    {}
  );

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateOverride = useCallback(
    (fieldId: string, value: string) => {
      const newOverrides = { ...overrides, [fieldId]: value };
      updateField("seo_schema_overrides", JSON.stringify(newOverrides));
    },
    [overrides]
  );

  const toggleSchemaType = useCallback(
    (schemaKey: string, enabled: boolean) => {
      const updated = { ...typesEnabled, [schemaKey]: enabled };
      updateField("seo_schema_types_enabled", JSON.stringify(updated));
    },
    [typesEnabled]
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const schemaData: TrackingSettingsData = {};
        for (const key of SCHEMA_KEYS) {
          schemaData[key] = data[key] ?? "";
        }
        await saveTrackingSettings(schemaData);
        setMessage({
          type: "success",
          text: "Schema markup settings saved.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Auto Schema Generation Toggle */}
      <ComponentCard
        title="Auto Schema Generation"
        desc="When enabled, schema markup is automatically generated from existing site data (name, URL, pricing). Override individual fields below."
      >
        <Switch
          label="Auto-Generate Schema"
          defaultChecked={autoGenerate}
          onChange={(checked) =>
            updateField("seo_schema_auto_generate", checked ? "true" : "false")
          }
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-3">
          {autoGenerate
            ? "Schema will be auto-generated from site data. Use fields below to override specific values."
            : "Auto-generation is OFF. All schema fields must be configured manually below."}
        </p>
      </ComponentCard>

      {/* Global Schemas Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3 px-1">
          Global Schemas
        </h3>
        <div className="space-y-4">
          {GLOBAL_SCHEMAS.map((schema) => (
            <SchemaSection
              key={schema.key}
              schemaKey={schema.key}
              label={schema.label}
              desc={schema.desc}
              enabled={typesEnabled[schema.key] !== false}
              expanded={expandedSections[schema.key] || false}
              onToggleEnabled={(checked) => toggleSchemaType(schema.key, checked)}
              onToggleExpand={() => toggleSection(schema.key)}
            >
              <div className="space-y-4">
                {schema.fields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {field.label}
                    </label>
                    {field.multiline ? (
                      <textarea
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 min-h-[80px]"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        defaultValue={overrides[field.id] || ""}
                        onChange={(e) => updateOverride(field.id, e.target.value)}
                      />
                    ) : (
                      <InputField
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        defaultValue={overrides[field.id] || ""}
                        onChange={(e) => updateOverride(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                {/* JSON-LD Preview */}
                <div className="pt-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    JSON-LD Preview
                  </label>
                  {schema.key === "Organization" && (
                    <JsonLdPreview data={organizationSchema(overrides) as unknown as Record<string, unknown>} />
                  )}
                  {schema.key === "WebSite" && (
                    <JsonLdPreview data={websiteSchema(overrides) as unknown as Record<string, unknown>} />
                  )}
                  {schema.key === "BreadcrumbList" && (
                    <JsonLdPreview data={breadcrumbSchema(BREADCRUMB_PREVIEW, overrides) as unknown as Record<string, unknown>} />
                  )}
                  <RichResultsLink />
                </div>
              </div>
            </SchemaSection>
          ))}
        </div>
      </div>

      {/* Content Schemas Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3 px-1">
          Content Schemas
        </h3>
        <div className="space-y-4">
          {CONTENT_SCHEMAS.map((schema) => (
            <SchemaSection
              key={schema.key}
              schemaKey={schema.key}
              label={schema.label}
              desc={schema.desc}
              enabled={typesEnabled[schema.key] === true}
              expanded={expandedSections[schema.key] || false}
              onToggleEnabled={(checked) => toggleSchemaType(schema.key, checked)}
              onToggleExpand={() => toggleSection(schema.key)}
            >
              <div className="space-y-4">
                {schema.fields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {field.label}
                    </label>
                    {"select" in field && field.select ? (
                      <select
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                        value={overrides[field.id] || field.options?.[0] || ""}
                        onChange={(e) => updateOverride(field.id, e.target.value)}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <InputField
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        defaultValue={overrides[field.id] || ""}
                        onChange={(e) => updateOverride(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                {/* JSON textarea for FAQ/HowTo */}
                {schema.hasJsonTextarea && schema.jsonTextareaKey && (() => {
                  const jsonKey = schema.jsonTextareaKey;
                  return (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      JSON Data
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-mono shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 min-h-[120px]"
                      placeholder={
                        schema.jsonTextareaHelp || "Enter JSON data"
                      }
                      defaultValue={overrides[jsonKey] || ""}
                      onChange={(e) =>
                        updateOverride(jsonKey, e.target.value)
                      }
                    />
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {schema.jsonTextareaHelp}
                    </p>
                  </div>
                  );
                })()}

                {/* JSON-LD Preview */}
                <div className="pt-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    JSON-LD Preview
                  </label>
                  {schema.key === "Product" && (
                    <JsonLdPreview data={productSchema(overrides) as unknown as Record<string, unknown>} />
                  )}
                  {schema.key === "Article" && (
                    <JsonLdPreview data={articleSchemaPreview(overrides)} />
                  )}
                  {schema.key === "FAQ" && (
                    <JsonLdPreview data={faqSchemaPreview(overrides)} />
                  )}
                  {schema.key === "HowTo" && (
                    <JsonLdPreview data={howToSchemaPreview(overrides)} />
                  )}
                  {schema.key === "Review" && (
                    <JsonLdPreview data={reviewSchemaPreview(overrides)} />
                  )}
                  <RichResultsLink />
                </div>
              </div>
            </SchemaSection>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Schema Settings"}
        </Button>
      </div>
    </div>
  );
}

// Collapsible schema section component
function SchemaSection({
  schemaKey,
  label,
  desc,
  enabled,
  expanded,
  onToggleEnabled,
  onToggleExpand,
  children,
}: {
  schemaKey: string;
  label: string;
  desc: string;
  enabled: boolean;
  expanded: boolean;
  onToggleEnabled: (checked: boolean) => void;
  onToggleExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                enabled
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                {label}
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              label=""
              defaultChecked={enabled}
              onChange={onToggleEnabled}
            />
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Body */}
      {expanded && (
        <div className="px-6 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
