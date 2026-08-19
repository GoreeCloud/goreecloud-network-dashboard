import { notify } from "@components/Notification";
import { ToggleSwitch } from "@components/ToggleSwitch";
import { useApiCall } from "@utils/api";
import * as React from "react";
import { useMemo } from "react";
import { useSWRConfig } from "swr";
import { useDialog } from "@/contexts/DialogProvider";
import { usePermissions } from "@/contexts/PermissionsProvider";
import { NetworkRouter } from "@/interfaces/Network";
import { useNetworksContext } from "@/modules/networks/NetworkProvider";

type Props = {
  router: NetworkRouter;
};

export const RoutingPeersEnabledCell = ({ router }: Props) => {
  const { permission } = usePermissions();
  const { confirm } = useDialog();
  const { mutate } = useSWRConfig();
  const { network } = useNetworksContext();

  const update = useApiCall<NetworkRouter>(
    `/networks/${network?.id}/routers/${router?.id}`,
  ).put;

  const toggle = async (enabled: boolean) => {
    if (!enabled) {
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
      description: `Routing peer is now ${enabled ? "enabled" : "disabled"}.`,
      loadingMessage: "Updating routing peer...",
      promise: update({
        ...router,
        enabled,
      }).then(() => {
        mutate(`/networks/${network?.id}/routers`);
      }),
    });
  };

  const isChecked = useMemo(() => {
    return router.enabled;
  }, [router]);

  return (
    <div className={"flex"}>
      <ToggleSwitch
        checked={isChecked}
        size={"small"}
        onClick={() => void toggle(!isChecked)}
        disabled={!permission.networks.update}
        aria-label={isChecked ? "Disable routing peer" : "Enable routing peer"}
      />
    </div>
  );
};
