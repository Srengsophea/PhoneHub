import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge, Button, Pagination } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import type { User, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/customers?page=${page}`);
      setCustomers(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const toggleStatus = async (id: number) => {
    try {
      await api.put(`/admin/customers/${id}/toggle-status`);
      toast.success('Customer status changed.');
      loadCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Customer Accounts</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage registered shoppers and account activation.</p>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 font-semibold text-zinc-900">{c.name}</td>
                  <td className="py-3.5 px-6 text-zinc-600">{c.email}</td>
                  <td className="py-3.5 px-6 text-zinc-500">{c.phone || '—'}</td>
                  <td className="py-3.5 px-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      {c.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge tone={c.is_active ? 'success' : 'danger'}>
                      {c.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => toggleStatus(c.id)}
                    >
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
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

