"use client";

import React, { useState, useTransition } from "react";
import DateRangeSelector from "@/components/admin/DateRangeSelector";
import ComponentCard from "@/components/common/ComponentCard";
import IndexedPagesCards from "./IndexedPagesCards";
import TopPagesTable from "./TopPagesTable";
import TrafficOverviewChart from "./TrafficOverviewChart";
import KeywordRankingsTable from "./KeywordRankingsTable";
import CtrImpressionsChart from "./CtrImpressionsChart";
import Errors404Table from "./Errors404Table";
import SitemapHealthCards from "./SitemapHealthCards";
import CrawlIssuesPanel from "./CrawlIssuesPanel";
import { getGa4Summary } from "@/app/(admin)/actions/admin-tracking-v2";

interface Ga4SummaryData {
  activeUsers: string;
  pageviews: string;
  sessions: string;
  topPages: { path: string; views: number }[];
}

interface Error404 {
  id: string;
  url: string;
  referrer: string | null;
  hitCount: number;
  lastSeenAt: Date;
  createdAt: Date;
}

interface SitemapHealthData {
  totalUrls: number;
  lastGenerated: string;
  xmlValid: boolean;
  sitemapEnabled: boolean;
}

interface SeoAnalyticsClientProps {
  initialGa4Data: Ga4SummaryData;
  initialErrors: { errors: Error404[]; total: number };
  initialSitemapHealth: SitemapHealthData;
  initialRange: string;
}

export default function SeoAnalyticsClient({
  initialGa4Data,
  initialErrors,
  initialSitemapHealth,
  initialRange,
}: SeoAnalyticsClientProps) {
  const [activeRange, setActiveRange] = useState(initialRange);
  const [isPending, startTransition] = useTransition();
  const [ga4Data, setGa4Data] = useState(initialGa4Data);
  const [errorsData] = useState(initialErrors);
  const [sitemapHealth] = useState(initialSitemapHealth);

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    startTransition(async () => {
      const newGa4Data = await getGa4Summary(range as "7d" | "30d" | "90d" | "year");
      setGa4Data(newGa4Data);
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 font-syne">
          SEO Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor indexed pages, keyword rankings, CTR, and site health.
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector activeRange={activeRange} onRangeChange={handleRangeChange} />

      {/* Content with loading indicator */}
      <div className={`transition-opacity ${isPending ? "opacity-60" : "opacity-100"} space-y-6`}>
        {/* Analytics Overview */}
        <ComponentCard title="Analytics Overview" desc="Key metrics and top performing pages.">
          <IndexedPagesCards ga4Data={ga4Data} errorCount={errorsData.total} />
          <TopPagesTable topPages={ga4Data.topPages} />
          <TrafficOverviewChart topPages={ga4Data.topPages} range={activeRange} />
        </ComponentCard>

        {/* Keyword Rankings Placeholder */}
        <ComponentCard title="Keyword Rankings" desc="Track keyword positions and search performance.">
          <KeywordRankingsTable />
        </ComponentCard>

        {/* CTR & Impressions Placeholder */}
        <ComponentCard title="CTR & Impressions" desc="Click-through rate and search impression trends.">
          <CtrImpressionsChart />
        </ComponentCard>

        {/* 404 Error Reports */}
        <ComponentCard title="404 Error Reports" desc="Pages returning 404 errors and broken links.">
          <Errors404Table errors={errorsData.errors} total={errorsData.total} />
        </ComponentCard>

        {/* Sitemap Health & Crawl Issues */}
        <ComponentCard title="Sitemap Health & Crawl Issues" desc="Sitemap status and search engine crawl diagnostics.">
          <SitemapHealthCards health={sitemapHealth} />
          <CrawlIssuesPanel />
        </ComponentCard>
      </div>
    </div>
  );
}
