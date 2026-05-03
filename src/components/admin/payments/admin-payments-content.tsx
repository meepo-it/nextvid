import { listAllPayments } from '@/api/admin-payments';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/shared/user-avatar';
import { formatDate, formatPrice } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { findPlanByPriceId } from '@/lib/price-plan';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { IconCheck, IconClock, IconX, IconRefresh } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useTransition } from 'react';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';

type PaymentRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  userImage: string | null;
  priceId: string;
  customerId: string;
  type: string | null;
  scene: string | null;
  interval: string | null;
  status: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  active:
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  completed:
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  canceled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  past_due:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  incomplete: 'bg-muted text-muted-foreground',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent px-1.5 capitalize',
        STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {status === 'active' || status === 'completed' ? (
        <IconCheck className="size-3" />
      ) : null}
      {status === 'canceled' ? <IconX className="size-3" /> : null}
      {status === 'trialing' ? <IconClock className="size-3" /> : null}
      {status === 'past_due' ? <IconRefresh className="size-3" /> : null}
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <TableRow className="h-14">
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className="py-3">
          <Skeleton className="h-5 w-24" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function AdminPaymentsContent() {
  const [, startTransition] = useTransition();
  const [state, setQueryStates] = useQueryStates(
    {
      page: parseAsIndex.withDefault(0),
      size: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      type: parseAsString.withDefault(''),
    },
    { startTransition, history: 'replace' }
  );

  const { page, size, search, status, type } = state;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, size, search, status, type],
    queryFn: () =>
      listAllPayments({
        data: {
          pageIndex: page,
          pageSize: size,
          search,
          sortDesc: true,
          status: status || undefined,
          type: type || undefined,
        },
      }),
  });

  const [columnVisibility, setColumnVisibility] = useState({});

  const columns: ColumnDef<PaymentRow>[] = useMemo(
    () => [
      {
        id: 'user',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="User" />
        ),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              <UserAvatar
                name={r.userName ?? null}
                image={r.userImage ?? null}
                className="size-8 border shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {r.userName ?? '-'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.userEmail}
                </p>
              </div>
            </div>
          );
        },
        minSize: 180,
        size: 220,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'plan',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Plan" />
        ),
        cell: ({ row }) => {
          const plan = findPlanByPriceId(row.original.priceId);
          return (
            <span className="text-sm">
              {plan ? (plan.name ?? plan.id) : row.original.priceId || '-'}
              {row.original.interval ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  / {row.original.interval}
                </span>
              ) : null}
            </span>
          );
        },
        minSize: 120,
        size: 150,
        enableSorting: false,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Type" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="border-transparent bg-secondary text-secondary-foreground capitalize text-xs"
          >
            {row.original.type?.replace(/_/g, ' ') ?? '-'}
          </Badge>
        ),
        minSize: 100,
        size: 130,
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        minSize: 110,
        size: 130,
        enableSorting: false,
      },
      {
        id: 'periodEnd',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Renews / Expires" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.periodEnd
              ? formatDate(new Date(row.original.periodEnd))
              : '-'}
          </span>
        ),
        minSize: 130,
        size: 150,
        enableSorting: false,
      },
      {
        id: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Date" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(new Date(row.original.createdAt))}
          </span>
        ),
        minSize: 110,
        size: 130,
        enableSorting: false,
      },
    ],
    []
  );

  const serverFilters: ColumnFiltersState = useMemo(
    () => [
      ...(status ? [{ id: 'status', value: [status] }] : []),
      ...(type ? [{ id: 'type', value: [type] }] : []),
    ],
    [status, type]
  );

  const table = useReactTable({
    data: (data?.items ?? []) as PaymentRow[],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / size) || 1,
    state: {
      columnFilters: serverFilters,
      columnVisibility,
      pagination: { pageIndex: page, pageSize: size },
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(serverFilters) : updater;
      const getValue = (id: string) => {
        const f = next.find((x) => x.id === id);
        return Array.isArray(f?.value)
          ? (f.value[0] as string)
          : ((f?.value as string) ?? '');
      };
      void setQueryStates({
        status: getValue('status'),
        type: getValue('type'),
        page: 0,
      });
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page, pageSize: size })
          : updater;
      if (next.pageSize !== size) {
        void setQueryStates({ size: next.pageSize, page: 0 });
      } else if (next.pageIndex !== page) {
        void setQueryStates({ page: next.pageIndex });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const typeOptions = [
    { label: 'Subscription', value: 'subscription' },
    { label: 'One-time', value: 'one_time' },
  ];
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Trialing', value: 'trialing' },
    { label: 'Canceled', value: 'canceled' },
    { label: 'Past due', value: 'past_due' },
  ];

  return (
    <div className="w-full space-y-4">
      <DataTableAdvancedToolbar table={table}>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search user..."
              value={search}
              onChange={(e) =>
                void setQueryStates({ search: e.target.value, page: 0 })
              }
              className="h-8 w-[220px] pr-8"
            />
            {search && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => void setQueryStates({ search: '', page: 0 })}
              >
                <IconX className="size-3.5" />
              </button>
            )}
          </div>
          <DataTableFacetedFilter
            column={table.getColumn('type')}
            title="Type"
            options={typeOptions}
          />
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statusOptions}
          />
        </div>
      </DataTableAdvancedToolbar>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: size }).map((_, i) => (
                <RowSkeleton key={i} cols={columns.length} />
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="h-14">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No payment records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="px-0" />
    </div>
  );
}
