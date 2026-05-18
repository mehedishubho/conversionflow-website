import React from "react";
import Badge from "@/components/ui/badge/Badge";

interface PiracyFlagBadgeProps {
  severity: "high" | "medium" | "low";
  type: string;
}

const severityColorMap: Record<
  "high" | "medium" | "low",
  "error" | "warning" | "info"
> = {
  high: "error",
  medium: "warning",
  low: "info",
};

export default function PiracyFlagBadge({ severity, type }: PiracyFlagBadgeProps) {
  const color = severityColorMap[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <Badge variant="light" color={color} size="sm">
      {label}: {type.replace(/_/g, " ")}
    </Badge>
  );
}
