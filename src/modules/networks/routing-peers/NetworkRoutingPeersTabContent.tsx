import SkeletonTable, {
  SkeletonTableHeader,
} from "@components/skeletons/SkeletonTable";
import * as React from "react";
import { Suspense, useMemo } from "react";
import { NetworkRouter } from "@/interfaces/Network";
import NetworkRoutingPeersTable from "@/modules/networks/routing-peers/NetworkRoutingPeersTable";
import useFetchApi from "@utils/api";
import { useGroups } from "@/contexts/GroupsProvider";
import { Peer } from "@/interfaces/Peer";
import { useUsers } from "@/contexts/UsersProvider";
import Paragraph from "@components/Paragraph";
import { Callout } from "@components/Callout";

export const NetworkRoutingPeersTabContent = ({
  routers,
  isLoading,
}: {
  routers?: NetworkRouter[];
  isLoading: boolean;
}) => {
  const { groups } = useGroups();
  const { users } = useUsers();
  const { data: peers } = useFetchApi<Peer[]>(`/peers`);

  const data = useMemo(() => {
    return routers?.map((router) => {
      const peer = peers?.find((peer) => peer.id === router.peer);
      const user = peer
        ? users?.find((user) => user.id === peer.user_id)
        : undefined;
      const group = groups?.find(
        (group) => group.id === router?.peer_groups?.[0],
      );

      return {
        ...router,
        search: `${peer?.name ?? ""} ${peer?.ip ?? ""} ${peer?.ipv6 ?? ""} ${user?.name ?? ""} ${user?.id ?? ""} ${group?.name ?? ""}`,
      };
    });
  }, [users, peers, routers, groups]);

  return (
    <div className={"px-8"} id={"routing-peers"}>
      <div className={"flex flex-col gap-3 mb-5"}>
        <Paragraph>
          Routing peers provide a controlled path from GoreeCloud Network to
          approved private networks and resources that do not run a native
          client. Assign only devices that are intentionally permitted to
          forward traffic for this network.
        </Paragraph>
        <Callout variant={"info"}>
          A routing peer extends network reachability; it does not grant
          application access. Access Policies, host firewalls, service
          authentication, and workload separation remain independent controls.
        </Callout>
      </div>
      <Suspense
        fallback={
          <div>
            <SkeletonTableHeader className={"!p-0"} />
            <div className={"mt-8 w-full"}>
              <SkeletonTable withHeader={false} />
            </div>
          </div>
        }
      >
        <NetworkRoutingPeersTable isLoading={isLoading} routers={data} />
      </Suspense>
    </div>
  );
};
