"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blenvi/ui/components/dropdown-menu";
import { ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTE_PATHS } from "@/constants";
import { deleteClientCookie, setClientCookie } from "@/lib/client-cookies";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

const ACTIVE_WORKSPACE_COOKIE = "blenvi-active-workspace";
const ACTIVE_PROJECT_COOKIE = "blenvi-active-project";

export function WorkspaceSwitcher() {
  const [openCreate, setOpenCreate] = useState(false);
  const router = useRouter();
  const { workspaces, activeWorkspace, setActiveWorkspace, setActiveProject } =
    useWorkspaceStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">
            {activeWorkspace?.name ?? "Select workspace"}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => {
              setActiveWorkspace(workspace);
              setActiveProject(null);
              setClientCookie(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
                path: "/",
                maxAge: 31536000,
              });
              deleteClientCookie(ACTIVE_PROJECT_COOKIE);
              router.push(ROUTE_PATHS.overview);
            }}
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setOpenCreate(true)}>
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
      <CreateWorkspaceDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        withTrigger={false}
      />
    </DropdownMenu>
  );
}
