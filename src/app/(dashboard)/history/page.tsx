import { Link, Table } from "@heroui/react";

import { requireSession } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber, formatPercent, formatRupiah } from "@/lib/format";
import { db } from "@/prisma/db";

export default async function HistoryPage() {
  const session = await requireSession();

  const calculations = await db.orm.public.Calculation
    .where({ userId: session.userId })
    .orderBy((row) => row.createdAt.desc())
    .all();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            Riwayat perhitungan milik akun Anda saja.
          </p>
        </div>
        <Link
          className="brand-gradient inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-brand/25 hover:opacity-95 hover:no-underline"
          href="/"
        >
          + Perhitungan Baru
        </Link>
      </header>

      {calculations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Belum ada perhitungan tersimpan.</p>
          <Link
            className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
            href="/"
          >
            Mulai menghitung
          </Link>
        </div>
      ) : (
        <Table
          aria-label="Riwayat perhitungan"
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <Table.ScrollContainer>
            <Table.Content className="min-w-[800px]">
              <Table.Header>
                <Table.Column isRowHeader>Tanggal</Table.Column>
                <Table.Column className="text-end">Harga Produk</Table.Column>
                <Table.Column className="text-end">Pengeluaran</Table.Column>
                <Table.Column className="text-end">CPR</Table.Column>
                <Table.Column className="text-end">Results</Table.Column>
                <Table.Column className="text-end">Pendapatan</Table.Column>
                <Table.Column className="text-end">Keuntungan</Table.Column>
                <Table.Column className="text-end">ROI</Table.Column>
              </Table.Header>
              <Table.Body>
                {calculations.map((row) => (
                  <Table.Row key={row.id} id={row.id}>
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </Table.Cell>
                    <Table.Cell className="text-end">{formatRupiah(row.productPrice)}</Table.Cell>
                    <Table.Cell className="text-end">{formatRupiah(row.adSpend)}</Table.Cell>
                    <Table.Cell className="text-end">{formatRupiah(row.costPerResult)}</Table.Cell>
                    <Table.Cell className="text-end">{formatNumber(row.resultCount)}</Table.Cell>
                    <Table.Cell className="text-end">{formatRupiah(row.revenue)}</Table.Cell>
                    <Table.Cell
                      className={cn(
                        "text-end font-medium",
                        row.profit >= 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {formatRupiah(row.profit)}
                    </Table.Cell>
                    <Table.Cell
                      className={cn(
                        "text-end font-semibold",
                        row.roi >= 0 ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {formatPercent(row.roi)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}