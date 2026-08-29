"use client";

import { ScrollArea } from "@components/ScrollArea";
import { cn } from "@utils/helpers";
import AccessControlIcon from "@/assets/icons/AccessControlIcon";
import ActivityIcon from "@/assets/icons/ActivityIcon";
import ControlCenterIcon from "@/assets/icons/ControlCenterIcon";
import DNSIcon from "@/assets/icons/DNSIcon";
import PeerIcon from "@/assets/icons/PeerIcon";
import SettingsIcon from "@/assets/icons/SettingsIcon";
import TeamIcon from "@/assets/icons/TeamIcon";
import SidebarItem from "@/components/SidebarItem";
import { NavigationVersionInfo } from "@/components/VersionInfo";
import { useAnnouncement } from "@/contexts/AnnouncementProvider";
import { useApplicationContext } from "@/contexts/ApplicationProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { headerHeight } from "@/layouts/Header";
import { NetworkNavigation } from "@/modules/networks/misc/NetworkNavigation";
import * as React from "react";

type Props = {
  fullWidth?: boolean;
  hideOnMobile?: boolean;
};

/**
 * GoreeCloud Network keeps the primary shell focused on private-network
 * administration. Upstream cloud marketplace, distributor, MSP, billing,
 * Agent Network, reverse-proxy, and external-support navigation is deliberately
 * excluded from the GoreeCloud product experience.
 */
export default function Navigation({
  fullWidth = false,
  hideOnMobile = false,
}: Readonly<Props>) {
  const { bannerHeight } = useAnnouncement();
  const { isNavigationCollapsed } = useApplicationContext();
  const { permission, isRestricted } = usePermissions();

  return (
    <aside
      data-navigation
      aria-label="GoreeCloud Network navigation"
      className={cn(
        "group/navigation relative whitespace-nowrap border-r border-gray-200/70 bg-gray-50/80 transition-all",
        "dark:border-white/10 dark:bg-zinc-950/60",
        hideOnMobile ? "hidden md:block" : "",
        fullWidth
          ? "w-auto max-w-[22rem]"
          : "w-[15rem] min-w-[15rem] max-w-[15rem] overflow-y-auto",
        isNavigationCollapsed &&
          "md:fixed md:z-40 md:w-[64px] md:min-w-[64px] md:max-w-[64px] md:overflow-hidden md:hover:w-[15rem] md:hover:min-w-[15rem] md:hover:max-w-[15rem]",
      )}
      style={{ height: `calc(100vh - ${headerHeight + bannerHeight}px)` }}
    >
      <div className={cn(fullWidth ? "w-10/12" : "fixed z-0")}>
        <ScrollArea
          style={{
            height: !fullWidth
              ? `calc(100vh - ${headerHeight + bannerHeight}px)`
              : "100%",
          }}
        >
          <div
            className={cn(
              "flex w-[15rem] min-w-[15rem] max-w-[15rem] flex-col justify-between px-2 pb-3 pt-3 transition-all",
              isNavigationCollapsed &&
                "md:w-[64px] md:min-w-[64px] md:max-w-[64px] md:overflow-x-clip md:group-hover/navigation:w-[15rem] md:group-hover/navigation:min-w-[15rem] md:group-hover/navigation:max-w-[15rem]",
            )}
            style={{
              height: !fullWidth
                ? `calc(100vh - ${headerHeight + bannerHeight}px)`
                : "100%",
            }}
          >
            <div>
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-zinc-500">
                Network
              </div>
              <SidebarItemGroup>
                <SidebarItem
                  icon={<ControlCenterIcon size={16} />}
                  label="Overview"
                  href="/control-center"
                  visible={permission.policies.read}
                />
                <SidebarItem
                  icon={<PeerIcon />}
                  label="Devices"
                  href="/peers"
                  visible={!isRestricted}
                />
                <SidebarItem
                  icon={<AccessControlIcon />}
                  label="Access"
                  href="/access-control"
                  collapsible
                  visible={permission.policies.read}
                >
                  <SidebarItem
                    label="Policies"
                    href="/access-control"
                    isChild
                    exactPathMatch
                    visible={permission.policies.read}
                  />
                  <SidebarItem
                    label="Groups"
                    isChild
                    href="/groups"
                    visible={permission.policies.read}
                  />
                  <SidebarItem
                    label="Posture Checks"
                    isChild
                    href="/posture-checks"
                    exactPathMatch
                    visible={permission.policies.read}
                  />
                </SidebarItem>

                <NetworkNavigation />

                <SidebarItem
                  icon={<DNSIcon />}
                  label="DNS"
                  href="/dns"
                  collapsible
                  exactPathMatch
                  visible={permission.dns.read || permission.nameservers.read}
                >
                  <SidebarItem
                    label="Nameservers"
                    isChild
                    href="/dns/nameservers"
                    visible={permission.nameservers.read}
                  />
                  <SidebarItem
                    label="Zones"
                    isChild
                    href="/dns/zones"
                    visible={permission?.dns?.read}
                  />
                  <SidebarItem
                    label="DNS Settings"
                    isChild
                    href="/dns/settings"
                    visible={permission.dns.read}
                  />
                </SidebarItem>
              </SidebarItemGroup>

              <div className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-zinc-500">
                Administration
              </div>
              <SidebarItemGroup>
                <SidebarItem
                  icon={<TeamIcon />}
                  label="People & Identities"
                  href="/team"
                  collapsible
                  visible={permission.users.read}
                >
                  <SidebarItem
                    label="Users"
                    isChild
                    href="/team/users"
                    visible={permission.users.read}
                  />
                  <SidebarItem
                    label="Service Users"
                    isChild
                    href="/team/service-users"
                    visible={permission.users.read}
                  />
                </SidebarItem>
                <ActivityNavigationItem />
                <SidebarItem
                  icon={<SettingsIcon />}
                  label="Settings"
                  href="/settings"
                  exactPathMatch
                  visible={permission.settings.read}
                />
              </SidebarItemGroup>
            </div>

            <div className="mt-4 border-t border-gray-200/70 px-1 pt-3 dark:border-white/10">
              <div className="mb-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
                  Wardveil Security
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
                  Private-network protection
                </div>
              </div>
              <NavigationVersionInfo />
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

type SidebarItemGroupProps = {
  children: React.ReactNode;
};

export function SidebarItemGroup({ children }: SidebarItemGroupProps) {
  return <div className="space-y-1">{children}</div>;
}

const ActivityNavigationItem = () => {
  const { permission } = usePermissions();

  return (
    <SidebarItem
      icon={<ActivityIcon />}
      label="Activity"
      href="/events"
      collapsible
      visible={permission.events.read}
    >
      <SidebarItem
        label="Audit Events"
        href="/events/audit"
        isChild
        exactPathMatch
        visible={permission.events.read}
      />
      <SidebarItem
        label="Traffic Events"
        isChild
        href="/events/traffic"
        exactPathMatch
        visible={permission.events.read}
      />
    </SidebarItem>
  );
};
