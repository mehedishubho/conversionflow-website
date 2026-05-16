"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center text-text2 bg-surface border border-border rounded-full h-11 w-11 hover:bg-accent-light transition-colors"
      aria-label="Toggle Theme"
    >
      {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
    </button>
  );
}
