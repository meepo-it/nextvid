import { listAllGenerations, listGenerationModels } from '@/api/admin-generations';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
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
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useTransition } from 'react';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { IconX } from '@tabler/icons-react';
import { GenerationDetailDialog } from './generation-detail-dialog';

type GenerationRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  type: string;
  provider: string;
  model: string;
  providerModel: string;
  prompt: string | null;
  negativePrompt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaUrls: string | null;
  resolution: string;
  duration: number;
  aspectRatio: string;
  status: string;
  outputVideoUrl: string | null;
  outputDuration: number | null;
  creditsUsed: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  running: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  'text-to-video': 'T2V',
  'image-to-video': 'I2V',
  'reference-to-video': 'Ref',
  'video-edit': 'Edit',
};

const TYPE_COLORS: Record<string, string> = {
  'text-to-video': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
  'image-to-video': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  'reference-to-video': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  'video-edit': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
};

function parseMediaUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function InputThumbs({ row }: { row: GenerationRow }) {
  const srcs: { src: string; isVideo: boolean }[] = [];
  if (row.imageUrl) srcs.push({ src: row.imageUrl, isVideo: false });
  if (row.videoUrl) srcs.push({ src: row.videoUrl, isVideo: true });
  const extras = parseMediaUrls(row.mediaUrls);
  for (const url of extras) {
    const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
    srcs.push({ src: url, isVideo });
  }

  if (srcs.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex gap-1.5">
      {srcs.slice(0, 3).map((item, i) => (
        <div
          key={i}
          className="size-14 shrink-0 overflow-hidden rounded border bg-muted"
        >
          {item.isVideo ? (
            <video
              src={item.src}
              className="h-full w-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <img src={item.src} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
      {srcs.length > 3 && (
        <div className="size-14 shrink-0 rounded border bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">+{srcs.length - 3}</span>
        </div>
      )}
    </div>
  );
}

function OutputThumb({ url }: { url: string | null }) {
  if (!url) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="size-14 overflow-hidden rounded border bg-black">
      <video
        src={url}
        className="h-full w-full object-cover"
        muted
        preload="metadata"
      />
    </div>
  );
}

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <TableRow className="h-[72px]">
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className="py-3">
          <Skeleton className="h-5 w-20" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function AdminGenerationsContent() {
  const [, startTransition] = useTransition();
  const [state, setQueryStates] = useQueryStates(
    {
      page: parseAsIndex.withDefault(0),
      size: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
      model: parseAsString.withDefault(''),
    },
    { startTransition, history: 'replace' }
  );

  const { page, size, search, status, model } = state;
  const [selectedRow, setSelectedRow] = useState<GenerationRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-generations', page, size, search, status, model],
    queryFn: () =>
      listAllGenerations({
        data: {
          pageIndex: page,
          pageSize: size,
          search,
          status: status || undefined,
          model: model || undefined,
        },
      }),
  });

  const { data: modelOptions } = useQuery({
    queryKey: ['admin-generation-models'],
    queryFn: () => listGenerationModels(),
    staleTime: 60_000,
  });

  const [columnVisibility, setColumnVisibility] = useState({});

  const columns: ColumnDef<GenerationRow>[] = useMemo(
    () => [
      {
        id: 'input',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Input" />
        ),
        cell: ({ row }) => <InputThumbs row={row.original} />,
        minSize: 100,
        size: 130,
        enableSorting: false,
      },
      {
        id: 'output',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Output" />
        ),
        cell: ({ row }) => <OutputThumb url={row.original.outputVideoUrl} />,
        minSize: 70,
        size: 80,
        enableSorting: false,
      },
      {
        id: 'user',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="User" />
        ),
        cell: ({ row }) => {
          const r = row.original;
          const email = r.userEmail ?? '';
          return (
            <button
              type="button"
              className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                void setQueryStates({ search: email, page: 0 });
              }}
              title={`Filter by ${email}`}
            >
              <UserAvatar
                name={r.userName ?? null}
                image={r.userImage ?? null}
                className="size-8 border shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.userName ?? '-'}</p>
                <p className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline">
                  {email || '-'}
                </p>
              </div>
            </button>
          );
        },
        minSize: 160,
        size: 200,
        enableSorting: false,
        enableHiding: false,
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
            className={cn(
              'border-transparent text-xs font-semibold',
              TYPE_COLORS[row.original.type] ?? 'bg-secondary text-secondary-foreground'
            )}
          >
            {TYPE_LABELS[row.original.type] ?? row.original.type}
          </Badge>
        ),
        minSize: 70,
        size: 80,
        enableSorting: false,
      },
      {
        id: 'model',
        accessorKey: 'model',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Model" />
        ),
        cell: ({ row }) => (
          <span className="text-xs font-mono">{row.original.model}</span>
        ),
        minSize: 100,
        size: 120,
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              'border-transparent capitalize text-xs',
              STATUS_STYLES[row.original.status] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {row.original.status}
          </Badge>
        ),
        minSize: 90,
        size: 110,
        enableSorting: false,
      },
      {
        id: 'credits',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Credits" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.creditsUsed}</span>
        ),
        minSize: 70,
        size: 80,
        enableSorting: false,
      },
      {
        id: 'duration',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Duration" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.outputDuration != null
              ? `${row.original.outputDuration}s`
              : `${row.original.duration}s`}
          </span>
        ),
        minSize: 80,
        size: 90,
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
    [setQueryStates]
  );

  const serverFilters: ColumnFiltersState = useMemo(
    () => [
      ...(status ? [{ id: 'status', value: [status] }] : []),
      ...(model ? [{ id: 'model', value: [model] }] : []),
    ],
    [status, model]
  );

  const table = useReactTable({
    data: (data?.items ?? []) as GenerationRow[],
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
        model: getValue('model'),
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

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Running', value: 'running' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];

  const modelFilterOptions = useMemo(
    () => (modelOptions ?? []).map((m) => ({ label: m, value: m })),
    [modelOptions]
  );

  return (
    <>
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
                className="h-9 w-[260px] pr-8"
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
              column={table.getColumn('status')}
              title="Status"
              options={statusOptions}
              buttonClassName="h-9"
            />
            {modelFilterOptions.length > 0 && (
              <DataTableFacetedFilter
                column={table.getColumn('model')}
                title="Model"
                options={modelFilterOptions}
                buttonClassName="h-9"
              />
            )}
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
                  <TableRow
                    key={row.id}
                    className="h-[72px] cursor-pointer"
                    onClick={() => {
                      setSelectedRow(row.original);
                      setDialogOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                    No generation records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} className="px-0" />
      </div>

      <GenerationDetailDialog
        generation={selectedRow}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
