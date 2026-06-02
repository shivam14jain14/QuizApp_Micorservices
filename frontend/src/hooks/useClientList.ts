import { useMemo, useState } from 'react';
import { pageCount, paginate } from '../utils/pagination';

export function useClientList<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  initialPageSize = 8
) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    return items.filter((item) => filterFn(item, query.trim().toLowerCase()));
  }, [items, filterFn, query]);

  const totalPages = pageCount(filtered.length, pageSize);
  const currentPage = Math.min(page, totalPages);
  const paged = paginate(filtered, currentPage, pageSize);

  return {
    query,
    setQuery: (value: string) => {
      setPage(1);
      setQuery(value);
    },
    page: currentPage,
    setPage,
    pageSize,
    setPageSize: (value: number) => {
      setPage(1);
      setPageSize(value);
    },
    totalPages,
    filtered,
    paged
  };
}
