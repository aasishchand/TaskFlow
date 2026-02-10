'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

// ─── Query keys ───────────────────────────────────────────────────────
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// ─── Fetch tasks ──────────────────────────────────────────────────────
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.sort) params.set('sort', filters.sort);

      const { data } = await api.get<ApiResponse<PaginatedResponse<Task>>>(
        `/tasks?${params.toString()}`
      );
      return data.data!;
    },
  });
}

// ─── Create task ──────────────────────────────────────────────────────
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const { data } = await api.post<ApiResponse<{ task: Task }>>(
        '/tasks',
        taskData
      );
      return data.data!.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create task.'
      );
    },
  });
}

// ─── Update task ──────────────────────────────────────────────────────
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: taskData,
    }: {
      id: string;
      data: UpdateTaskData;
    }) => {
      const { data } = await api.put<ApiResponse<{ task: Task }>>(
        `/tasks/${id}`,
        taskData
      );
      return data.data!.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update task.'
      );
    },
  });
}

// ─── Delete task ──────────────────────────────────────────────────────
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete task.'
      );
    },
  });
}
