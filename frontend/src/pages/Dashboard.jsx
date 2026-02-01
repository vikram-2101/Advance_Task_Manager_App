// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar.jsx";
import { TaskCard } from "../components/TaskCard.jsx";
import { TaskForm } from "../components/TaskForm.jsx";
import { taskApi } from "../api/taskApi.js";
import { taskStore } from "../store/taskStore.js";

export function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    tasks,
    filters,
    page,
    limit,
    total,
    setTasks,
    setFilters,
    setPagination,
    setTotal,
    removeTask,
  } = taskStore();

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskApi.getTasks({
        page,
        limit,
        ...filters,
      });

      setTasks(response.data.data.data);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      toast.error("Failed to fetch tasks");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data) => {
    try {
      const response = await taskApi.createTask(data);
      setTasks([response.data.data.task, ...tasks]);
      setShowForm(false);
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (data) => {
    try {
      const response = await taskApi.updateTask(editingTask._id, data);
      setTasks(
        tasks.map((t) =>
          t._id === editingTask._id ? response.data.data.task : t,
        ),
      );
      setEditingTask(null);
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      removeTask(taskId);
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and organize your tasks</p>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Task</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TaskForm onSubmit={handleCreateTask} />
          </div>
        )}

        {/* Edit Form */}
        {editingTask && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Task</h2>
              <button
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TaskForm initialTask={editingTask} onSubmit={handleUpdateTask} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <Filter size={20} />
            Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ status: e.target.value || null })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={filters.priority || ""}
                onChange={(e) =>
                  setFilters({ priority: e.target.value || null })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              No tasks found
            </h3>
            <p className="text-gray-600 mt-2">
              Create a new task to get started
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  onShare={() => {
                    /* Implement share functionality */
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(total / limit) > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPagination(Math.max(1, page - 1), limit)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() =>
                    setPagination(
                      Math.min(Math.ceil(total / limit), page + 1),
                      limit,
                    )
                  }
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
