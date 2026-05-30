import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { Toast, type ToastTone } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { SERVICES } from '@/lib/services';
import { toCsv, downloadCsv } from '@/lib/csv';
import type { Booking, Vendor, SupportTicket, BookingStatus, ServiceType, AdminMetrics, Admin, AdminIdentity } from '@/lib/types';
import * as api from '@/lib/api';
import { Overview } from './Overview';
import { useTableControls } from './useTableControls';
import { TableToolbar, SortHeader, type AdminView } from './TableToolbar';
import { KanbanBoard } from './KanbanBoard';
import { ImageUpload } from './ImageUpload';

type Tab = 'overview' | 'leads' | 'vendors' | 'tickets' | 'admins';
const TABS: Tab[] = ['overview', 'leads', 'vendors', 'tickets', 'admins'];
const STATUSES: BookingStatus[] = ['lead', 'quoted', 'confirmed', 'fulfilled', 'cancelled'];
const KYC_STATUSES = ['pending', 'verified', 'rejected'];
const TICKET_STATUSES: SupportTicket['status'][] = ['open', 'in_progress', 'resolved'];

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
const inr = (n?: number | null) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : '—');

function useToast() {
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  return { toast, show: (tone: ToastTone, message: string) => setToast({ tone, message }), clear: () => setToast(null) };
}

