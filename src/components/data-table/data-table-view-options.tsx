'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Table } from '@tanstack/react-table';
import { IconCheck, IconSettings2 } from '@tabler/icons-react';
import * as React from 'react';
import { messages } from '@/config/messages';

const t = messages.common.table;

interface DataTableViewOptionsProps<TData>
  extends React.ComponentProps<typeof DropdownMenuContent> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
  ...props
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== 'undefined' && column.getCanHide()
        ),
    [table]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            aria-label={t.viewOptions}
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 font-normal lg:flex"
          >
            <IconSettings2 className="text-muted-foreground" />
            {t.viewOptions}
          </Button>
        }
      />
      <DropdownMenuContent className="w-44" align="end" {...props}>
        <DropdownMenuLabel>{t.viewOptions}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(checked) => column.toggleVisibility(checked)}
          >
            <span className="truncate">
              {(column.columnDef.meta as { label?: string } | undefined)
                ?.label ?? column.id}
            </span>
            <IconCheck
              className={cn(
                'ml-auto size-4 shrink-0',
                column.getIsVisible() ? 'opacity-100' : 'opacity-0'
              )}
            />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
