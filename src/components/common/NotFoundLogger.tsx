"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { log404Error } from "@/app/(admin)/actions/admin-seo";

export default function NotFoundLogger() {
  const pathname = usePathname();
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    log404Error(pathname, document.referrer || null).catch(() => {});
  }, [pathname]);

  return null;
}
