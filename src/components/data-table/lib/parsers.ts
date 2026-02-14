import { createParser } from 'nuqs';
import { z } from 'zod';

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export interface SortingItem {
  id: string;
  desc: boolean;
}

export function getSortingStateParser(columnIds?: string[] | Set<string>) {
  const validKeys =
    columnIds instanceof Set
      ? columnIds
      : columnIds
        ? new Set(columnIds)
        : null;

  return createParser({
    parse: (value: string): SortingItem[] | null => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);
        if (!result.success) return null;
        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }
        return result.data;
      } catch {
        return null;
      }
    },
    serialize: (value: SortingItem[]) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every((item, i) => item.id === b[i]?.id && item.desc === b[i]?.desc),
  });
}
