"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/login");
    } catch {
      // Sign out failed silently
    }
  }

  // Loading / no-session state
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-surface2 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent-light transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center h-9 w-9 rounded-full bg-accent-light text-accent font-semibold text-sm">
            {initials}
          </span>
        )}

        <div className="hidden sm:block">
          <div className="text-sm font-medium text-foreground leading-tight">
            {user.name}
          </div>
          {user.role && (
            <span className="bg-accent-light text-accent text-xs px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-text2 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown menu */}
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* User info */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-text2">{user.email}</p>
        </div>

        <div className="py-1">
          <DropdownItem
            tag="a"
            href="/dashboard/account"
            onItemClick={() => setIsOpen(false)}
            baseClassName="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-text2 hover:bg-accent-light hover:text-foreground transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </DropdownItem>

          <DropdownItem
            tag="a"
            href="/dashboard/account"
            onItemClick={() => setIsOpen(false)}
            baseClassName="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-text2 hover:bg-accent-light hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </DropdownItem>
        </div>

        <div className="border-t border-border py-1">
          <DropdownItem
            onClick={handleSignOut}
            baseClassName="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red hover:bg-red-lt transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
