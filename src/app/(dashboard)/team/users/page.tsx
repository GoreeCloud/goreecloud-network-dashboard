"use client";

import Breadcrumbs from "@components/Breadcrumbs";
import Paragraph from "@components/Paragraph";
import SkeletonTable from "@components/skeletons/SkeletonTable";
import { RestrictedAccess } from "@components/ui/RestrictedAccess";
import { usePortalElement } from "@hooks/usePortalElement";
import useFetchApi from "@utils/api";
import { User2 } from "lucide-react";
import React, { lazy, Suspense } from "react";
import TeamIcon from "@/assets/icons/TeamIcon";
import { useGroups } from "@/contexts/GroupsProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { User } from "@/interfaces/User";
import PageContainer from "@/layouts/PageContainer";
import { IdentityProviderCard } from "@/modules/integrations/idp-sync/IdentityProviderCard";

const UsersTable = lazy(() => import("@/modules/users/UsersTable"));

export default function TeamUsers() {
  const { isLoading: isGroupsLoading } = useGroups();
  const { permission } = usePermissions();
  const { data: users, isLoading } = useFetchApi<User[]>(
    "/users?service_user=false",
  );

  const { ref: headingRef, portalTarget } =
    usePortalElement<HTMLHeadingElement>();

  return (
    <PageContainer>
      <div className={"p-default py-6"}>
        <Breadcrumbs>
          <Breadcrumbs.Item
            href={"/team"}
            label={"People & Identities"}
            icon={<TeamIcon size={13} />}
          />
          <Breadcrumbs.Item
            href={"/team/users"}
            label={"People"}
            active
            icon={<User2 size={16} />}
          />
        </Breadcrumbs>
        <h1 ref={headingRef}>People</h1>
        <Paragraph>
          Review individual identities and their network membership. GoreeCloud
          Network controls private-network access; authentication and MFA remain
          responsibilities of the configured identity provider.
        </Paragraph>
      </div>
      <RestrictedAccess page={"People"} hasAccess={permission.users.read}>
        <Suspense fallback={<SkeletonTable />}>
          {permission.settings.read && permission?.idp?.read && (
            <div className={"flex flex-wrap gap-4 p-default pb-6"}>
              <IdentityProviderCard />
            </div>
          )}
          <UsersTable
            users={users}
            isLoading={isLoading || isGroupsLoading}
            headingTarget={portalTarget}
          />
        </Suspense>
      </RestrictedAccess>
    </PageContainer>
  );
}
