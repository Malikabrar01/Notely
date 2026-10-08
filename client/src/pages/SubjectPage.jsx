import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, FileText, BookOpen, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import { toneFor, initials } from "../utils/subjectStyle";

const SECTIONS = [
  { type: "syllabus", title: "Syllabus", icon: ClipboardList,
    empty: "No syllabus yet. Got the PDF? Add it so everyone knows what's coming." },
  { type: "notes", title: "Notes", icon: BookOpen,
    empty: "No notes yet. Yours could save someone's night before the exam." },
  { type: "paper", title: "Previous year papers", icon: FileText,
    empty: "No papers yet. Past papers are gold, share one if you have it." },
];

export default function SubjectPage() {
  const { name } = useParams();
  const [sp] = useSearchParams();
  const branch = sp.get("branch") || "";
  const semester = sp.get("semester") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const tone = toneFor(name);

  useEffect(() => {
    setLoading(true);
    api.get("/resources", { params: { subject: name, branch, semester } })
      .then((res) => setItems(res.data))
      .catch(() => toast.error("Could not load this subject"))
      .finally(() => setLoading(false));
  }, [name, branch, semester]);

  const addLink = (type) =>
    `/upload?${new URLSearchParams({ subject: name, type, branch, semester })}`;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/resources/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("File deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleReport = async (id) => {
    const reason = window.prompt("What's wrong with this file? (wrong subject, spam, inappropriate...)");
    if (reason === null) return;
    try {
      const res = await api.post(`/resources/${id}/report`, { reason });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not report");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4 space-y-8">
        <div className="pt-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-teal-700 transition">
            <ArrowLeft size={15} /> All subjects
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-extrabold ${tone.tile}`}>
              {initials(name)}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 leading-tight">{name}</h1>
              <p className="text-sm text-stone-500">
                {[branch, semester && `Semester ${semester}`].filter(Boolean).join(" · ") || "All branches and semesters"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-stone-200/60 animate-pulse" />)}
          </div>
        ) : (
          SECTIONS.map(({ type, title, icon: Icon, empty }) => {
            let list = items.filter((i) => i.type === type);
            if (type === "paper") list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));

            return (
              <section key={type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                    <Icon size={18} className="text-teal-600" /> {title}
                    <span className="text-sm font-medium text-stone-400">{list.length}</span>
                  </h2>
                  <Link to={addLink(type)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-lg px-2.5 py-1.5 transition">
                    <Plus size={15} /> Add
                  </Link>
                </div>

                {list.length === 0 ? (
                  <Link to={addLink(type)}
                        className="block bg-white/60 border border-dashed border-stone-300 rounded-2xl p-5 text-sm text-stone-500 hover:border-teal-400 hover:text-teal-700 transition">
                    {empty}
                  </Link>
                ) : (
                  <div className="space-y-2.5">
                    {list.map((item, i) => (
                      <ResourceCard key={item._id} item={item} index={i}
                                    onDelete={handleDelete} onReport={handleReport} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}