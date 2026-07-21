import { useEffect, useState } from 'react'
import {
  Plus,
  Loader2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllPayments, createPayment, updatePayment, getAllProjects } from '@/lib/supabase/api'
import type { Database } from '@/types/supabase'

type Payment = Database['public']['Tables']['payments']['Row']
type Project = Database['public']['Tables']['projects']['Row']

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_name: '',
    project_id: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    invoice_note: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [paymentsData, projectsData] = await Promise.all([
        getAllPayments(),
        getAllProjects(),
      ])
      setPayments(paymentsData)
      setProjects(projectsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      client_name: '',
      project_id: '',
      amount: '',
      currency: 'USD',
      status: 'pending',
      invoice_note: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        client_name: form.client_name || null,
        project_id: form.project_id || null,
        amount: parseFloat(form.amount),
        currency: form.currency,
        status: form.status,
        invoice_note: form.invoice_note || null,
        paid_at: form.status === 'paid' ? new Date().toISOString() : null,
      }

      if (editingId) {
        await updatePayment(editingId, data)
      } else {
        await createPayment(data)
      }
      await loadData()
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const startEdit = (payment: Payment) => {
    setForm({
      client_name: payment.client_name || '',
      project_id: payment.project_id || '',
      amount: payment.amount.toString(),
      currency: payment.currency || 'USD',
      status: payment.status || 'pending',
      invoice_note: payment.invoice_note || '',
    })
    setEditingId(payment.id)
    setDialogOpen(true)
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const statusIcon = (status: string | null) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-4 h-4 text-fresh" />
      case 'pending':
        return <Clock className="w-4 h-4 text-sunny" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-coral" />
      default:
        return <Clock className="w-4 h-4 text-gray-300" />
    }
  }

  const statusClass = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-fresh-50 text-fresh'
      case 'pending':
        return 'bg-sunny-50 text-sunny-800'
      case 'overdue':
        return 'bg-coral-50 text-coral'
      default:
        return 'bg-gray-50 text-gray-500'
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Payment' : 'Add Payment'}
              </DialogTitle>
              <DialogDescription>
                Record a payment from a client.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={form.client_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, client_name: e.target.value }))
                  }
                  placeholder="Client or project name"
                />
              </div>
              <div>
                <Label htmlFor="project">Project (optional)</Label>
                <Select
                  value={form.project_id}
                  onValueChange={(val) =>
                    setForm((p) => ({ ...p, project_id: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.id}>
                        {proj.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(val) =>
                      setForm((p) => ({ ...p, currency: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    setForm((p) => ({ ...p, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoice_note">Note</Label>
                <Input
                  id="invoice_note"
                  value={form.invoice_note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, invoice_note: e.target.value }))
                  }
                  placeholder="Invoice #, description, etc."
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                  {editingId ? 'Update' : 'Add'} Payment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-fresh" />
            <span className="text-sm text-gray-500">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-sunny" />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalPending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-sky" />
            <span className="text-sm text-gray-500">Grand Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${(totalPaid + totalPending).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Client
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Project
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => startEdit(payment)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {payment.client_name || '—'}
                      </p>
                      {payment.invoice_note && (
                        <p className="text-xs text-gray-400">
                          {payment.invoice_note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {(payment as any).projects?.title || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {payment.currency} {Number(payment.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusClass(
                          payment.status
                        )}`}
                      >
                        {statusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEdit(payment)
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No payments recorded yet</p>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(true)}
              >
                Add your first payment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
