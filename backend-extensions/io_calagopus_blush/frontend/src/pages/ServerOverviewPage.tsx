import React from 'react';
import {
  Activity,
  Copy,
  Folder,
  HardDrive,
  Network,
  Play,
  RotateCw,
  Square,
  Terminal,
} from 'lucide-react';
import {
  formatBytesPerSecond,
  formatUptime,
  type CalagopusServerDetail,
  type ServerPowerAction,
} from '../api/calagopusCore';
import { formatMegabytes, formatPercent } from '../api/calagopusDashboard';
import { Button } from '../components/Button';
import { MiniAreaChart } from '../components/MiniChart';
import { ConfirmDialog, showToast } from '../components/Overlays';
import { StatCard } from '../components/StatCard';
import { Card, PageHeader, StatusBadge } from '../components/Surface';

export interface ServerOverviewPageProps {
  server: CalagopusServerDetail;
  onPowerAction: (action: ServerPowerAction) => void;
  onNavigate: (path: string) => void;
  confirmDestructive?: boolean;
}

export function ServerOverviewPage({
  server,
  onPowerAction,
  onNavigate,
  confirmDestructive = true,
}: ServerOverviewPageProps) {
  const [confirmAction, setConfirmAction] = React.useState<'stop' | 'kill' | null>(null);
  const isRunning = server.state === 'running' || server.state === 'starting';

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast({ title: `${label} copied`, message: value, tone: 'success' });
    } catch {
      showToast({ title: `${label}`, message: value, tone: 'info' });
    }
  };

  const memoryPct =
    server.memoryLimitMb > 0 ? (server.memoryUsedMb / server.memoryLimitMb) * 100 : 0;
  const diskPct =
    server.diskLimitMb > 0 ? (server.diskUsedMb / server.diskLimitMb) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={server.name}
        description={server.description}
        metadata={[server.uuidShort, server.node, server.eggName, server.javaOrRuntime]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Terminal className="h-4 w-4" />}
              onClick={() => onNavigate(`/server/${server.uuidShort}`)}
            >
              Console
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Folder className="h-4 w-4" />}
              onClick={() => onNavigate(`/server/${server.uuidShort}/files`)}
            >
              Files
            </Button>
            {!isRunning ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="h-4 w-4" />}
                onClick={() => onPowerAction('start')}
              >
                Start
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCw className="h-4 w-4" />}
                  onClick={() => onPowerAction('restart')}
                >
                  Restart
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Square className="h-4 w-4" />}
                  onClick={() => {
                    if (confirmDestructive) {
                      setConfirmAction('stop');
                    } else {
                      onPowerAction('stop');
                    }
                  }}
                >
                  Stop
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CPU Utilization"
          value={formatPercent(server.cpuPercent)}
          helper={`Node ${server.node}`}
          progressPercent={server.cpuPercent}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Memory Usage"
          value={formatMegabytes(server.memoryUsedMb)}
          helper={`of ${formatMegabytes(server.memoryLimitMb)} (${memoryPct.toFixed(1)}%)`}
          progressPercent={memoryPct}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatCard
          label="Disk Storage"
          value={formatMegabytes(server.diskUsedMb)}
          helper={`of ${formatMegabytes(server.diskLimitMb)} (${diskPct.toFixed(1)}%)`}
          progressPercent={diskPct}
          icon={<Folder className="h-4 w-4" />}
        />
        <StatCard
          label="Network Throughput"
          value={formatBytesPerSecond(server.netOutBytesSec)}
          helper={`Inbound ${formatBytesPerSecond(server.netInBytesSec)}`}
          icon={<Network className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Server Utilization Trend"
          description="CPU, memory, and sample telemetry recorded by the Wings container agent."
          headerAction={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const payload = {
                  exportedAt: new Date().toISOString(),
                  server: {
                    id: server.uuidShort,
                    name: server.name,
                    node: server.node,
                    state: server.state,
                    cpuPercent: server.cpuPercent,
                    memoryUsedMb: server.memoryUsedMb,
                    memoryLimitMb: server.memoryLimitMb,
                    diskUsedMb: server.diskUsedMb,
                    diskLimitMb: server.diskLimitMb,
                  },
                  samples: server.telemetryHistory,
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                  type: 'application/json;charset=utf-8',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${server.uuidShort}-metrics.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast({ title: 'Server telemetry exported', tone: 'success' });
              }}
            >
              Export Metrics
            </Button>
          }
        >
          <MiniAreaChart
            series={[
              {
                name: 'CPU %',
                color: '#F4A6C1',
                points: server.telemetryHistory.map((pt) => ({
                  label: pt.label,
                  value: pt.cpu,
                })),
              },
              {
                name: 'Memory %',
                color: '#8E7AB5',
                points: server.telemetryHistory.map((pt) => ({
                  label: pt.label,
                  value:
                    server.memoryLimitMb > 0
                      ? Math.round((pt.memoryMb / server.memoryLimitMb) * 100)
                      : 0,
                })),
              },
            ]}
          />
        </Card>

        <Card
          title="Connection & Runtime"
          description="Primary allocation address and SFTP credentials."
          headerAction={
            <StatusBadge
              tone={
                server.state === 'running'
                  ? 'success'
                  : server.state === 'stopping'
                    ? 'warning'
                    : 'neutral'
              }
              label={server.state.charAt(0).toUpperCase() + server.state.slice(1)}
            />
          }
        >
          <dl className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--calagopus-border)] pb-2.5">
              <dt className="text-[var(--calagopus-text-secondary)]">Primary Address</dt>
              <dd className="inline-flex items-center gap-1.5 font-mono text-[var(--calagopus-text)] tabular-nums">
                <span>{server.allocation}</span>
                <button
                  type="button"
                  aria-label="Copy primary address"
                  onClick={() => void copyValue('Server address', server.allocation)}
                  className="blush-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--calagopus-text-secondary)] hover:bg-[var(--calagopus-primary-subtle)] hover:text-[var(--calagopus-text)] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-[var(--calagopus-border)] pb-2.5">
              <dt className="text-[var(--calagopus-text-secondary)]">Uptime</dt>
              <dd className="font-mono text-[var(--calagopus-text)] tabular-nums">
                {formatUptime(server.uptimeSeconds)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-[var(--calagopus-border)] pb-2.5">
              <dt className="text-[var(--calagopus-text-secondary)] shrink-0">SFTP Endpoint</dt>
              <dd className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[12px] text-[var(--calagopus-text)]">
                <span className="truncate">{`${server.sftpHost}:${server.sftpPort}`}</span>
                <button
                  type="button"
                  aria-label="Copy SFTP endpoint"
                  onClick={() =>
                    void copyValue('SFTP endpoint', `sftp://${server.sftpHost}:${server.sftpPort}`)
                  }
                  className="blush-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--calagopus-text-secondary)] hover:bg-[var(--calagopus-primary-subtle)] hover:text-[var(--calagopus-text)] shrink-0 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2">
              <dt className="text-[var(--calagopus-text-secondary)]">SFTP Username</dt>
              <dd className="font-mono text-[12px] text-[var(--calagopus-text)]">{server.sftpUsername}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        opened={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) onPowerAction(confirmAction);
          setConfirmAction(null);
        }}
        title={confirmAction === 'kill' ? 'Kill Server Process' : 'Stop Server Gracefully'}
        message={
          confirmAction === 'kill'
            ? `Force-terminating ${server.name} may cause unsaved world data loss.`
            : `Send a graceful shutdown signal to ${server.name}? Connected players will be disconnected.`
        }
        confirmLabel={confirmAction === 'kill' ? 'Kill Process' : 'Stop Server'}
        destructive
      />
    </div>
  );
}
