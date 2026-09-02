import { globalMetaTitle } from "@utils/meta";
import type { Metadata } from "next";
import AppLayout from "@/layouts/AppLayout";

export const metadata: Metadata = {
  title: `${globalMetaTitle}`,
  description:
    "Browser-based administration surface for GoreeCloud Network, including peers, access controls, routes, DNS, and network operations.",
};
export default AppLayout;
