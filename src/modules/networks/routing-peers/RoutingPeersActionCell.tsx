import Button from "@components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/DropdownMenu";
import { notify } from "@components/Notification";
import { useApiCall } from "@utils/api";
import {
  MoreVertical,
  PowerIcon,
  SquarePenIcon,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useDialog } from "@/contexts/DialogProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { NetworkRouter } from "@/interfaces/Network";
import { useNetworksContext } from "@/modules/networks/NetworkProvider";

type Props = {
  router: NetworkRouter;
};

export const RoutingPeersActionCell = ({ router }: Props) => {
  const { permission } = usePermissions();
  const { confirm } = useDialog();
  const { deleteRouter, network, openAddRoutingPeerModal } =
    useNetworksContext();
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);

  const update = useApiCall<NetworkRouter>(
    `/networks/${network?.id}/routers/${router?.id}`,
  ).put;

  const toggleEnabled = async () => {
    const nextEnabled = !router.enabled;

    if (!nextEnabled) {
      const choice = await confirm({
        title: "Disable this routing peer?",
        description:
          "Disabling this routing peer stops it from forwarding traffic for this network. Resources that depend on this path may become unreachable until another enabled routing peer is available.",
        confirmText: "Disable Routing Peer",
        cancelText: "Cancel",
        type: "warning",
      });
      if (!choice) return;
    }

    notify({
      title: "Routing Peer",
      description: `Routing peer is now ${nextEnabled ? "enabled" : "disabled"}.`,
      loadingMessage: "Updating routing peer...",
      duration: 1200,
      promise: update({
        ...router,
        enabled: nextEnabled,
      }).then(() => {
        mutate(`/networks/${network?.id}/routers`);
      }),
    });
  };

  return (
    <div className={"flex justify-end"}>
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          asChild={true}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          disabled={!permission.networks.update && !permission.networks.delete}
        >
          <Button
            variant={"secondary"}
            className={"!px-3"}
            disabled={
              !permission.networks.update && !permission.networks.delete
            }
            aria-label={"Routing peer actions"}
          >
            <MoreVertical size={16} className={"shrink-0"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto" align="end">
          <DropdownMenuItem
            onClick={() => {
              if (!network) return;
              openAddRoutingPeerModal(network, router);
            }}
            disabled={!permission.networks.update}
          >
            <div className={"flex gap-3 items-center"}>
              <SquarePenIcon size={14} className={"shrink-0"} />
              Edit Routing Peer
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              void toggleEnabled();
            }}
            disabled={!permission.networks.update}
          >
            <div className={"flex gap-3 items-center"}>
              <PowerIcon size={14} className={"shrink-0"} />
              {router.enabled ? "Disable Routing Peer" : "Enable Routing Peer"}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (!network) return;
              deleteRouter(network, router);
            }}
            variant={"danger"}
            disabled={!permission.networks.delete}
          >
            <div className={"flex gap-3 items-center"}>
              <Trash2 size={14} className={"shrink-0"} />
              Remove Routing Peer
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
