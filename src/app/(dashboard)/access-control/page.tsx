"use client";

import Breadcrumbs from "@components/Breadcrumbs";
import Paragraph from "@components/Paragraph";
import SkeletonTable from "@components/skeletons/SkeletonTable";
import { RestrictedAccess } from "@components/ui/RestrictedAccess";
import { usePortalElement } from "@hooks/usePortalElement";
import useFetchApi from "@utils/api";
import React, { lazy, Suspense } from "react";
import AccessControlIcon from "@/assets/icons/AccessControlIcon";
import GroupsProvider from "@/contexts/GroupsProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import PoliciesProvider from "@/contexts/PoliciesProvider";
import { Policy } from "@/interfaces/Policy";
import PageContainer from "@/layouts/PageContainer";

const AccessControlTable = lazy(
  () => import("@/modules/access-control/table/AccessControlTable"),
);

export default function AccessControlPage() {
  const { permission } = usePermissions();
  const { data: policies, isLoading } = useFetchApi<Policy[]>("/policies");
  const { ref: headingRef, portalTarget } =
    usePortalElement<HTMLHeadingElement>();

  return (
    <PageContainer>
      <GroupsProvider>
        <div className={"p-default py-6"}>
          <Breadcrumbs>
            <Breadcrumbs.Item
              href={"/access-control"}
              label={"Access Policies"}
              icon={<AccessControlIcon size={14} />}
            />
          </Breadcrumbs>
          <h1 ref={headingRef}>Access Policies</h1>
          <Paragraph>
            Define explicit least-privilege access between approved identities,
            device groups, and private network resources. GoreeCloud Network
            remains deny-by-default unless access is intentionally granted.
          </Paragraph>
        </div>

        <RestrictedAccess
          page={"Access Policies"}
          hasAccess={permission.policies.read}
        >
          <PoliciesProvider>
            <Suspense fallback={<SkeletonTable />}>
              <AccessControlTable
                isLoading={isLoading}
                policies={policies}
                headingTarget={portalTarget}
              />
            </Suspense>
          </PoliciesProvider>
        </RestrictedAccess>
      </GroupsProvider>
    </PageContainer>
  );
}
