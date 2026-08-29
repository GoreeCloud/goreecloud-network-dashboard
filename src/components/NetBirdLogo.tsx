import { cn } from "@utils/helpers";
import * as React from "react";

type Props = {
  size?: "default" | "large";
  mobile?: boolean;
};

/**
 * Compatibility export retained while the dashboard is progressively migrated
 * away from upstream presentation identifiers. The implementation is fully
 * GoreeCloud-owned and does not depend on upstream logo artwork.
 */
export const NetBirdLogo = ({ size = "default", mobile = true }: Props) => {
  return (
    <div
      className={cn(
        "group/brand flex items-center gap-2.5 select-none",
        size === "large" ? "text-base" : "text-sm",
      )}
      aria-label="GoreeCloud Network"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative grid place-items-center rounded-[10px] border border-white/10",
          "bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.14)]",
          size === "large" ? "h-9 w-9" : "h-8 w-8",
        )}
      >
        <span className="absolute inset-[5px] rounded-[7px] border border-sky-300/45 bg-sky-400/10" />
        <span className="relative h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.55)]" />
      </span>
      <span className={cn("min-w-0", mobile && "hidden md:block")}>
        <span className="block truncate font-semibold tracking-[-0.01em] text-gray-950 dark:text-white">
          GoreeCloud Network
        </span>
        <span className="block text-[10px] font-medium tracking-[0.08em] text-gray-500 dark:text-zinc-400">
          PRIVATE NETWORK
        </span>
      </span>
    </div>
  );
};
