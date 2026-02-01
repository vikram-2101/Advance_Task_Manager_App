// src/store/taskStore.js
import { create } from "zustand";

export const taskStore = create((set) => ({
  tasks: [],
  filters: {
    status: null,
    priority: null,
    search: "",
    tags: [],
  },
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
  total: 0,

  setTasks: (tasks) => set({ tasks }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1, // Reset to first page when filters change
    })),

  setSortBy: (sortBy, sortOrder = "desc") =>
    set({ sortBy, sortOrder, page: 1 }),

  setPagination: (page, limit) => set({ page, limit }),

  setTotal: (total) => set({ total }),

  resetFilters: () =>
    set({
      filters: {
        status: null,
        priority: null,
        search: "",
        tags: [],
      },
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
      total: state.total + 1,
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
      total: state.total - 1,
    })),
}));

export default taskStore;