export function AdminDashboard({
  bookings, vendors, tickets, metrics, me, usingPg, reload, onLogout,
}: {
  bookings: Booking[];
  vendors: Vendor[];
  tickets: SupportTicket[];
  metrics: AdminMetrics | null;
  me: AdminIdentity | null;
  usingPg: boolean;
  reload: () => void;
  onLogout: () => void;
}) {
  const t = useTranslations('admin');
  const svc = useTranslations('services');
  const [tab, setTab] = useState<Tab>('overview');
  const [modal, setModal] = useState<Exclude<Tab, 'overview'> | null>(null);
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [pending, start] = useTransition();
  const { toast, show, clear } = useToast();

  // `after` lets a mutation refresh a different dataset (e.g. the admins list)
  // instead of the main dashboard reload.
  const run = (fn: () => Promise<unknown>, okMsg: string, after: () => void = reload) =>
    start(async () => {
      try {
        await fn();
        show('success', okMsg);
      } catch (e) {
        console.error(e);
        show('error', e instanceof api.ApiError ? e.message : t('actionFailed'));
      }
      after();
    });

  const loadAdmins = useCallback(() => { api.adminListAdmins().then(setAdmins).catch(() => setAdmins([])); }, []);
  useEffect(() => { if (tab === 'admins' && admins === null) loadAdmins(); }, [tab, admins, loadAdmins]);

  const addLabel = tab === 'overview' ? null : t(`add.${tab}`);

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-full border border-line bg-white p-1" aria-label="Admin sections">
          {TABS.map((x) => (
            <button key={x} onClick={() => setTab(x)}
              aria-current={tab === x}
              className={cn('rounded-full px-4 py-1.5 text-sm font-semibold transition-colors', tab === x ? 'bg-saffron text-white' : 'text-muted hover:text-ink')}>
              {t(`nav.${x}`)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {me && (
            <span className="hidden text-xs text-muted sm:inline">
              {t('signedInAs')} <span className="font-semibold text-ink">{me.email}</span>
              <Badge tone={me.role === 'owner' ? 'saffron' : 'neutral'} className="ml-1.5">{me.role}</Badge>
            </span>
          )}
          {addLabel && <Button size="sm" onClick={() => setModal(tab as Exclude<Tab, 'overview'>)}>＋ {addLabel}</Button>}
          <Button variant="ghost" size="sm" onClick={onLogout}>{t('logout')}</Button>
        </div>
      </div>

      <p className={cn('mt-4 rounded-lg px-4 py-2 text-xs', usingPg ? 'bg-teal/10 text-teal' : 'bg-gold/10 text-[#8a6510]')}>
        {usingPg ? 'Connected to Postgres.' : t('persistNote')}
      </p>

      <div className={cn('mt-5', pending && 'pointer-events-none opacity-60')}>
        {tab === 'overview' && (metrics
          ? <Overview m={metrics} />
          : <p className="py-10 text-center text-muted">…</p>)}

        {tab === 'leads' && <LeadsTable bookings={bookings} run={run} onAdd={() => setModal('leads')} />}
        {tab === 'vendors' && <VendorsTable vendors={vendors} run={run} onAdd={() => setModal('vendors')} />}
        {tab === 'tickets' && <TicketsTable tickets={tickets} run={run} onAdd={() => setModal('tickets')} />}
        {tab === 'admins' && <AdminsTable admins={admins} me={me} run={run} reloadAdmins={loadAdmins} onAdd={() => setModal('admins')} />}
      </div>

      <Modal open={modal === 'vendors'} onClose={() => setModal(null)} title={t('add.vendors')}>
        <AddVendorForm svc={svc} onDone={(input) => { setModal(null); run(() => api.adminAddVendor(input), t('added.vendors')); }} />
      </Modal>
      <Modal open={modal === 'leads'} onClose={() => setModal(null)} title={t('add.leads')}>
        <AddBookingForm svc={svc} onDone={(input) => { setModal(null); run(() => api.adminAddBooking(input), t('added.leads')); }} />
      </Modal>
      <Modal open={modal === 'tickets'} onClose={() => setModal(null)} title={t('add.tickets')}>
        <AddTicketForm onDone={(category, notes) => { setModal(null); run(() => api.adminAddTicket({ category, notes }), t('added.tickets')); }} />
      </Modal>
      <Modal open={modal === 'admins'} onClose={() => setModal(null)} title={t('add.admins')}>
        <AddAdminForm canSetRole={me?.role === 'owner'} onDone={(input) => { setModal(null); run(() => api.adminCreateAdmin(input), t('added.admins'), loadAdmins); }} />
      </Modal>

      <Toast open={!!toast} tone={toast?.tone} message={toast?.message ?? ''} onClose={clear} />
    </div>
  );
}

type Run = (fn: () => Promise<unknown>, okMsg: string, after?: () => void) => void;

function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-card border border-line bg-white">{children}</div>;
}

// ── Leads ──────────────────────────────────────────────────────
function LeadsTable({ bookings, run, onAdd }: { bookings: Booking[]; run: Run; onAdd: () => void }) {
  const t = useTranslations('admin');
  const c = useTranslations('admin.cols');
  const [view, setView] = useState<AdminView>('table');
  const ctl = useTableControls(bookings, { searchKeys: ['customer_name', 'customer_phone', 'service_type', 'area', 'status'], statusKey: 'status' });
  const board = view === 'board';

  const exportCsv = () => downloadCsv('leads.csv', toCsv(ctl.rows, [
    { key: 'name', header: 'Name', get: (b) => b.customer_name ?? '' },
    { key: 'phone', header: 'Phone', get: (b) => b.customer_phone ?? '' },
    { key: 'service', header: 'Service', get: (b) => b.service_type },
    { key: 'date', header: 'Date', get: (b) => b.start_date ?? '' },
    { key: 'party', header: 'Party', get: (b) => b.party_size ?? '' },
    { key: 'amount', header: 'Amount', get: (b) => b.amount ?? '' },
    { key: 'commission', header: 'Commission', get: (b) => b.commission ?? '' },
    { key: 'channel', header: 'Channel', get: (b) => b.channel },
    { key: 'status', header: 'Status', get: (b) => b.status },
    { key: 'created', header: 'Created', get: (b) => b.created_at },
  ]));

  return (
    <div className="space-y-3">
      <TableToolbar query={ctl.query} onQuery={ctl.setQuery} statuses={board ? undefined : STATUSES} statusFilter={ctl.statusFilter} onStatus={ctl.setStatusFilter}
        count={ctl.rows.length} total={bookings.length} onExport={exportCsv} placeholder={t('search.leads')}
        view={view} onView={(v) => { if (v === 'board') ctl.setStatusFilter('all'); setView(v); }} />
      {board ? (
        <KanbanBoard
          items={ctl.rows}
          columns={STATUSES}
          columnOf={(b) => b.status}
          idOf={(b) => b.id}
          onMove={(b, to) => run(() => api.adminPatchBooking(b.id, to), t('updated'))}
          renderCard={(b) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-ink">{b.customer_name ?? '—'}</span>
                <RowDelete onClick={() => run(() => api.adminDeleteBooking(b.id), t('deleted'))} />
              </div>
              <p className="text-xs text-muted">{b.customer_phone ?? '—'}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge tone="neutral"><span className="capitalize">{b.service_type}</span></Badge>
                <Badge tone="plum">{b.channel}</Badge>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-muted">
                <span>{fmtDate(b.start_date)}{b.party_size ? ` · ${b.party_size} pax` : ''}</span>
                <span className="font-semibold text-ink">{inr(b.amount)}</span>
              </div>
            </div>
          )}
        />
      ) : (
      <TableShell>
        {ctl.rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs">
              <tr>
                <SortHeader label={c('name')} sortKey="customer_name" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{c('phone')}</th>
                <SortHeader label={c('service')} sortKey="service_type" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('date')} sortKey="start_date" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('party')} sortKey="party_size" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('amount')} sortKey="amount" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{c('channel')}</th>
                <SortHeader label={c('status')} sortKey="status" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ctl.rows.map((b) => (
                <tr key={b.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium text-ink">{b.customer_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{b.customer_phone ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{b.service_type}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(b.start_date)}</td>
                  <td className="px-4 py-3 text-muted">{b.party_size ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{inr(b.amount)}</td>
                  <td className="px-4 py-3"><Badge tone="plum">{b.channel}</Badge></td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={(e) => run(() => api.adminPatchBooking(b.id, e.target.value), t('updated'))}
                      className="rounded-full border border-line bg-white px-2 py-1 text-xs font-semibold">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right"><RowDelete onClick={() => run(() => api.adminDeleteBooking(b.id), t('deleted'))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><EmptyState title={bookings.length ? t('noMatch') : t('noLeads')} action={<Button size="sm" onClick={onAdd}>＋ {t('add.leads')}</Button>} /></div>
        )}
      </TableShell>
      )}
    </div>
  );
}

// Clickable vendor thumbnail — uploads/replaces the image and patches the row.
// Upload + save run as one thunk so a failure (e.g. uploads not configured)
// surfaces through the shared toast.
function VendorImageButton({ vendor, run }: { vendor: Vendor; run: Run }) {
  const t = useTranslations('admin');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line bg-cream"
        aria-label={vendor.image_url ? 'Replace image' : 'Upload image'}
        title={vendor.image_url ? 'Replace image' : 'Upload image'}
      >
        {vendor.image_url
          ? <img src={vendor.image_url} alt="" className="h-full w-full object-cover" />
          : <span className="flex h-full w-full items-center justify-center text-muted" aria-hidden>＋</span>}
        <span className="absolute inset-0 hidden items-center justify-center bg-ink/55 text-[10px] font-semibold text-white group-hover:flex">edit</span>
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.currentTarget.value = '';
          if (f) run(async () => { const url = await api.adminUploadImage(f); await api.adminPatchVendor(vendor.id, { image_url: url }); }, t('updated'));
        }} />
    </>
  );
}

