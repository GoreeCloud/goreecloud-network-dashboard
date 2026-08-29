"use client";

import Button from "@components/Button";
import FancyToggleSwitch from "@components/FancyToggleSwitch";
import HelpText from "@components/HelpText";
import { Input } from "@components/Input";
import { Label } from "@components/Label";
import { Modal, ModalClose, ModalContent, ModalFooter } from "@components/modal/Modal";
import ModalHeader from "@components/modal/ModalHeader";
import { notify } from "@components/Notification";
import { PeerGroupSelector } from "@components/PeerGroupSelector";
import { PeerSelector } from "@components/PeerSelector";
import { SegmentedTabs } from "@components/SegmentedTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/Tabs";
import { getOperatingSystem } from "@hooks/useOperatingSystem";
import useFetchApi, { useApiCall } from "@utils/api";
import { cn } from "@utils/helpers";
import { uniqBy } from "lodash";
import { ArrowDownWideNarrow, KeyRound, FolderGit2, Loader2, MonitorSmartphoneIcon, PlusCircle, Power, Settings2, Share2Icon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { useDialog } from "@/contexts/DialogProvider";
import { Network, NetworkRouter } from "@/interfaces/Network";
import { OperatingSystem } from "@/interfaces/OperatingSystem";
import { Peer } from "@/interfaces/Peer";
import { SetupKey } from "@/interfaces/SetupKey";
import useGroupHelper from "@/modules/groups/useGroupHelper";
import { RoutingPeerMasqueradeSwitch } from "@/modules/networks/routing-peers/RoutingPeerMasqueradeSwitch";
import SetupModal from "@/modules/setup-netbird-modal/SetupModal";

type Props = { network: Network; open?: boolean; setOpen?: (open: boolean) => void; onCreated?: (r: NetworkRouter) => void; onUpdated?: (r: NetworkRouter) => void; router?: NetworkRouter; };

export default function NetworkRoutingPeerModal({ network, open, setOpen, onCreated, onUpdated, router }: Props) {
  return <Modal open={open} onOpenChange={setOpen}><RoutingPeerModalContent network={network} router={router} onCreated={onCreated} onUpdated={onUpdated} key={open ? "1" : "0"} /></Modal>;
}

type ContentProps = { network: Network; router?: NetworkRouter; onCreated?: (r: NetworkRouter) => void; onUpdated?: (r: NetworkRouter) => void; };

function RoutingPeerModalContent({ network, router, onCreated, onUpdated }: ContentProps) {
  const isRoutingPeer = router ? router.peer != "" : true;
  const [tab, setTab] = useState("router");
  const [type, setType] = useState(isRoutingPeer ? "peer" : "group");
  const create = useApiCall<NetworkRouter>(`/networks/${network.id}/routers`).post;
  const update = useApiCall<NetworkRouter>(`/networks/${network.id}/routers/${router?.id}`).put;
  const { data: peer } = useFetchApi<Peer>("/peers/" + router?.peer, true, false, router ? router.peer != "" : false);
  const [routingPeer, setRoutingPeer] = useState<Peer | undefined>(peer);
  const [routingPeerGroups, setRoutingPeerGroups, { getGroupsToUpdate: getAllRoutingGroupsToUpdate }] = useGroupHelper({ initial: router?.peer_groups || [] });
  const [masquerade, setMasquerade] = useState<boolean>(router ? router.masquerade : true);
  const [enabled, setEnabled] = useState<boolean>(router ? router.enabled : true);
  const [metric, setMetric] = useState(router?.metric ? router.metric.toString() : "9999");
  const isNonLinuxRoutingPeer = useMemo(() => routingPeer ? getOperatingSystem(routingPeer.os) != OperatingSystem.LINUX : false, [routingPeer]);

  useEffect(() => { if (isNonLinuxRoutingPeer) setMasquerade(true); }, [isNonLinuxRoutingPeer]);

  const getPayload = async () => {
    const pendingGroups = getAllRoutingGroupsToUpdate();
    const groupCalls = uniqBy([...pendingGroups], "name").map((g) => g.promise);
    const createdGroups = await Promise.all(groupCalls.map((call) => call()));
    const selectedPeer = type === "peer";
    return {
      peer: selectedPeer ? routingPeer?.id : undefined,
      peer_groups: !selectedPeer ? createdGroups.map((g) => g.id) : undefined,
      metric: parseInt(metric),
      enabled,
      masquerade: selectedPeer && isNonLinuxRoutingPeer ? true : masquerade,
    };
  };

  const addRouter = async () => {
    const payload = await getPayload();
    const promise = create(payload).then((r) => onCreated?.(r));
    notify({ title: "Routing Peer Added", description: "The routing peer is now configured for this private network.", loadingMessage: "Adding routing peer...", promise });
    return promise;
  };

  const updateRouter = async () => {
    const payload = await getPayload();
    const promise = update(payload).then((r) => onUpdated?.(r));
    notify({ title: "Routing Peer Updated", description: "The routing-peer configuration has been updated.", loadingMessage: "Updating routing peer...", promise });
    return promise;
  };

  const canContinue = routingPeer !== undefined || routingPeerGroups.length > 0;

  return <ModalContent maxWidthClass={"max-w-xl"}>
    <ModalHeader icon={<Share2Icon size={16} />} title={router ? "Update Routing Peer" : "Add Routing Peer"} description={`Provide a controlled forwarding path to '${network.name}'`} color={"netbird"} />
    <Tabs defaultValue={tab} onValueChange={setTab} value={tab}>
      <TabsList justify={"between"} className={"px-8 justify-between w-full"}>
        <TabsTrigger value={"router"}><Share2Icon size={16} className={"text-nb-gray-500 group-data-[state=active]/trigger:text-netbird transition-all"} />Routing Path</TabsTrigger>
        <TabsTrigger value={"settings"} className={"ml-auto"}><Settings2 size={16} className={"text-nb-gray-500 group-data-[state=active]/trigger:text-netbird transition-all"} />Routing Settings</TabsTrigger>
      </TabsList>
      <TabsContent value={"router"} className={"pb-6"}>
        <div className={"flex flex-col gap-4 px-8"}>
          <HelpText>Choose an approved GoreeCloud Network device or device group that can forward traffic to this private network. Routing capability does not grant users access by itself; Access Policies and destination-service controls still apply.</HelpText>
          <SegmentedTabs value={type} onChange={(state) => { setType(state); setRoutingPeer(undefined); setRoutingPeerGroups([]); }}>
            <SegmentedTabs.List>
              <SegmentedTabs.Trigger value={"peer"} data-testid="routing-peer-tab-peer"><MonitorSmartphoneIcon size={16} />Device</SegmentedTabs.Trigger>
              <SegmentedTabs.Trigger value={"group"} data-testid="routing-peer-tab-group"><FolderGit2 size={16} />Device Group</SegmentedTabs.Trigger>
            </SegmentedTabs.List>
            <SegmentedTabs.Content value={"peer"}><div><HelpText>Select one enrolled device that has network reachability to the destination resources.</HelpText><PeerSelector onChange={setRoutingPeer} value={routingPeer} /></div></SegmentedTabs.Content>
            <SegmentedTabs.Content value={"group"}><div><HelpText>Select one device group when multiple eligible routing devices should provide the forwarding path.</HelpText><PeerGroupSelector max={1} onChange={setRoutingPeerGroups} values={routingPeerGroups} /></div></SegmentedTabs.Content>
          </SegmentedTabs>
          <div className={cn("flex justify-between items-center mt-3")}>
            <div><Label>Need to enroll a routing device?</Label><HelpText>Generate a one-off setup key only for an approved device that will act as a routing peer. Treat the key as a sensitive enrollment credential.</HelpText></div>
            <EnrollRoutingDeviceButton name={`Routing Peer (${network.name})`} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value={"settings"} className={"pb-4"}>
        <div className={"px-8 flex flex-col gap-6"}>
          <FancyToggleSwitch value={enabled} onChange={setEnabled} label={<><Power size={15} />Enable Routing Peer</>} helpText={"Enable forwarding only when this device or group is ready to route traffic for the selected private network."} />
          <RoutingPeerMasqueradeSwitch value={masquerade} onChange={setMasquerade} disabled={isNonLinuxRoutingPeer} routingPeerGroupId={routingPeerGroups?.[0]?.id} data-testid="toggle-masquerade" />
          <div className={cn("flex justify-between")}><div><Label>Route Priority</Label><HelpText className={"max-w-[220px]"}>Lower metric values are preferred. Use metrics deliberately when multiple routing peers can reach the same destination.</HelpText></div><Input min={1} max={9999} maxWidthClass={"max-w-[200px]"} value={metric} data-testid={"metric"} errorTooltip={true} type={"number"} onChange={(e) => setMetric(e.target.value)} customPrefix={<ArrowDownWideNarrow size={16} className={"text-nb-gray-300"} />} /></div>
        </div>
      </TabsContent>
    </Tabs>
    <ModalFooter className={"items-center"}><div className={"flex gap-3 w-full justify-end"}>
      {tab === "router" && <><ModalClose asChild><Button variant={"secondary"}>Cancel</Button></ModalClose><Button variant={"primary"} onClick={() => setTab("settings")} disabled={!canContinue} data-testid="routing-peer-continue">Review Routing Settings</Button></>}
      {tab === "settings" && <><Button variant={"secondary"} onClick={() => setTab("router")}>Back</Button><Button variant={"primary"} disabled={!canContinue} onClick={router ? updateRouter : addRouter} data-testid="submit-routing-peer">{router ? "Save Changes" : <><PlusCircle size={16} />Add Routing Peer</>}</Button></>}
    </div></ModalFooter>
  </ModalContent>;
}

type EnrollRoutingDeviceButtonProps = { name?: string; };

const EnrollRoutingDeviceButton = ({ name }: EnrollRoutingDeviceButtonProps) => {
  const setupKeyRequest = useApiCall<SetupKey>("/setup-keys", true);
  const { mutate } = useSWRConfig();
  const { confirm } = useDialog();
  const [installModal, setInstallModal] = useState(false);
  const [setupKey, setSetupKey] = useState<SetupKey>();
  const [isLoading, setIsLoading] = useState(false);

  const createSetupKey = async () => {
    const choice = await confirm({
      title: "Create One-Off Enrollment Key?",
      description: "This creates a single-use setup key that expires after 24 hours. Use it only on the approved routing device, do not share it, and revoke it immediately if it is exposed or no longer needed.",
      confirmText: "Create Key",
      cancelText: "Cancel",
      type: "warning",
    });
    if (!choice) return;
    const loadingTimeout = setTimeout(() => setIsLoading(true), 1000);
    await setupKeyRequest.post({ name, type: "one-off", expires_in: 24 * 60 * 60, revoked: false, auto_groups: [], usage_limit: 1, ephemeral: false, allow_extra_dns_labels: false }).then((newSetupKey) => {
      setInstallModal(true);
      setSetupKey(newSetupKey);
      mutate("/setup-keys");
    }).finally(() => { setIsLoading(false); clearTimeout(loadingTimeout); });
  };

  return <><Button variant={"secondary"} size={"xs"} className={"ml-8"} onClick={createSetupKey} disabled={isLoading}>{isLoading ? <Loader2 size={14} className={"animate-spin delay-1000"} /> : <KeyRound size={14} />}Enroll Routing Device</Button>{setupKey && <Modal open={installModal} onOpenChange={setInstallModal} key={setupKey.key}><SetupModal showClose={true} setupKey={setupKey.key} showOnlyRoutingPeerOS={true} /></Modal>}</>;
};
