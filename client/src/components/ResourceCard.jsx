import { FileText, BookOpen, ClipboardList, ExternalLink, Trash2, Flag } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const META = {
  paper: { icon: FileText, tile: "bg-amber-100 text-amber-600", label: "Paper" },
  notes: { icon: BookOpen, tile: "bg-emerald-100 text-emerald-600", label: "Notes" },
  syllabus: { icon: ClipboardList, tile: "bg-sky-100 text-sky-600", label: "Syllabus" },
};

export default function ResourceCard({ item, index = 0, onDelete, onReport }) {
  const { user } = useAuth();
  const myId = user._id || user.id;
  const isOwner = String(item.uploadedBy?._id) === String(myId);
  const isStaff = ["moderator", "admin"].includes(user.role);
  const meta = META[item.type];
  const Icon = meta.icon;

  return (
    <div
      style={{ animationDelay: `${index * 40}ms` }}
      className="animate-fade-up group bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4
                 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-200"
    >
      <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${meta.tile}`}>
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 truncate">
          {item.subject}
          {item.year ? ` · ${item.year}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{item.branch}</span>
          <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">Sem {item.semester}</span>
          <span>
            by {item.uploadedBy?.name || "Unknown"} · {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isOwner && (
          <button
            onClick={() => onReport(item._id)}
            title="Report"
            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
          >
            <Flag size={18} />
          </button>
        )}
        {(isOwner || isStaff) && (
          <button
            onClick={() => onDelete(item._id)}
            title="Delete"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
          </button>
        )}
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium
                     rounded-lg px-3 py-2 hover:bg-indigo-700 active:scale-95 transition"
        >
          Open <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}