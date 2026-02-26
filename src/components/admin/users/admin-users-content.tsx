import { UsersTable } from '@/components/admin/users/users-table';
import { getSortingStateParser } from '@/components/data-table/lib/parsers';
import { useUsers } from '@/hooks/use-users';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { startTransition, useEffect, useRef } from 'react';

const SORTABLE_IDS = ['name', 'email', 'createdAt'] as const;
const defaultSorting: SortingState = [{ id: 'createdAt', desc: true }];
const sortParser = getSortingStateParser([...SORTABLE_IDS]);

function normalizeSorting(value: SortingState): SortingState {
  const valid = value.filter((item) =>
    (SORTABLE_IDS as readonly string[]).includes(item.id)
  );
  return valid.length > 0 ? valid : defaultSorting;
}

function isSameSorting(a: SortingState, b: SortingState): boolean {
  return (
    a.length === b.length &&
    a.every((x, i) => x.id === b[i]?.id && x.desc === b[i]?.desc)
  );
}

function pickFilterValue(filters: ColumnFiltersState, id: string): string {
  const f = filters.find((x) => x.id === id);
  const v = Array.isArray(f?.value) ? f.value[0] : f?.value;
  return (v as string) ?? '';
}

/**
 * URL state via nuqs. Options:
 * - startTransition: batches URL updates in React transition to avoid double fetch when sort changes.
 * - history: 'replace' so Back button doesn't step through every filter/sort change.
 */
export function AdminUsersContent() {
  const [state, setQueryStates] = useQueryStates(
    {
      page: parseAsIndex.withDefault(0),
      size: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      sort: sortParser.withDefault(
        defaultSorting as Parameters<typeof sortParser.withDefault>[0]
      ),
      role: parseAsString.withDefault(''),
      status: parseAsString.withDefault(''),
    },
    { startTransition, history: 'replace' }
  );

  const { page, size, search, sort, role, status } = state;
  const sortFromUrl = normalizeSorting(sort as SortingState);

  // nuqs can briefly revert to default after setState; keep "last non-default" so we don't flip back.
  const lastNonDefaultSortRef = useRef<SortingState | null>(null);
  if (!isSameSorting(sortFromUrl, defaultSorting)) {
    lastNonDefaultSortRef.current = sortFromUrl;
  }
  const effectiveSort = lastNonDefaultSortRef.current ?? sortFromUrl;

  // API expects { id, value: string }; TanStack Table expects value: string[] for filters.
  const clientFilters = [
    role && { id: 'role', value: role },
    status && { id: 'status', value: status },
  ].filter(Boolean) as Array<{ id: string; value: string }>;
  const serverFilters: ColumnFiltersState = clientFilters.map((f) => ({
    id: f.id,
    value: [f.value],
  }));

  const prevFiltersRef = useRef({ role, status });
  useEffect(() => {
    if (
      prevFiltersRef.current.role === role &&
      prevFiltersRef.current.status === status
    )
      return;
    prevFiltersRef.current = { role, status };
    void setQueryStates({ page: 0 });
  }, [role, status, setQueryStates]);

  const { data, isLoading } = useUsers(
    page,
    size,
    search,
    effectiveSort,
    clientFilters
  );

  return (
    <UsersTable
      data={data?.items ?? []}
      total={data?.total ?? 0}
      pageIndex={page}
      pageSize={size}
      search={search}
      sorting={effectiveSort}
      filters={serverFilters}
      loading={isLoading}
      onSearch={(newSearch) => setQueryStates({ search: newSearch, page: 0 })}
      onPageChange={(newPage) => setQueryStates({ page: newPage })}
      onPageSizeChange={(newSize) => setQueryStates({ size: newSize, page: 0 })}
      onSortingChange={(newSorting) => {
        const next = normalizeSorting(newSorting);
        lastNonDefaultSortRef.current = next;
        void setQueryStates({
          sort: next as typeof sort,
          page: 0,
        });
      }}
      onFiltersChange={(nextFilters) =>
        void setQueryStates({
          role: pickFilterValue(nextFilters, 'role'),
          status: pickFilterValue(nextFilters, 'status'),
          page: 0,
        })
      }
    />
  );
}
