"use client";

import Breadcrumbs from "@components/Breadcrumbs";
import Paragraph from "@components/Paragraph";
import SkeletonTable from "@components/skeletons/SkeletonTable";
import FullScreenLoading from "@components/ui/FullScreenLoading";
import { usePortalElement } from "@hooks/usePortalElement";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { lazy, Suspense, useMemo } from "react";
import PeerIcon from "@/assets/icons/PeerIcon";
import { useBypassedPeers } from "@/cloud/edr/useBypass";
import PeersProvider, { usePeers } from "@/contexts/PeersProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { useUsers } from "@/contexts/UsersProvider";
import PageContainer from "@/layouts/PageContainer";
import type { PeersTableKind } from "@/modules/peers/PeersTable";
import { SetupModalContent } from "@/modules/setup-netbird-modal/SetupModal";

const PeersTable = lazy(() => import("@/modules/peers/PeersTable"));

export default function PeersPage() {
  const { isRestricted } = usePermissions();

  return (
    <PageContainer>
      {isRestricted ? (
        <PeersBlockedView />
      ) : (
        <Suspense fallback={<FullScreenLoading />}>
          <PeersProvider>
            <PeersView />
          </PeersProvider>
        </Suspense>
      )}
    </PageContainer>
  );
}

function PeersView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const kindParam = searchParams?.get("kind");
  const kind: PeersTableKind | undefined =
    kindParam === "servers"
      ? "servers"
      : kindParam === "users"
        ? "users"
        : undefined;

  const onKindChange = (next: PeersTableKind | undefined) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) params.set("kind", next);
    else params.delete("kind");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const { peers, isLoading: isPeersLoading } = usePeers();
  const { users, isLoading: isUsersLoading } = useUsers();
  const { isBypassed } = useBypassedPeers();
  const { ref: headingRef, portalTarget } =
    usePortalElement<HTMLHeadingElement>();

  const isLoading = isPeersLoading || isUsersLoading;
  const peersWithUser = useMemo(() => {
    if (!peers || !users) return undefined;
    return peers.map((peer) => ({
      ...peer,
      user: users.find((u) => u.id === peer.user_id),
      force_approved: peer.id ? isBypassed(peer.id) : false,
    }));
  }, [peers, users, isBypassed]);

  return (
    <>
      <div className={"p-default py-6"}>
        <Breadcrumbs>
          <Breadcrumbs.Item
            href={"/peers"}
            label={"Devices"}
            icon={<PeerIcon size={13} />}
            active
          />
        </Breadcrumbs>
        <h1 ref={headingRef}>Devices</h1>
        <Paragraph>
          Enrolled personal devices, family devices, servers, and approved
          infrastructure endpoints connected to GoreeCloud Network.
        </Paragraph>
      </div>
      <Suspense fallback={<SkeletonTable />}>
        <PeersTable
          isLoading={isLoading}
          peers={peersWithUser}
          headingTarget={portalTarget}
          kind={kind}
          onKindChange={onKindChange}
        />
      </Suspense>
    </>
  );
}

function PeersBlockedView() {
  return (
    <div className={"flex items-center justify-center flex-col"}>
      <div className={"p-default py-6 max-w-3xl text-center"}>
        <h1>Enroll a device in GoreeCloud Network</h1>
        <Paragraph>
          Use an approved GoreeCloud Network client or enrollment method for
          this account. Device enrollment remains subject to GoreeCloud access
          policy and administrative approval.
        </Paragraph>
      </div>
      <div className={"px-3 pt-1 pb-8 max-w-3xl w-full"}>
        <div
          className={
            "rounded-xl border border-gray-200/80 dark:border-zinc-700/60 grid w-full bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm"
          }
        >
          <SetupModalContent header={false} footer={false} isUserDevice />
        </div>
      </div>
    </div>
  );
}
