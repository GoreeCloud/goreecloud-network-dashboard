"use client";

import Breadcrumbs from "@components/Breadcrumbs";
import Paragraph from "@components/Paragraph";
import { RestrictedAccess } from "@components/ui/RestrictedAccess";
import { usePortalElement } from "@hooks/usePortalElement";
import useFetchApi from "@utils/api";
import { LogsIcon } from "lucide-react";
import React from "react";
import ActivityIcon from "@/assets/icons/ActivityIcon";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { ActivityEvent } from "@/interfaces/ActivityEvent";
import PageContainer from "@/layouts/PageContainer";
import ActivityTable from "@/modules/activity/ActivityTable";
import { EventStreamingCard } from "@/modules/integrations/event-streaming/EventStreamingCard";

export default function Activity() {
  const { permission } = usePermissions();

  const { data: events, isLoading } =
    useFetchApi<ActivityEvent[]>("/events/audit");

  const { ref: headingRef, portalTarget } =
    usePortalElement<HTMLHeadingElement>();

  return (
    <PageContainer>
      <div className={"p-default py-6"}>
        <Breadcrumbs>
          <Breadcrumbs.Item
            label={"Activity"}
            disabled={true}
            icon={<ActivityIcon size={13} />}
          />
          <Breadcrumbs.Item
            href={"/events/audit"}
            label={"Audit Events"}
            icon={<LogsIcon size={18} />}
          />
        </Breadcrumbs>
        <h1 ref={headingRef}>Audit Events</h1>
        <Paragraph>
          Review administrative changes, access-policy updates, device
          enrollment, authentication-related events, and other network-control
          activity available from the management service.
        </Paragraph>
      </div>
      <RestrictedAccess page={"Activity"} hasAccess={permission.events.read}>
        <EventStreamingCard />
        <ActivityTable
          events={events}
          isLoading={isLoading}
          headingTarget={portalTarget}
        />
      </RestrictedAccess>
    </PageContainer>
  );
}
