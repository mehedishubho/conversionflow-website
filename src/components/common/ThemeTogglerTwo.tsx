"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeTogglerTwo() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-2"
      aria-label="Toggle Theme"
    >
      {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
    </button>
  );
}
