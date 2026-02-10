'use client';

import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import type { Task, TaskFilters as TFilters } from '@/types';
import type { TaskFormData } from '@/utils/validation';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import Button from '@/components/ui/Button';

export default function TaskList() {
  const [filters, setFilters] = useState<TFilters>({
    page: 1,
    limit: 10,
    sort: '-createdAt',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreateOrUpdate = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, data: formData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingTask(null);
          },
        }
      );
    } else {
      createTask.mutate(formData, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteTask.mutate(deletingId, {
        onSuccess: () => setDeletingId(null),
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.pagination.total ?? 0} total tasks
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="mt-3 sm:mt-0"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load tasks. Please try again.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setFilters({ ...filters })}
          >
            Retry
          </Button>
        </div>
      ) : data?.tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new task.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            Create your first task
          </Button>
        </div>
      ) : (
        <>
          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={!data.pagination.hasPrevPage}
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) - 1 })
                }
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!data.pagination.hasNextPage}
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) + 1 })
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
        isLoading={createTask.isPending || updateTask.isPending}
      />

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                isLoading={deleteTask.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
