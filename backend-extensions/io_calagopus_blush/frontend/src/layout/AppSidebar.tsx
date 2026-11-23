import React from 'react';
import { Drawer } from '@mantine/core';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Globe,
  MessageCircle,
  Play,
  RotateCw,
  Search,
  Server,
  ShieldCheck,
  Square,
  User,
} from 'lucide-react';
import { formatUptime, type ServerPowerAction } from '../api/calagopusCore';
import type { ServerRuntimeState } from '../api/calagopusDashboard';
import { PetalnodesLogo } from '../components/PetalnodesLogo';
import { Tooltip } from '../components/Overlays';
import {
  getNavGroupsForScope,
  isRouteActive,
  type CalagopusScope,
  type CalagopusUserContext,
  type NavGroup,
} from '../navigation/calagopusRoutes';
import { PETALNODES_BRAND, PETALNODES_LINKS } from '../navigation/petalnodesBrand';
import { NavIcon } from './NavIcon';

export interface SidebarServerContext {
  uuidShort: string;
  name: string;
  state: ServerRuntimeState;
  uptimeSeconds: number;
}

export interface AppSidebarProps {
  scope: CalagopusScope;
  currentPath: string;
  user: CalagopusUserContext;
  collapsed: boolean;
  mobileOpened: boolean;
  onCloseMobile: () => void;
  onNavigate: (path: string) => void;
  brandName?: string;
  activeServer?: SidebarServerContext;
  serversList?: readonly { uuidShort: string; name: string }[];
  onServerPowerAction?: (action: ServerPowerAction) => void;
  onOpenQuickActions?: () => void;
}

