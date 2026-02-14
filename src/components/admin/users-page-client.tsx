'use client';

import { UsersTable } from '@/components/admin/users-table';
import { getSortingStateParser } from '@/components/data-table/lib/parsers';
import { useUsers } from '@/hooks/use-users';
import type { SortingItem } from '@/components/data-table/lib/parsers';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';

const SORTABLE_IDS: string[] = ['name', 'email', 'createdAt'];
const defaultSort: SortingItem[] = [{ id: 'createdAt', desc: true }];

export function UsersPageClient() {
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsIndex.withDefault(0),
    size: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: getSortingStateParser(SORTABLE_IDS).withDefault(defaultSort),
  });

  const sortFirst = queryState.sort[0];
  const sortId = sortFirst?.id ?? 'createdAt';
  const sortDesc = sortFirst?.desc ?? true;

  const { data, isLoading } = useUsers(
    queryState.page,
    queryState.size,
    queryState.search,
    sortId,
    sortDesc
  );

  const safeSort = (next: SortingItem[]) => {
    const filtered = next.filter((item) => SORTABLE_IDS.includes(item.id));
    return filtered.length > 0 ? filtered : defaultSort;
  };

  return (
    <UsersTable
      data={data?.items ?? []}
      total={data?.total ?? 0}
      pageIndex={queryState.page}
      pageSize={queryState.size}
      search={queryState.search}
      sortId={sortId}
      sortDesc={sortDesc}
      loading={isLoading}
      onSearch={(search) => setQueryState({ search, page: 0 })}
      onPageChange={(page) => setQueryState({ page })}
      onPageSizeChange={(size) => setQueryState({ size, page: 0 })}
      onSortChange={(id, desc) => {
        setQueryState({ sort: safeSort([{ id, desc }]), page: 0 });
      }}
    />
  );
}
