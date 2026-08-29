import { Callout } from "@components/Callout";
import FancyToggleSwitch from "@components/FancyToggleSwitch";
import FullTooltip from "@components/FullTooltip";
import { getOperatingSystem } from "@hooks/useOperatingSystem";
import useFetchApi from "@utils/api";
import { cn } from "@utils/helpers";
import { AlertCircleIcon, VenetianMask } from "lucide-react";
import * as React from "react";
import { useGroups } from "@/contexts/GroupsProvider";
import { GroupPeer } from "@/interfaces/Group";
import { OperatingSystem } from "@/interfaces/OperatingSystem";
import { Peer } from "@/interfaces/Peer";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  routingPeerGroupId?: string;
  "data-testid"?: string;
};

export const RoutingPeerMasqueradeSwitch = ({
  disabled = false,
  value,
  onChange,
  routingPeerGroupId,
  "data-testid": dataTestId,
}: Props) => {
  return (
    <RoutingPeerMasqueradeTooltip show={disabled}>
      <div className={"flex flex-col gap-4"}>
        <FancyToggleSwitch
          value={value}
          onChange={onChange}
          disabled={disabled}
          data-testid={dataTestId}
          label={
            <>
              <VenetianMask size={15} />
              Source Address Masquerade
            </>
          }
          helpText={
            "Translate traffic behind the routing peer so the destination network does not need a return route to GoreeCloud Network addresses. Disable only when the destination network has explicit return routing and preserving original source addresses is required."
          }
        />
        {routingPeerGroupId && !value && (
          <RoutingPeerGroupNonLinuxWarning
            routingPeerGroupId={routingPeerGroupId}
          />
        )}
      </div>
    </RoutingPeerMasqueradeTooltip>
  );
};

type RoutingPeerMasqueradeTooltipProps = {
  show?: boolean;
  children: React.ReactNode;
};

export const RoutingPeerMasqueradeTooltip = ({
  show = false,
  children,
}: RoutingPeerMasqueradeTooltipProps) => {
  return (
    <FullTooltip
      content={
        <div className={"text-xs"}>
          Source-address masquerade is required for non-Linux routing peers.
        </div>
      }
      delayDuration={250}
      skipDelayDuration={350}
      disabled={!show}
      className={cn(show && "cursor-help")}
    >
      {children}
    </FullTooltip>
  );
};

const RoutingPeerGroupNonLinuxWarning = ({
  routingPeerGroupId,
}: {
  routingPeerGroupId: string;
}) => {
  const { groups } = useGroups();
  const { data: peers } = useFetchApi<Peer[]>("/peers", true);
  const group = groups?.find((g) => g.id === routingPeerGroupId);

  const hasNonLinuxPeer = React.useMemo(() => {
    try {
      return group?.peers?.some((groupPeer) => {
        const peer = peers?.find((p) => p.id === (groupPeer as GroupPeer).id);
        if (!peer) return false;
        const os = getOperatingSystem(peer.os);
        return os !== OperatingSystem.LINUX;
      });
    } catch (e) {
      return false;
    }
  }, [group?.peers, peers]);

  return (
    hasNonLinuxPeer && (
      <Callout
        variant={"warning"}
        icon={
          <AlertCircleIcon
            size={14}
            className={"shrink-0 relative top-[3px] text-netbird"}
          />
        }
      >
        Group <span className={"text-netbird font-normal"}>{group?.name}</span>{" "}
        contains at least one non-Linux routing peer.
        <br /> GoreeCloud Network requires source-address masquerade for those
        devices, so a disabled setting cannot take effect on them.
      </Callout>
    )
  );
};
