import { globalMetaTitle } from "@utils/meta";
import type { Metadata } from "next";
import AppLayout from "@/layouts/AppLayout";

export const metadata: Metadata = {
  title: globalMetaTitle,
  description:
    "GoreeCloud Network provides self-hosted private networking, device connectivity, and access control for approved GoreeCloud users, devices, and services.",
};

export default AppLayout;
