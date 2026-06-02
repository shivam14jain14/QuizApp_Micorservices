import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows</span>
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-2"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {[6, 8, 12, 20].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-600">Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-9 px-3" onClick={() => onPageChange(page - 1)} disabled={page <= 1} icon={<ChevronLeft className="h-4 w-4" />}>
            Prev
          </Button>
          <Button variant="secondary" className="h-9 px-3" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} icon={<ChevronRight className="h-4 w-4" />}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
