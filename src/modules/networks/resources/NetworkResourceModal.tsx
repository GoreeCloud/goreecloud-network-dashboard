"use client";

import Button from "@components/Button";
import { Callout } from "@components/Callout";
import HelpText from "@components/HelpText";
import { InlineButtonLink } from "@components/InlineLink";
import { Input } from "@components/Input";
import { Label } from "@components/Label";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalFooter,
} from "@components/modal/Modal";
import ModalHeader from "@components/modal/ModalHeader";
import { notify } from "@components/Notification";
import { HelpTooltip } from "@components/HelpTooltip";
import { PeerGroupSelector } from "@components/PeerGroupSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/Tabs";
import { useApiCall } from "@utils/api";
import { normalizeHostCIDR } from "@utils/ip";
import { useDialog } from "@/contexts/DialogProvider";
import { usePolicies } from "@/contexts/PoliciesProvider";
import { useNetworksContext } from "@/modules/networks/NetworkProvider";
import { PlusCircle, ShieldCheck, WorkflowIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/Accordion";
import React, { useMemo, useRef, useState } from "react";
import { Group } from "@/interfaces/Group";
import { Network, NetworkResource } from "@/interfaces/Network";
import { Policy } from "@/interfaces/Policy";
import useGroupHelper from "@/modules/groups/useGroupHelper";
import NetworkResourceAccessControl from "@/modules/networks/resources/NetworkResourceAccessControl";
import { ResourceSingleAddressInput } from "@/modules/networks/resources/ResourceSingleAddressInput";

type Props = {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  network: Network;
  resource?: NetworkResource;
  onCreated?: (r: NetworkResource) => void;
  onUpdated?: (r: NetworkResource) => void;
  initialTab?: string;
};

export default function NetworkResourceModal({ network, open, setOpen, resource, onUpdated, onCreated, initialTab }: Props) {
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ResourceModalContent key={open ? "1" : "0"} network={network} resource={resource} onCreated={onCreated} onUpdated={onUpdated} initialTab={initialTab} />
    </Modal>
  );
}

type ModalProps = {
  onCreated?: (r: NetworkResource) => void;
  onUpdated?: (r: NetworkResource) => void;
  network: Network;
  resource?: NetworkResource;
  initialTab?: string;
};

