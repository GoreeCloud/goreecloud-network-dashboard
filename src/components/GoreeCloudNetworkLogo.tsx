import { cn } from "@utils/helpers";
import Image from "next/image";
import * as React from "react";
import GoreeCloudNetworkMark from "@/assets/goreecloud-network.svg";

type Props = {
  size?: "default" | "large";
  mobile?: boolean;
};

const sizes = {
  default: {
    desktop: 30,
    mobile: 30,
  },
  large: {
    desktop: 40,
    mobile: 40,
  },
};

export const GoreeCloudNetworkLogo = ({
  size = "default",
  mobile = true,
}: Props) => {
  return (
    <>
      <span
        className={cn(
          "items-center gap-2.5 text-left",
          mobile ? "hidden md:flex" : "flex",
        )}
      >
        <Image
          src={GoreeCloudNetworkMark}
          width={sizes[size].desktop}
          height={sizes[size].desktop}
          alt=""
          aria-hidden="true"
        />
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-medium tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
            GoreeCloud
          </span>
          <span className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
            Network
          </span>
        </span>
      </span>
      {mobile && (
        <Image
          src={GoreeCloudNetworkMark}
          width={sizes[size].mobile}
          height={sizes[size].mobile}
          alt="GoreeCloud Network"
          className="ml-4 md:hidden"
        />
      )}
    </>
  );
};