function SidebarContent({
  scope,
  currentPath,
  user,
  collapsed,
  onNavigate,
  onAfterNavigate,
  brandName = PETALNODES_BRAND,
  activeServer,
  serversList,
  onServerPowerAction,
  onOpenQuickActions,
  showMobileQuickLinks = false,
}: {
  scope: CalagopusScope;
  currentPath: string;
  user: CalagopusUserContext;
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onAfterNavigate?: () => void;
  brandName?: string;
  activeServer?: SidebarServerContext;
  serversList?: readonly { uuidShort: string; name: string }[];
  onServerPowerAction?: (action: ServerPowerAction) => void;
  onOpenQuickActions?: () => void;
  showMobileQuickLinks?: boolean;
}) {
  const resolvedServerId = activeServer?.uuidShort ?? serversList?.[0]?.uuidShort;
  const serverId = resolvedServerId ?? '';
  const navGroups = React.useMemo(
    () => getNavGroupsForScope(scope, user, serverId || 'alpha-01'),
    [scope, user, serverId],
  );

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const isGroupOpen = (group: NavGroup) => {
    if (!group.collapsible || collapsed) return true;
    return openGroups[group.id] ?? group.defaultOpen ?? true;
  };

  const toggleGroup = (groupId: string, current: boolean) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !current }));
  };

  const canAccessAdmin =
    user.isAdmin || user.permissions.some((p) => p.startsWith('admin.'));

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onAfterNavigate?.();
  };

  const isRunning = activeServer?.state === 'running' || activeServer?.state === 'starting';

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-4 px-3 py-4 overflow-y-auto">
        {!collapsed ? (
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--calagopus-border)] bg-[var(--calagopus-surface-secondary)] p-1">
            <button
              type="button"
              onClick={() => handleLinkClick('/')}
              className={`blush-transition blush-focus-ring inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer ${
                scope === 'client'
                  ? 'bg-[var(--calagopus-surface)] text-[var(--calagopus-text)] shadow-[var(--calagopus-shadow-card)]'
                  : 'text-[var(--calagopus-text-secondary)] hover:text-[var(--calagopus-text)]'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Client</span>
            </button>

            <button
              type="button"
              disabled={!resolvedServerId}
              title={!resolvedServerId ? 'No server selected or assigned' : undefined}
              onClick={() => resolvedServerId && handleLinkClick(`/server/${resolvedServerId}`)}
              className={`blush-transition blush-focus-ring inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium whitespace-nowrap ${
                !resolvedServerId
                  ? 'text-[var(--calagopus-text-secondary)] opacity-45 cursor-not-allowed'
                  : scope === 'server'
                    ? 'bg-[var(--calagopus-surface)] text-[var(--calagopus-text)] shadow-[var(--calagopus-shadow-card)] cursor-pointer'
                    : 'text-[var(--calagopus-text-secondary)] hover:text-[var(--calagopus-text)] cursor-pointer'
              }`}
            >
              <Server className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Server</span>
            </button>

            {canAccessAdmin ? (
              <button
                type="button"
                onClick={() => handleLinkClick('/admin')}
                className={`blush-transition blush-focus-ring inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer ${
                  scope === 'admin'
                    ? 'bg-[var(--calagopus-surface)] text-[var(--calagopus-primary-text)] shadow-[var(--calagopus-shadow-card)]'
                    : 'text-[var(--calagopus-text-secondary)] hover:text-[var(--calagopus-text)]'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Admin</span>
              </button>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium text-[var(--calagopus-text-secondary)] opacity-45 select-none"
              >
                Admin
              </span>
            )}
          </div>
        ) : null}

        {!collapsed && onOpenQuickActions ? (
          <button
            type="button"
            onClick={() => {
              onAfterNavigate?.();
              onOpenQuickActions();
            }}
            className="blush-transition blush-focus-ring flex w-full items-center justify-between rounded-lg border border-[var(--calagopus-border)] bg-[var(--calagopus-surface-secondary)] px-3 py-2 text-[12px] text-[var(--calagopus-text-secondary)] hover:border-[var(--calagopus-primary-border)] hover:bg-[var(--calagopus-primary-subtle)] hover:text-[var(--calagopus-text)] cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Quick actions...</span>
            </span>
            <kbd className="rounded border border-[var(--calagopus-border)] bg-[var(--calagopus-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--calagopus-text-secondary)]">
              Ctrl+K
            </kbd>
          </button>
        ) : null}

        {!collapsed && scope === 'server' && activeServer ? (
          <div className="rounded-xl border border-[var(--calagopus-border)] bg-[var(--calagopus-surface-secondary)] p-3 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--calagopus-text)] leading-tight">
                  {activeServer.name}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--calagopus-text-secondary)]">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isRunning
                        ? 'bg-[var(--calagopus-success)]'
                        : 'bg-[var(--calagopus-text-secondary)]'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="capitalize">{activeServer.state}</span>
                  {activeServer.uptimeSeconds > 0 ? (
                    <span className="ml-auto font-mono tabular-nums">
                      {formatUptime(activeServer.uptimeSeconds)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {onServerPowerAction ? (
              <div className="flex items-center gap-1.5">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={() => onServerPowerAction('stop')}
                    className="blush-transition blush-focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--calagopus-danger-border)] bg-[var(--calagopus-danger-bg)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--calagopus-danger-text)] hover:opacity-90 cursor-pointer"
                  >
                    <Square className="h-3 w-3" aria-hidden="true" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onServerPowerAction('start')}
                    className="blush-transition blush-focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--calagopus-success-border)] bg-[var(--calagopus-success-bg)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--calagopus-success-text)] hover:opacity-90 cursor-pointer"
                  >
                    <Play className="h-3 w-3" aria-hidden="true" />
                    <span>Start</span>
                  </button>
                )}
                <Tooltip label="Restart server">
                  <button
                    type="button"
                    aria-label="Restart server"
                    onClick={() => onServerPowerAction('restart')}
                    className="blush-transition blush-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--calagopus-border)] bg-[var(--calagopus-surface)] text-[var(--calagopus-text)] hover:border-[var(--calagopus-primary-border)] hover:bg-[var(--calagopus-primary-subtle)] cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </Tooltip>
              </div>
            ) : null}
          </div>
        ) : null}

        <nav aria-label="Sidebar navigation" className="space-y-4">
          {navGroups.map((group) => {
            const expanded = isGroupOpen(group);

            return (
              <div key={group.id} className="space-y-1">
                {!collapsed ? (
                  group.collapsible ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => toggleGroup(group.id, expanded)}
                      className="blush-focus-ring flex w-full items-center justify-between rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] text-[var(--calagopus-text-secondary)] hover:text-[var(--calagopus-text)] cursor-pointer"
                    >
                      <span>{group.label}</span>
                      {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <p className="px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] text-[var(--calagopus-text-secondary)]">
                      {group.label}
                    </p>
                  )
                ) : null}

                {expanded ? (
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isRouteActive(currentPath, item.path, item.exact);

                      const button = (
                        <a
                          href={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(item.path);
                          }}
                          aria-current={active ? 'page' : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          className={`blush-transition blush-focus-ring flex min-h-[40px] items-center rounded-lg border text-[13px] font-medium whitespace-nowrap ${
                            collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
                          } ${
                            active
                              ? 'border-[var(--calagopus-primary-border)] bg-[var(--calagopus-primary-soft)] text-[var(--calagopus-primary-text)]'
                              : 'border-transparent text-[var(--calagopus-text)] hover:bg-[var(--calagopus-primary-subtle)]'
                          }`}
                        >
                          <NavIcon
                            name={item.icon}
                            className={`h-4 w-4 shrink-0 ${
                              active
                                ? 'text-[var(--calagopus-primary-text)]'
                                : 'text-[var(--calagopus-text-secondary)]'
                            }`}
                          />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                        </a>
                      );

                      return (
                        <li key={item.id}>
                          {collapsed ? (
                            <Tooltip label={item.label} position="right">
                              {button}
                            </Tooltip>
                          ) : (
                            button
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>

        {showMobileQuickLinks && !collapsed ? (
          <div className="border-t border-[var(--calagopus-border)] pt-3 space-y-2 lg:hidden">
            <p className="px-2 text-[11px] font-semibold tracking-[0.03em] text-[var(--calagopus-text-secondary)]">
              Petalnodes Portals
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PETALNODES_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blush-focus-ring inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--calagopus-border)] bg-[var(--calagopus-surface-secondary)] px-2.5 py-2 text-[12px] font-medium text-[var(--calagopus-text)] hover:border-[var(--calagopus-primary-border)] hover:bg-[var(--calagopus-primary-subtle)] hover:text-[var(--calagopus-primary-text)]"
                >
                  {link.id === 'billing' ? (
                    <CreditCard className="h-3.5 w-3.5 text-[var(--calagopus-primary-text)] shrink-0" aria-hidden="true" />
                  ) : link.id === 'discord' ? (
                    <MessageCircle className="h-3.5 w-3.5 text-[var(--calagopus-primary-text)] shrink-0" aria-hidden="true" />
                  ) : link.id === 'website' ? (
                    <Globe className="h-3.5 w-3.5 text-[var(--calagopus-primary-text)] shrink-0" aria-hidden="true" />
                  ) : (
                    <Activity className="h-3.5 w-3.5 text-[var(--calagopus-primary-text)] shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{link.shortLabel}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="border-t border-[var(--calagopus-border)] p-3 space-y-2.5">
          {scope === 'server' && serversList && serversList.length > 0 ? (
            <div>
              <label htmlFor="calagopus-server-switcher" className="sr-only">
                Switch active server
              </label>
              <select
                id="calagopus-server-switcher"
                value={serverId}
                onChange={(e) => {
                  const nextId = e.currentTarget.value;
                  const segments = currentPath.split('/').filter(Boolean);
                  const subRoute = segments[2] ? `/${segments[2]}` : '';
                  handleLinkClick(`/server/${nextId}${subRoute}`);
                }}
                className="blush-focus-ring w-full rounded-lg border border-[var(--calagopus-border)] bg-[var(--calagopus-surface-secondary)] px-2.5 py-2 text-[12px] font-medium text-[var(--calagopus-text)] hover:border-[var(--calagopus-border-strong)] cursor-pointer"
              >
                {serversList.map((srv) => (
                  <option key={srv.uuidShort} value={srv.uuidShort}>
                    {srv.name} ({srv.uuidShort})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="px-1 text-[12px] text-[var(--calagopus-text-secondary)]">
            <span className="font-medium text-[var(--calagopus-text)]">{brandName} Panel</span>
            <span className="block text-[11px]">Plant a seed. Grow a world.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  scope,
  currentPath,
  user,
  collapsed,
  mobileOpened,
  onCloseMobile,
  onNavigate,
  brandName = PETALNODES_BRAND,
  activeServer,
  serversList,
  onServerPowerAction,
  onOpenQuickActions,
}: AppSidebarProps) {
  return (
    <>
      <aside
        aria-label="Primary sidebar"
        className={`hidden lg:flex lg:flex-col lg:shrink-0 border-r border-[var(--calagopus-border)] bg-[var(--calagopus-surface)] blush-transition ${
          collapsed ? 'lg:w-[72px]' : 'lg:w-[252px]'
        }`}
      >
        <SidebarContent
          scope={scope}
          currentPath={currentPath}
          user={user}
          collapsed={collapsed}
          brandName={brandName}
          onNavigate={onNavigate}
          activeServer={activeServer}
          serversList={serversList}
          onServerPowerAction={onServerPowerAction}
          onOpenQuickActions={onOpenQuickActions}
        />
      </aside>

      <Drawer
        opened={mobileOpened}
        onClose={onCloseMobile}
        size={280}
        padding={0}
        zIndex={200}
        overlayProps={{ backgroundOpacity: 0.45 }}
        transitionProps={{ duration: 100 }}
        title={
          <div className="flex items-center gap-2.5">
            <PetalnodesLogo size="sm" />
            <span className="font-display text-sm font-semibold text-[var(--calagopus-text)]">
              {brandName}
            </span>
          </div>
        }
        closeButtonProps={{ 'aria-label': 'Close navigation menu' }}
        styles={{
          content: {
            backgroundColor: 'var(--calagopus-surface)',
            color: 'var(--calagopus-text)',
          },
          header: {
            borderBottom: '1px solid var(--calagopus-border)',
            padding: '14px 16px',
            backgroundColor: 'var(--calagopus-surface)',
          },
          body: {
            padding: 0,
            height: 'calc(100% - 57px)',
            backgroundColor: 'var(--calagopus-surface)',
          },
        }}
      >
        <SidebarContent
          scope={scope}
          currentPath={currentPath}
          user={user}
          collapsed={false}
          brandName={brandName}
          onNavigate={onNavigate}
          onAfterNavigate={onCloseMobile}
          activeServer={activeServer}
          serversList={serversList}
          onServerPowerAction={onServerPowerAction}
          onOpenQuickActions={onOpenQuickActions}
          showMobileQuickLinks
        />
      </Drawer>
    </>
  );
}
