"use client";

import React from "react";

interface AnalyticsDashboardClientProps {
  initialStats: {
    sessions: number;
    realTimeUsers: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
  initialTrafficData: {
    categories: string[];
    values: number[];
  };
  initialTopPages: {
    path: string;
    views: number;
    uniqueVisitors: number;
    bounceRate: number;
  }[];
  initialRange: string;
}

export default function AnalyticsDashboardClient({
  initialStats,
  initialTrafficData,
  initialTopPages,
}: AnalyticsDashboardClientProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Sessions</p>
          <p className="text-2xl font-semibold">{initialStats.sessions.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Page Views</p>
          <p className="text-2xl font-semibold">{initialStats.pageViews.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Real-time Users</p>
          <p className="text-2xl font-semibold">{initialStats.realTimeUsers.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Top Pages</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Path</th>
              <th className="text-right">Views</th>
              <th className="text-right">Unique Visitors</th>
              <th className="text-right">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {initialTopPages.map((page) => (
              <tr key={page.path}>
                <td>{page.path}</td>
                <td className="text-right">{page.views.toLocaleString()}</td>
                <td className="text-right">{page.uniqueVisitors.toLocaleString()}</td>
                <td className="text-right">{page.bounceRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
