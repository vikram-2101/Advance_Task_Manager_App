// src/components/TaskCard.jsx
import { Trash2, Edit2, Share2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

export function TaskCard({ task, onEdit, onDelete, onShare, isOwner = true }) {
  const priorityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const statusColor = {
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    done: "bg-green-100 text-green-800",
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={clsx(
                "text-xs px-2 py-1 rounded-full",
                priorityColor[task.priority],
              )}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span
              className={clsx(
                "text-xs px-2 py-1 rounded-full",
                statusColor[task.status],
              )}
            >
              {task.status.replace("_", " ").toUpperCase()}
            </span>

            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            {task.dueDate && (
              <div
                className={clsx(
                  "flex items-center gap-1",
                  isOverdue && "text-red-600",
                )}
              >
                {isOverdue && <AlertCircle size={16} />}
                <Clock size={16} />
                <span>
                  {formatDistanceToNow(new Date(task.dueDate), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
            {task.sharedWith && task.sharedWith.length > 0 && (
              <span className="text-blue-600">
                Shared with {task.sharedWith.length} user(s)
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit task"
          >
            <Edit2 size={18} />
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => onShare(task)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Share task"
              >
                <Share2 size={18} />
              </button>

              <button
                onClick={() => onDelete(task._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
