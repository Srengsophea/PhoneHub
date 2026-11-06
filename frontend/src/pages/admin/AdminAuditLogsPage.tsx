import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Pagination } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import type { AuditLog, PaginationMeta } from '@/types';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/audit-logs?page=${page}`);
        setLogs(data.data || []);
        setMeta(data.meta || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">System Audit Logs</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Security trails of all administrative updates and state changes.</p>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Actor</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Entity</th>
                <th className="py-3 px-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-xs">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 text-zinc-500">{formatDateTime(l.created_at)}</td>
                  <td className="py-3.5 px-6 font-semibold text-zinc-900">{l.user?.name || `User #${l.user_id}`}</td>
                  <td className="py-3.5 px-6 font-bold text-brand-600">{l.action}</td>
                  <td className="py-3.5 px-6 text-zinc-600">
                    {l.entity_type} #{l.entity_id}
                  </td>
                  <td className="py-3.5 px-6 text-zinc-400">{l.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4 border-t border-zinc-100 flex justify-center">
            <Pagination meta={meta} onPage={(p) => setPage(p)} />
          </div>
        )}
      </div>
    </div>
  );
}