// ── Vendors ────────────────────────────────────────────────────
function VendorsTable({ vendors, run, onAdd }: { vendors: Vendor[]; run: Run; onAdd: () => void }) {
  const t = useTranslations('admin');
  const c = useTranslations('admin.cols');
  const [view, setView] = useState<AdminView>('table');
  const ctl = useTableControls(vendors, { searchKeys: ['name', 'area', 'type', 'kyc_status'], statusKey: 'kyc_status' });
  const board = view === 'board';

  const exportCsv = () => downloadCsv('vendors.csv', toCsv(ctl.rows, [
    { key: 'name', header: 'Name', get: (v) => v.name },
    { key: 'type', header: 'Type', get: (v) => v.type },
    { key: 'area', header: 'Area', get: (v) => v.area },
    { key: 'capacity', header: 'Capacity', get: (v) => v.capacity ?? '' },
    { key: 'kyc', header: 'KYC', get: (v) => v.kyc_status },
    { key: 'active', header: 'Live', get: (v) => (v.active ? 'yes' : 'no') },
    { key: 'rating', header: 'Rating', get: (v) => v.rating ?? '' },
    { key: 'created', header: 'Created', get: (v) => v.created_at },
  ]));

  return (
    <div className="space-y-3">
      <TableToolbar query={ctl.query} onQuery={ctl.setQuery} statuses={board ? undefined : KYC_STATUSES} statusFilter={ctl.statusFilter} onStatus={ctl.setStatusFilter}
        count={ctl.rows.length} total={vendors.length} onExport={exportCsv} placeholder={t('search.vendors')}
        view={view} onView={(v) => { if (v === 'board') ctl.setStatusFilter('all'); setView(v); }} />
      {board ? (
        <KanbanBoard
          items={ctl.rows}
          columns={KYC_STATUSES}
          columnOf={(v) => v.kyc_status}
          idOf={(v) => v.id}
          onMove={(v, to) => run(() => api.adminPatchVendor(v.id, { kyc_status: to }), t('updated'))}
          renderCard={(v) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <VendorImageButton vendor={v} run={run} />
                  <span className="font-semibold text-ink">{v.name}</span>
                </div>
                <RowDelete onClick={() => run(() => api.adminDeleteVendor(v.id), t('deleted'))} />
              </div>
              <p className="text-xs capitalize text-muted">{v.type} · {v.area}</p>
              <div className="flex items-center justify-between pt-1">
                <button onClick={() => run(() => api.adminPatchVendor(v.id, { active: !v.active }), t('updated'))}
                  className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', v.active ? 'bg-teal/15 text-teal' : 'bg-ink/5 text-muted')}>
                  {v.active ? 'Live' : 'Off'}
                </button>
                <span className="text-xs text-muted">★ {v.rating ?? '—'}</span>
              </div>
            </div>
          )}
        />
      ) : (
      <TableShell>
        {ctl.rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs">
              <tr>
                <SortHeader label={c('name')} sortKey="name" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('type')} sortKey="type" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('area')} sortKey="area" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('kyc')} sortKey="kyc_status" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Live</th>
                <SortHeader label={c('rating')} sortKey="rating" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ctl.rows.map((v) => (
                <tr key={v.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium text-ink">
                    <div className="flex items-center gap-3">
                      <VendorImageButton vendor={v} run={run} />
                      <span>{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{v.type}</td>
                  <td className="px-4 py-3 text-muted">{v.area}</td>
                  <td className="px-4 py-3"><Badge tone={v.kyc_status === 'verified' ? 'green' : v.kyc_status === 'rejected' ? 'rose' : 'neutral'}>{v.kyc_status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => run(() => api.adminPatchVendor(v.id, { active: !v.active }), t('updated'))}
                      className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', v.active ? 'bg-teal/15 text-teal' : 'bg-ink/5 text-muted')}>
                      {v.active ? 'Live' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{v.rating ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {v.kyc_status !== 'verified' && (
                        <button onClick={() => run(() => api.adminVerifyVendor(v.id), t('updated'))} className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal/20">✓ Verify</button>
                      )}
                      <RowDelete onClick={() => run(() => api.adminDeleteVendor(v.id), t('deleted'))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><EmptyState title={vendors.length ? t('noMatch') : t('noVendors')} action={<Button size="sm" onClick={onAdd}>＋ {t('add.vendors')}</Button>} /></div>
        )}
      </TableShell>
      )}
    </div>
  );
}

// ── Tickets ────────────────────────────────────────────────────
function TicketsTable({ tickets, run, onAdd }: { tickets: SupportTicket[]; run: Run; onAdd: () => void }) {
  const t = useTranslations('admin');
  const c = useTranslations('admin.cols');
  const [view, setView] = useState<AdminView>('table');
  const ctl = useTableControls(tickets, { searchKeys: ['category', 'channel', 'status', 'notes'], statusKey: 'status' });
  const board = view === 'board';

  const exportCsv = () => downloadCsv('tickets.csv', toCsv(ctl.rows, [
    { key: 'category', header: 'Category', get: (k) => k.category },
    { key: 'channel', header: 'Channel', get: (k) => k.channel },
    { key: 'status', header: 'Status', get: (k) => k.status },
    { key: 'notes', header: 'Notes', get: (k) => k.notes ?? '' },
    { key: 'created', header: 'Created', get: (k) => k.created_at },
  ]));

  return (
    <div className="space-y-3">
      <TableToolbar query={ctl.query} onQuery={ctl.setQuery} statuses={board ? undefined : TICKET_STATUSES} statusFilter={ctl.statusFilter} onStatus={ctl.setStatusFilter}
        count={ctl.rows.length} total={tickets.length} onExport={exportCsv} placeholder={t('search.tickets')}
        view={view} onView={(v) => { if (v === 'board') ctl.setStatusFilter('all'); setView(v); }} />
      {board ? (
        <KanbanBoard
          items={ctl.rows}
          columns={TICKET_STATUSES}
          columnOf={(tk) => tk.status}
          idOf={(tk) => tk.id}
          onMove={(tk, to) => run(() => api.adminPatchTicket(tk.id, to), t('updated'))}
          renderCard={(tk) => (
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold capitalize text-ink">{tk.category}</span>
                <RowDelete onClick={() => run(() => api.adminDeleteTicket(tk.id), t('deleted'))} />
              </div>
              {tk.notes && <p className="text-xs text-muted">{tk.notes}</p>}
              <div className="flex items-center justify-between pt-1">
                <Badge tone="plum">{tk.channel}</Badge>
                <span className="text-xs text-muted">{fmtDate(tk.created_at)}</span>
              </div>
            </div>
          )}
        />
      ) : (
      <TableShell>
        {ctl.rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs">
              <tr>
                <SortHeader label={c('category')} sortKey="category" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{c('channel')}</th>
                <SortHeader label={c('status')} sortKey="status" sort={ctl.sort} onSort={ctl.toggleSort} />
                <SortHeader label={c('created')} sortKey="created_at" sort={ctl.sort} onSort={ctl.toggleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ctl.rows.map((tk) => (
                <tr key={tk.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium capitalize text-ink">{tk.category}</td>
                  <td className="px-4 py-3"><Badge tone="plum">{tk.channel}</Badge></td>
                  <td className="px-4 py-3">
                    <select value={tk.status} onChange={(e) => run(() => api.adminPatchTicket(tk.id, e.target.value), t('updated'))}
                      className="rounded-full border border-line bg-white px-2 py-1 text-xs font-semibold">
                      {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted">{fmtDate(tk.created_at)}</td>
                  <td className="px-4 py-3 text-right"><RowDelete onClick={() => run(() => api.adminDeleteTicket(tk.id), t('deleted'))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><EmptyState title={tickets.length ? t('noMatch') : t('noTickets')} action={<Button size="sm" onClick={onAdd}>＋ {t('add.tickets')}</Button>} /></div>
        )}
      </TableShell>
      )}
    </div>
  );
}

// ── Admins ─────────────────────────────────────────────────────
function AdminsTable({
  admins, me, run, reloadAdmins, onAdd,
}: { admins: Admin[] | null; me: AdminIdentity | null; run: Run; reloadAdmins: () => void; onAdd: () => void }) {
  const t = useTranslations('admin');
  const c = useTranslations('admin.cols');
  const fmtDateTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  if (admins === null) return <p className="py-10 text-center text-muted">…</p>;

  const isOwner = me?.role === 'owner';
  const activeCount = admins.filter((a) => a.active).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{t('adminsHint')}</p>
        <span className="text-xs text-muted">{admins.length}</span>
      </div>
      <TableShell>
        {admins.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs">
              <tr>
                {[c('name'), c('email'), c('role'), c('status'), c('lastLogin'), ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {admins.map((a) => {
                const self = a.id === me?.id;
                // Guards mirror the server: no self-disable, keep ≥1 active, owners protected.
                const canToggle = !self && !(a.active && activeCount <= 1);
                const canDelete = !self && admins.length > 1 && (a.role !== 'owner' || isOwner);
                return (
                  <tr key={a.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3 font-medium text-ink">
                      {a.name}
                      {self && <Badge tone="teal" className="ml-2">{t('you')}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-muted">{a.email}</td>
                    <td className="px-4 py-3"><Badge tone={a.role === 'owner' ? 'saffron' : 'neutral'}>{a.role}</Badge></td>
                    <td className="px-4 py-3">
                      <button
                        disabled={!canToggle}
                        onClick={() => run(() => api.adminUpdateAdmin(a.id, { active: !a.active }), t('updated'), reloadAdmins)}
                        className={cn('rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50',
                          a.active ? 'bg-teal/15 text-teal' : 'bg-ink/5 text-muted')}>
                        {a.active ? t('active') : t('disabled')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtDateTime(a.last_login_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {canDelete && <RowDelete onClick={() => run(() => api.adminDeleteAdmin(a.id), t('deleted'), reloadAdmins)} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><EmptyState title={t('noAdmins')} action={<Button size="sm" onClick={onAdd}>＋ {t('add.admins')}</Button>} /></div>
        )}
      </TableShell>
    </div>
  );
}

function AddAdminForm({ canSetRole, onDone }: { canSetRole: boolean; onDone: (i: { name: string; email: string; password: string; role?: string }) => void }) {
  const t = useTranslations('admin');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'admin' });
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
  const valid = f.name.trim() && emailOk && f.password.length >= 6;
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!valid) return; onDone({ name: f.name.trim(), email: f.email.trim(), password: f.password, role: canSetRole ? f.role : undefined }); }}>
      <FormField label={t('cols.name')} htmlFor="an" required><Input id="an" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus /></FormField>
      <FormField label={t('cols.email')} htmlFor="ae" required hint={!f.email || emailOk ? undefined : 'Enter a valid email'}>
        <Input id="ae" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" />
      </FormField>
      <FormField label={t('password')} htmlFor="ap" required hint={t('pwHint')}>
        <Input id="ap" type="password" value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
      </FormField>
      {canSetRole && (
        <FormField label={t('cols.role')} htmlFor="ar">
          <Select id="ar" value={f.role} onChange={(e) => set('role', e.target.value)}>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </Select>
        </FormField>
      )}
      <Button type="submit" disabled={!valid} className="w-full">{t('add.admins')}</Button>
    </form>
  );
}

function RowDelete({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} aria-label="Delete" className="rounded-full px-2 py-1 text-xs font-semibold text-rose hover:bg-rose/10">🗑</button>;
}

type SvcT = ReturnType<typeof useTranslations>;

function AddVendorForm({ svc, onDone }: { svc: SvcT; onDone: (i: any) => void }) {
  const [f, setF] = useState({ type: 'rooms' as ServiceType, name: '', area: '', capacity: '', price: '', kyc_status: 'verified', active: true, image_url: null as string | null });
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() && f.area.trim();
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!valid) return; onDone({ type: f.type, name: f.name.trim(), area: f.area.trim(), capacity: f.capacity ? Number(f.capacity) : undefined, price: f.price ? Number(f.price) : undefined, kyc_status: f.kyc_status, active: f.active, image_url: f.image_url || undefined }); }}>
      <FormField label="Service type" htmlFor="vt" required>
        <Select id="vt" value={f.type} onChange={(e) => set('type', e.target.value)}>
          {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{svc(`${s.slug}.name`)}</option>)}
        </Select>
      </FormField>
      <FormField label="Business name" htmlFor="vn" required><Input id="vn" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus /></FormField>
      <ImageUpload value={f.image_url} onChange={(url) => set('image_url', url)} label="Vendor image" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Area" htmlFor="va" required><Input id="va" value={f.area} onChange={(e) => set('area', e.target.value)} /></FormField>
        <FormField label="Capacity" htmlFor="vc"><Input id="vc" type="number" min={0} value={f.capacity} onChange={(e) => set('capacity', e.target.value)} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="From price (₹)" htmlFor="vp"><Input id="vp" type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} /></FormField>
        <FormField label="KYC" htmlFor="vk">
          <Select id="vk" value={f.kyc_status} onChange={(e) => set('kyc_status', e.target.value)}>
            <option value="verified">verified</option><option value="pending">pending</option><option value="rejected">rejected</option>
          </Select>
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-saffron" />
        Show live on the website now
      </label>
      <Button type="submit" disabled={!valid} className="w-full">Add vendor</Button>
    </form>
  );
}

function AddBookingForm({ svc, onDone }: { svc: SvcT; onDone: (i: any) => void }) {
  const [f, setF] = useState({ service_type: 'rooms' as ServiceType, name: '', phone: '', party_size: '2', start_date: '', area: '', amount: '', status: 'lead' });
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() && f.phone.trim();
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!valid) return; onDone({ service_type: f.service_type, name: f.name.trim(), phone: f.phone.trim(), party_size: f.party_size ? Number(f.party_size) : undefined, start_date: f.start_date || undefined, area: f.area || undefined, amount: f.amount ? Number(f.amount) : undefined, status: f.status }); }}>
      <FormField label="Service" htmlFor="bs" required>
        <Select id="bs" value={f.service_type} onChange={(e) => set('service_type', e.target.value)}>
          {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{svc(`${s.slug}.name`)}</option>)}
        </Select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name" htmlFor="bn" required><Input id="bn" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus /></FormField>
        <FormField label="Phone" htmlFor="bp" required><Input id="bp" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Party" htmlFor="bps"><Input id="bps" type="number" min={1} value={f.party_size} onChange={(e) => set('party_size', e.target.value)} /></FormField>
        <FormField label="Date" htmlFor="bd"><Input id="bd" type="date" value={f.start_date} onChange={(e) => set('start_date', e.target.value)} /></FormField>
        <FormField label="Amount ₹" htmlFor="bamt"><Input id="bamt" type="number" min={0} value={f.amount} onChange={(e) => set('amount', e.target.value)} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Area" htmlFor="bar"><Input id="bar" value={f.area} onChange={(e) => set('area', e.target.value)} /></FormField>
        <FormField label="Status" htmlFor="bst">
          <Select id="bst" value={f.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
      </div>
      <Button type="submit" disabled={!valid} className="w-full">Add booking</Button>
    </form>
  );
}

function AddTicketForm({ onDone }: { onDone: (cat: string, notes: string) => void }) {
  const [category, setCategory] = useState('medical');
  const [notes, setNotes] = useState('');
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onDone(category, notes.trim()); }}>
      <FormField label="Category" htmlFor="tc">
        <Select id="tc" value={category} onChange={(e) => setCategory(e.target.value)}>
          {['medical', 'police', 'lost', 'booking', 'payment', 'other'].map((x) => <option key={x} value={x}>{x}</option>)}
        </Select>
      </FormField>
      <FormField label="Notes" htmlFor="tn"><Input id="tn" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Short description" autoFocus /></FormField>
      <Button type="submit" className="w-full">Add ticket</Button>
    </form>
  );
}
