"use client";

import Button from "@components/Button";
import { NetBirdLogo } from "@components/NetBirdLogo";
import { AnnouncementBanner } from "@components/ui/AnnouncementBanner";
import UserDropdown from "@components/ui/UserDropdown";
import { cn } from "@utils/helpers";
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useAnnouncement } from "@/contexts/AnnouncementProvider";
import { useApplicationContext } from "@/contexts/ApplicationProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";

export const headerHeight = 65;

export default function NavbarWithDropdown() {
  const router = useRouter();
  const { toggleMobileNav } = useApplicationContext();
  const { bannerHeight } = useAnnouncement();
  const { isRestricted } = usePermissions();

  return (
    <>
      <div
        className="fixed z-50 w-full"
        style={{ height: headerHeight + bannerHeight }}
      >
        <AnnouncementBanner />
        <header
          className={cn(
            "mx-2 mt-2 flex items-center justify-between rounded-2xl border px-3 py-2.5 sm:mx-4 sm:px-4",
            "border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-xl",
            "dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-[0_12px_36px_rgba(0,0,0,0.22)]",
          )}
        >
          <div className="flex items-center gap-2 md:hidden">
            <Button
              aria-label="Open navigation"
              className={cn(
                "!h-10 !w-10 !px-0",
                isRestricted && "pointer-events-none opacity-0",
              )}
              variant="default-outline"
              onClick={toggleMobileNav}
            >
              <MenuIcon size={19} />
            </Button>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <button
              aria-label="Open GoreeCloud Network peers"
              onClick={() => router.push("/peers")}
              className="rounded-xl p-1.5 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:hover:bg-white/5"
            >
              <NetBirdLogo />
            </button>
            <ToggleCollapsableNavigationButton />
          </div>

          <div className="flex items-center gap-2 md:order-2">
            <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 sm:block dark:text-emerald-300">
              Self-hosted
            </div>
            <UserDropdown />
          </div>
        </header>
      </div>
      <div style={{ height: headerHeight + bannerHeight }} />
    </>
  );
}

const ToggleCollapsableNavigationButton = () => {
  const { isRestricted } = usePermissions();
  const { toggleNavigation, isNavigationCollapsed } = useApplicationContext();

  if (isRestricted) return null;

  return (
    <button
      aria-label={isNavigationCollapsed ? "Expand navigation" : "Collapse navigation"}
      onClick={toggleNavigation}
      data-navbar-colappse-toggle
      className={cn(
        "ml-1 hidden h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition",
        "hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 md:flex",
        "dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
      )}
    >
      {isNavigationCollapsed ? (
        <PanelLeftOpenIcon size={17} />
      ) : (
        <PanelLeftCloseIcon size={17} />
      )}
    </button>
  );
};
