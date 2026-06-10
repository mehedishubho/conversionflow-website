"use client";

import React, { useState, useEffect } from "react";
import { getActiveGateways } from "@/app/(portal)/actions/checkout";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface GatewaySelectorProps {
  currency: "BDT" | "USD";
  selectedGateway: string | null;
  onGatewaySelect: (id: string) => void;
}

interface GatewayOption {
  gatewayId: string;
  name: string;
  type: "automatic" | "manual";
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const gatewayIcons: Record<string, { letter: string; color: string }> = {
  ssl_commerz: { letter: "S", color: "#1A5F9E" },
  bkash_api: { letter: "b", color: "#E2136E" },
  paddle: { letter: "P", color: "#3B82F6" },
  bkash: { letter: "b", color: "#E2136E" },
  nagad: { letter: "N", color: "#F6921E" },
  rocket: { letter: "R", color: "#8C3494" },
  bank_transfer: { letter: "B", color: "#667085" },
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function GatewaySelector({
  currency,
  selectedGateway,
  onGatewaySelect,
}: GatewaySelectorProps) {
  const [automaticGateways, setAutomaticGateways] = useState<GatewayOption[]>([]);
  const [manualGateways, setManualGateways] = useState<GatewayOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getActiveGateways(currency);
        setAutomaticGateways(
          (result.automatic as Array<{ gatewayId: string; name: string }>).map(
            (g) => ({ ...g, type: "automatic" as const })
          )
        );
        setManualGateways(
          (result.manual as Array<{ method: string; accountName: string }>).map(
            (m) => ({
              gatewayId: m.method,
              name: m.accountName || m.method,
              type: "manual" as const,
            })
          )
        );
      } catch {
        setAutomaticGateways([]);
        setManualGateways([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currency]);

  const allGateways = [...automaticGateways, ...manualGateways];

  if (loading) {
    return (
      <div>
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
          Select Payment Method
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (allGateways.length === 0) {
    return (
      <div>
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
          Select Payment Method
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No payment methods available for {currency}. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
        Select Payment Method
      </h3>

      {/* Automatic Gateways */}
      {automaticGateways.length > 0 && (
        <div className="space-y-3 mb-4">
          {automaticGateways.map((gateway) => {
            const isSelected = selectedGateway === gateway.gatewayId;
            const icon = gatewayIcons[gateway.gatewayId] || {
              letter: gateway.name.charAt(0),
              color: "#667085",
            };

            return (
              <button
                key={gateway.gatewayId}
                type="button"
                onClick={() => onGatewaySelect(gateway.gatewayId)}
                className={`w-full rounded-xl p-4 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border border-gray-300 bg-white hover:border-gray-400 hover:shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                }`}
                style={
                  isSelected
                    ? { borderLeftWidth: "3px", borderLeftColor: icon.color }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: icon.color }}
                  >
                    {icon.letter}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {gateway.name}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Automatic payment
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Manual Methods */}
      {manualGateways.length > 0 && (
        <div>
          {automaticGateways.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider font-medium">
              Manual Payment
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {manualGateways.map((gateway) => {
              const isSelected = selectedGateway === gateway.gatewayId;
              const icon = gatewayIcons[gateway.gatewayId] || {
                letter: gateway.name.charAt(0),
                color: "#667085",
              };

              return (
                <button
                  key={gateway.gatewayId}
                  type="button"
                  onClick={() => onGatewaySelect(gateway.gatewayId)}
                  className={`relative rounded-xl p-4 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border border-gray-300 bg-white hover:border-gray-400 hover:shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
                  }`}
                  style={
                    isSelected
                      ? { borderLeftWidth: "3px", borderLeftColor: icon.color }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: icon.color }}
                    >
                      {icon.letter}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {gateway.gatewayId === "bkash"
                        ? "bKash"
                        : gateway.gatewayId === "nagad"
                          ? "Nagad"
                          : gateway.gatewayId === "rocket"
                            ? "Rocket"
                            : gateway.gatewayId === "bank_transfer"
                              ? "Bank Transfer"
                              : gateway.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
