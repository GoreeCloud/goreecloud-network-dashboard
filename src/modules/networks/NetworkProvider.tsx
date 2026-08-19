import { Modal } from "@components/modal/Modal";
import { notify } from "@components/Notification";
import { useApiCall } from "@utils/api";
import * as React from "react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useDialog } from "@/contexts/DialogProvider";
import { useNetworkAccessControl } from "@/modules/networks/NetworkAccessControlProvider";
import { Group } from "@/interfaces/Group";
import { Network, NetworkResource, NetworkRouter } from "@/interfaces/Network";
import { AccessControlModalContent } from "@/modules/access-control/AccessControlModal";
import NetworkModal from "@/modules/networks/NetworkModal";
import NetworkResourceModal from "@/modules/networks/resources/NetworkResourceModal";
import { ResourceGroupModal } from "@/modules/networks/resources/ResourceGroupModal";
import NetworkRoutingPeerModal from "@/modules/networks/routing-peers/NetworkRoutingPeerModal";
import { Policy, PolicyRuleResource } from "@/interfaces/Policy";
import PoliciesProvider from "@/contexts/PoliciesProvider";
import { ResourceIcon } from "@/assets/icons/ResourceIcon";
import CopyToClipboardText from "@components/CopyToClipboardText";
import { cn } from "@utils/helpers";

type Props = {
  children: React.ReactNode;
  network?: Network;
  onResourceUpdate?: () => void;
  onResourceDelete?: () => void;
};

const NetworksContext = React.createContext(
  {} as {
    openAddRoutingPeerModal: (network: Network, router?: NetworkRouter) => void;
    openEditNetworkModal: (network: Network) => void;
    openCreateNetworkModal: () => void;
    openResourceModal: (network: Network, resource?: NetworkResource, initialTab?: string) => void;
    openResourceGroupModal: (network: Network, resource?: NetworkResource) => void;
    openPolicyModal: (network?: Network, resource?: NetworkResource) => void;
    openEditPolicyModal: (policy: Policy) => void;
    deleteNetwork: (network: Network) => Promise<void>;
    deleteResource: (network: Network, resource: NetworkResource) => void;
    deleteRouter: (network: Network, router: NetworkRouter) => void;
    network?: Network;
    assignedPolicies: (resource?: NetworkResource, groups?: Group[]) => {
      policies: Policy[];
      enabledPolicies: Policy[];
      isLoading: boolean;
      policyCount: number;
    };
    resourceExists: (name: string, excludeId?: string) => boolean;
    resources?: NetworkResource[];
    getPolicyDestinationResources: (policy: Policy) => NetworkResource[];
    confirmMultiResourceAction: (policy: Policy, action: "edit" | "delete", additionalResource?: NetworkResource) => Promise<boolean>;
    policies?: Policy[];
  },
);

