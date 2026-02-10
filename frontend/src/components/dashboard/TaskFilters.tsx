'use client';

import { useEffect, useState } from 'react';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/utils/constants';
import type { TaskFilters as TFilters } from '@/types';

interface TaskFiltersProps {
  filters: TFilters;
  onChange: (filters: TFilters) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.search || '')) {
        onChange({ ...filters, search: search || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              status: (e.target.value as TFilters['status']) || undefined,
              page: 1,
            })
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {TASK_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              priority: (e.target.value as TFilters['priority']) || undefined,
              page: 1,
            })
          }
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Priorities</option>
          {TASK_PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
