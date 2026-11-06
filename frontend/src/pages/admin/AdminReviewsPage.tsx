import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Badge, Button, Stars, Pagination } from '@/components/ui';
import { Check, X } from 'lucide-react';
import type { Review, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reviews?page=${page}`);
      setReviews(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page]);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      toast.success(`Review ${status}!`);
      loadReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update review.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Review Moderation</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Audit and approve user ratings submitted for phones.</p>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 bg-white overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-6">Reviewer</th>
                <th className="py-3 px-6">Rating & Comment</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-6 font-semibold text-zinc-900">
                    {r.product?.name || `Product #${r.product_id}`}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-zinc-500">
                    {r.user?.name || 'Customer'}
                  </td>
                  <td className="py-3.5 px-6 max-w-md">
                    <Stars value={r.rating} size="xs" />
                    <p className="font-semibold text-xs text-zinc-900 mt-1">{r.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge
                      tone={
                        r.status === 'approved'
                          ? 'success'
                          : r.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2">
                    <button
                      onClick={() => updateStatus(r.id, 'approved')}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'rejected')}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
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