export const NetworkProvider = ({ children, network, onResourceDelete, onResourceUpdate }: Props) => {
  const { mutate } = useSWRConfig();
  const { confirm } = useDialog();
  const deleteCall = useApiCall("/networks").del;
  const { policies, resources, assignedPolicies, resourceExists, getPolicyDestinationResources } = useNetworkAccessControl();

  const [currentNetwork, setCurrentNetwork] = useState<Network>();
  const [currentResource, setCurrentResource] = useState<NetworkResource>();
  const [currentRouter, setCurrentRouter] = useState<NetworkRouter>();
  const [policyDefaultSettings, setPolicyDefaultSettings] = useState<{
    name?: string;
    description?: string;
    destinationGroups?: Group[] | string[];
    destinationResource?: PolicyRuleResource;
  }>();
  const [currentPolicy, setCurrentPolicy] = useState<Policy>();
  const [routingPeerModal, setRoutingPeerModal] = useState(false);
  const [networkModal, setNetworkModal] = useState(false);
  const [resourceModal, setResourceModal] = useState(false);
  const [resourceGroupModal, setResourceGroupModal] = useState(false);
  const [policyModal, setPolicyModal] = useState(false);
  const [resourceModalInitialTab, setResourceModalInitialTab] = useState<string | undefined>();

  const openAddRoutingPeerModal = (targetNetwork: Network, router?: NetworkRouter) => {
    setCurrentNetwork(targetNetwork);
    router && setCurrentRouter(router);
    setRoutingPeerModal(true);
  };
  const openEditNetworkModal = (targetNetwork: Network) => {
    setCurrentNetwork(targetNetwork);
    setNetworkModal(true);
  };
  const openCreateNetworkModal = () => {
    setCurrentNetwork(undefined);
    setNetworkModal(true);
  };
  const openResourceModal = (targetNetwork: Network, resource?: NetworkResource, initialTab?: string) => {
    setCurrentNetwork(targetNetwork);
    resource && setCurrentResource(resource);
    setResourceModalInitialTab(initialTab);
    setResourceModal(true);
  };
  const openResourceGroupModal = (targetNetwork: Network, resource?: NetworkResource) => {
    setCurrentNetwork(targetNetwork);
    resource && setCurrentResource(resource);
    setResourceGroupModal(true);
  };

  const openPolicyModal = (targetNetwork?: Network, resource?: NetworkResource) => {
    const hasResourceGroups = (resource?.groups?.length || 0) > 0;
    setPolicyDefaultSettings({
      destinationGroups: hasResourceGroups ? resource?.groups : undefined,
      destinationResource: hasResourceGroups
        ? undefined
        : resource
          ? ({ id: resource.id, type: resource.type } as PolicyRuleResource)
          : undefined,
      name: targetNetwork && !resource ? `${targetNetwork.name} Policy` : resource ? `${resource.name} Policy` : "",
      description: targetNetwork && !resource
        ? targetNetwork.description
        : targetNetwork
          ? `${targetNetwork.name}${targetNetwork.description ? ", " + targetNetwork.description : ""}`
          : undefined,
    });
    setPolicyModal(true);
  };

  const openEditPolicyModal = (policy: Policy) => {
    setCurrentPolicy(policy);
    setPolicyModal(true);
  };

  const confirmMultiResourceAction = async (policy: Policy, action: "edit" | "delete", additionalResource?: NetworkResource) => {
    const fetchedResources = getPolicyDestinationResources(policy);
    const affectedResources = additionalResource && !fetchedResources.some((r) => r.id === additionalResource.id)
      ? [...fetchedResources, additionalResource]
      : fetchedResources;
    const isMulti = affectedResources.length > 1;
    if (!isMulti && action === "edit") return true;
    return confirm({
      title: isMulti ? <>This policy is used by multiple resources</> : <>{action === "edit" ? "Edit" : "Delete"} policy &apos;{policy.name}&apos;?</>,
      description: isMulti
        ? `This policy uses one or more resource groups as destinations. ${action === "edit" ? "Updating" : "Deleting"} it will also affect the following resources:`
        : action === "delete"
          ? "Deleting this policy removes its network-access rule. Review affected sources and destinations before continuing; this action cannot be undone."
          : undefined,
      children: isMulti ? <AffectedResourceList resources={affectedResources} /> : undefined,
      confirmText: action === "edit" ? "Edit Policy" : "Delete Policy",
      cancelText: "Cancel",
      hideIcon: isMulti,
      type: action === "edit" ? "warning" : "danger",
      maxWidthClass: isMulti ? "max-w-lg" : undefined,
    });
  };

  const deleteNetwork = async (targetNetwork: Network) => {
    const choice = await confirm({
      title: `Delete network '${targetNetwork.name}'?`,
      description: "This permanently removes the network definition, its resources, and its routing-peer assignments from GoreeCloud Network. Devices may immediately lose private reachability to those destinations. Application data on destination systems is not deleted, but this action cannot be undone from the dashboard.",
      confirmText: "Delete Network",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!choice) return;
    const promise = deleteCall({}, `/${targetNetwork.id}`).then(() => {
      mutate("/networks");
      mutate("/groups");
    });
    notify({ title: targetNetwork.name, description: "Network deleted.", loadingMessage: "Deleting network...", promise });
    return promise;
  };

  const deleteResource = async (targetNetwork: Network, resource: NetworkResource) => {
    const choice = await confirm({
      title: `Delete resource '${resource.name}'?`,
      description: "This removes the private destination from GoreeCloud Network and can immediately break access policies or workflows that depend on it. The destination service or host itself is not deleted. This action cannot be undone from the dashboard.",
      confirmText: "Delete Resource",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!choice) return;
    notify({
      title: resource.name,
      description: "Resource deleted.",
      loadingMessage: "Deleting resource...",
      promise: deleteCall({}, `/${targetNetwork.id}/resources/${resource.id}`).then(() => {
        onResourceDelete?.();
        mutate(`/networks/${targetNetwork.id}/resources`);
        mutate(`/networks/${targetNetwork.id}`);
        mutate("/groups");
      }),
    });
  };

  const deleteRouter = async (targetNetwork: Network, router: NetworkRouter) => {
    const choice = await confirm({
      title: "Remove routing peer?",
      description: "Removing this routing-peer assignment can make dependent private resources unreachable unless another enabled routing peer provides a valid path. The enrolled device itself is not deleted.",
      confirmText: "Remove Routing Peer",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!choice) return;
    notify({
      title: `Routing peer for ${targetNetwork.name}`,
      description: "Routing-peer assignment removed.",
      loadingMessage: "Removing routing peer...",
      promise: deleteCall({}, `/${targetNetwork.id}/routers/${router.id}`).then(() => {
        mutate(`/networks/${targetNetwork.id}/routers`);
      }),
    });
  };

  const askForRoutingPeer = async (targetNetwork: Network) => {
    const choice = await confirm({
      title: `Add routing peer to '${targetNetwork.name}'?`,
      description: "Resources in this network need at least one valid routing path before approved devices can reach them. Access Policies and destination-service authorization still apply independently.",
      confirmText: "Add Routing Peer",
      cancelText: "Later",
      type: "default",
    });
    if (choice) openAddRoutingPeerModal(targetNetwork);
  };

  const askForResource = async (targetNetwork: Network) => {
    const choice = await confirm({
      title: `Add resource to '${targetNetwork.name}'?`,
      description: "Add a private destination, then review Access Policies and routing before expecting approved devices to reach it.",
      confirmText: "Add Resource",
      cancelText: "Later",
      type: "default",
    });
    if (choice) openResourceModal(targetNetwork);
  };

  return (
    <NetworksContext.Provider value={{
      openAddRoutingPeerModal,
      openEditNetworkModal,
      openCreateNetworkModal,
      openResourceModal,
      openResourceGroupModal,
      openPolicyModal,
      openEditPolicyModal,
      deleteNetwork,
      deleteResource,
      deleteRouter,
      network,
      assignedPolicies,
      resourceExists,
      resources,
      getPolicyDestinationResources,
      confirmMultiResourceAction,
      policies,
    }}>
      <PoliciesProvider>
        {children}
        <NetworkModal
          open={networkModal}
          setOpen={setNetworkModal}
          network={currentNetwork}
          onCreated={async (createdNetwork) => {
            mutate("/networks");
            await askForResource(createdNetwork);
          }}
          onUpdated={(n) => {
            mutate("/networks");
            mutate(`/networks/${n.id}`);
          }}
        />
        <Modal
          open={policyModal}
          onOpenChange={(state) => {
            setPolicyModal(state);
            setPolicyDefaultSettings(undefined);
            setCurrentPolicy(undefined);
          }}
        >
          <AccessControlModalContent
            key={policyModal ? "1" : "0"}
            initialDestinationGroups={policyDefaultSettings?.destinationGroups}
            initialDestinationResource={policyDefaultSettings?.destinationResource}
            initialName={policyDefaultSettings?.name}
            initialDescription={policyDefaultSettings?.description}
            policy={currentPolicy}
            onSuccess={async () => {
              setPolicyModal(false);
              setPolicyDefaultSettings(undefined);
              setCurrentPolicy(undefined);
              mutate("/networks");
              if (network) {
                onResourceUpdate?.();
                mutate(`/networks/${network.id}/resources`);
                mutate(`/networks/${network.id}`);
              } else {
                currentNetwork && (await askForRoutingPeer(currentNetwork));
              }
            }}
          />
        </Modal>
        {currentNetwork && (
          <>
            <NetworkRoutingPeerModal
              network={currentNetwork}
              router={currentRouter}
              open={routingPeerModal}
              onCreated={async () => {
                setRoutingPeerModal(false);
                setCurrentRouter(undefined);
                mutate("/networks");
                mutate("/groups");
                if (network) {
                  mutate(`/networks/${currentNetwork.id}/routers`);
                  mutate(`/networks/${network.id}`);
                }
              }}
              onUpdated={async () => {
                setRoutingPeerModal(false);
                setCurrentRouter(undefined);
                mutate("/networks");
                mutate("/groups");
                if (network) {
                  mutate(`/networks/${network.id}`);
                  mutate(`/networks/${currentNetwork.id}/routers`);
                }
              }}
              setOpen={(state) => {
                setCurrentRouter(undefined);
                setRoutingPeerModal(state);
              }}
            />
            <ResourceGroupModal
              network={currentNetwork}
              resource={currentResource}
              open={resourceGroupModal}
              onOpenChange={(state) => {
                setCurrentResource(undefined);
                setResourceGroupModal(state);
              }}
              onUpdated={() => {
                setResourceGroupModal(false);
                setCurrentResource(undefined);
                mutate("/groups");
                mutate("/networks/resources");
                if (network) {
                  onResourceUpdate?.();
                  mutate(`/networks/${network.id}/resources`);
                  mutate(`/networks/${network.id}`);
                }
              }}
            />
            <NetworkResourceModal
              network={currentNetwork}
              resource={currentResource}
              initialTab={resourceModalInitialTab}
              onCreated={async () => {
                setResourceModal(false);
                setCurrentResource(undefined);
                mutate("/networks");
                mutate("/groups");
                mutate("/networks/resources");
                if (network) {
                  mutate(`/networks/${network.id}/resources`);
                  mutate(`/networks/${network.id}`);
                } else {
                  currentNetwork.routing_peers_count === 0 && (await askForRoutingPeer(currentNetwork));
                }
              }}
              onUpdated={() => {
                setResourceModal(false);
                setCurrentResource(undefined);
                mutate("/networks");
                mutate("/groups");
                mutate("/networks/resources");
                if (network) {
                  onResourceUpdate?.();
                  mutate(`/networks/${network.id}/resources`);
                  mutate(`/networks/${network.id}`);
                }
              }}
              open={resourceModal}
              setOpen={(state) => {
                setCurrentResource(undefined);
                setResourceModalInitialTab(undefined);
                setResourceModal(state);
              }}
            />
          </>
        )}
      </PoliciesProvider>
    </NetworksContext.Provider>
  );
};

export const useNetworksContext = () => React.useContext(NetworksContext);

const AffectedResourceList = ({ resources }: { resources: NetworkResource[] }) => (
  <div className={"flex flex-col gap-2 max-h-64 overflow-auto mt-3"}>
    {resources.map((resource) => (
      <div key={resource.id} className={cn("flex items-center gap-3 rounded-md border border-nb-gray-800 px-3 py-2")}>
        <ResourceIcon resource={resource} />
        <div className={"flex flex-col min-w-0"}>
          <span className={"text-sm font-medium text-nb-gray-200 truncate"}>{resource.name}</span>
          <CopyToClipboardText value={resource.address} className={"text-xs text-nb-gray-400"} />
        </div>
      </div>
    ))}
  </div>
);