export function ResourceModalContent({ onCreated, onUpdated, network, resource, initialTab }: ModalProps) {
  const create = useApiCall<NetworkResource>(`/networks/${network.id}/resources`).post;
  const update = useApiCall<NetworkResource>(`/networks/${network.id}/resources/${resource?.id}`).put;
  const [name, setName] = useState(resource?.name || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [address, setAddress] = useState(resource?.address || "");
  const [groups, setGroups, { save: saveGroups }] = useGroupHelper({ initial: resource?.groups || [] });
  const [enabled, setEnabled] = useState<boolean>(resource ? resource.enabled : true);
  const nameRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(initialTab || "resource");
  const [addressError, setAddressError] = useState("");
  const { confirm } = useDialog();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { createPoliciesForResource } = usePolicies();
  const { assignedPolicies, resourceExists, policies: allPolicies } = useNetworksContext();
  const { policies: existingPolicies } = useMemo(() => assignedPolicies(resource, groups), [assignedPolicies, resource, groups]);
  const allResourcePolicies = useMemo(() => [...(existingPolicies || []), ...policies], [existingPolicies, policies]);
  const groupPolicyCount = useMemo(() => {
    if (!groups.length || !allPolicies) return 0;
    const groupIds = new Set(groups.map((g) => g.id));
    return allPolicies.filter((policy) => {
      const rule = policy.rules?.[0];
      if (!rule || rule.destinationResource) return false;
      const destinations = rule.destinations as (Group | string)[] | undefined;
      return destinations?.some((d) => {
        const id = typeof d === "string" ? d : d.id;
        return !!id && groupIds.has(id);
      });
    }).length;
  }, [groups, allPolicies]);
  const isAddressValid = address.length > 0 && addressError === "";
  const nameError = useMemo(() => {
    if (name === "") return "";
    if (resourceExists(name, resource?.id)) return "A resource with this name already exists. Please use another name.";
    return "";
  }, [name, resourceExists, resource?.id]);

  const confirmMissingPolicies = async () => {
    if (allResourcePolicies.length > 0) return true;
    return confirm({
      title: "No Access Policies Configured",
      description: "This resource will remain unreachable through GoreeCloud Network until an explicit access policy allows approved source groups. You can create policies later. Continue without network access?",
      type: "warning",
      confirmText: resource ? "Save Changes" : "Add Resource",
      cancelText: "Cancel",
      maxWidthClass: "max-w-lg",
    });
  };

  const createResource = async () => {
    if (!(await confirmMissingPolicies())) return;
    const savedGroups = await saveGroups();
    const promise = create({ name, description, address: normalizeHostCIDR(address), groups: savedGroups ? savedGroups.map((g) => g.id) : undefined, enabled }).then(async (r) => {
      await createPoliciesForResource(policies, r, savedGroups);
      onCreated?.(r);
    });
    notify({ title: "Resource Created", description: `The resource "${name}" has been created successfully.`, loadingMessage: "Creating resource...", promise });
    return promise;
  };

  const updateResource = async () => {
    if (!(await confirmMissingPolicies())) return;
    const savedGroups = await saveGroups();
    const promise = update({ name, description, address: normalizeHostCIDR(address), groups: savedGroups ? savedGroups.map((g) => g.id) : undefined, enabled }).then(async (r) => {
      await createPoliciesForResource(policies, r, savedGroups);
      onUpdated?.(r);
    });
    notify({ title: "Resource Updated", description: `Resource "${name}" has been updated successfully.`, loadingMessage: "Updating resource...", promise });
  };

  const canCreate = useMemo(() => name.length > 0 && isAddressValid && nameError === "", [name, isAddressValid, nameError]);

  return (
    <ModalContent maxWidthClass={tab === "access-control" ? "max-w-[790px]" : "max-w-[680px]"}>
      <ModalHeader icon={<WorkflowIcon size={20} />} title={resource ? "Edit Resource" : "Add Resource"} description={resource ? `${resource.name}` : `Add a private resource to "${network?.name}"`} color={"yellow"} />
      <Tabs defaultValue={tab} onValueChange={(v) => setTab(v)} value={tab}>
        <TabsList justify={"start"} className={"px-8"}>
          <TabsTrigger value={"resource"}><WorkflowIcon size={16} />Resource</TabsTrigger>
          <TabsTrigger value={"access-control"} disabled={!resource && !canCreate}><ShieldCheck size={16} />Access Policies</TabsTrigger>
        </TabsList>
        <TabsContent value={"resource"} className={"pb-4"}>
          <div className={"px-8 flex-col flex gap-6"}>
            <Callout variant={"info"}>
              A resource defines a private destination that routing peers can reach. Creating it does not grant application access or bypass authentication, host firewalls, or other service protections.
            </Callout>
            <div><Label>Name</Label><HelpText>Use a clear name that identifies the private service, host, or subnet.</HelpText><Input ref={nameRef} autoFocus={true} tabIndex={0} data-testid="resource-name-input" placeholder={"e.g., Family Services Database"} value={name} error={nameError} onChange={(e) => setName(e.target.value)} /></div>
            <ResourceSingleAddressInput value={address} onChange={setAddress} onError={setAddressError} description={<>Enter a single <HelpTooltip content={"A single private host address, for example 10.0.0.1 or 192.168.1.5."}>IP Address</HelpTooltip>, <HelpTooltip content={"A private subnet in CIDR notation, for example 10.0.0.0/24."}>CIDR Block</HelpTooltip> or <HelpTooltip content={"A DNS name distributed for private-network resource matching, for example service.internal or *.example.internal."}>Domain Name</HelpTooltip>.</>} />
            <Accordion type={"multiple"} className={"flex flex-col gap-2 -mt-2"}>
              <AccordionItem value={"resource-groups"}>
                <AccordionTrigger className={"text-[0.8rem] tracking-wider text-nb-gray-200 py-4 my-0 leading-none gap-2 flex items-center"} data-testid="resource-optional-settings"><span className={"relative top-[1px]"}>Organization & Description</span></AccordionTrigger>
                <AccordionContent><div className={"flex flex-col gap-6 pb-4 pt-2"}>
                  <div><Label>Description</Label><HelpText>Record the resource purpose or administrative context.</HelpText><Input placeholder={"e.g., Family Services production database"} value={description} onChange={(e) => setDescription(e.target.value)} data-testid="resource-description-input" /></div>
                  <div><Label>Resource Groups</Label><HelpText className={"mt-1"}>Group related resources for policy administration. Group membership can affect existing access policies, so review inherited access before saving.</HelpText><PeerGroupSelector side={"top"} onChange={setGroups} values={groups} showPeerCounter={false} placeholder={"Add or select resource group(s)..."} policies={allPolicies} />
                    {groupPolicyCount > 0 && <Callout variant={"info"} className={"mt-3"}>The selected resource groups are referenced by <span className="text-white font-medium">{groupPolicyCount} Access {groupPolicyCount === 1 ? "Policy" : "Policies"}</span>. This resource may inherit network access from {groupPolicyCount === 1 ? "that policy" : "those policies"}. {isAddressValid || resource ? <>Review the effective access in the <InlineButtonLink onClick={() => setTab("access-control")} variant={"dashed"}>Access Policies</InlineButtonLink> tab before saving.</> : "Review effective access before saving."}</Callout>}
                  </div>
                </div></AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
        <TabsContent value={"access-control"} className={"pb-8"}><NetworkResourceAccessControl existingPolicies={existingPolicies || []} newPolicies={policies} onNewPoliciesChange={setPolicies} address={address} resourceName={name} resourceId={resource?.id} hasResourceGroups={groups.length > 0} /></TabsContent>
      </Tabs>
      <ModalFooter className={"items-center"}>
        <div className={"flex gap-3 w-full justify-end"}>
          {!resource ? <>{tab === "resource" && <><ModalClose asChild={true}><Button variant={"secondary"}>Cancel</Button></ModalClose><Button variant={"primary"} data-testid="resource-continue" onClick={() => setTab("access-control")} disabled={!canCreate}>Review Access</Button></>}{tab === "access-control" && <><Button variant={"secondary"} onClick={() => setTab("resource")}>Back</Button><Button variant={"primary"} data-testid={"submit-resource"} onClick={createResource} disabled={!canCreate}><PlusCircle size={16} />Add Resource</Button></>}</> : <><ModalClose asChild={true}><Button variant={"secondary"}>Cancel</Button></ModalClose><Button variant={"primary"} data-testid={"submit-route"} onClick={updateResource} disabled={!canCreate}>Save Changes</Button></>}
        </div>
      </ModalFooter>
    </ModalContent>
  );
}
