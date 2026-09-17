export type WorkspaceTab = {
  id: string;
  href: string;
  title: string;
  closable: boolean;
  keepAlive: boolean;
};

export type WorkspaceSnapshot = {
  version: number;
  scope: string | null;
  tabs: WorkspaceTab[];
  activeId: string | null;
  lastHrefs: Record<string, string>;
};
