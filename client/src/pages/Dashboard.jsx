import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, BookOpen, ClipboardList, Inbox, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toneFor, initials } from "../utils/subjectStyle";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "Other"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Pill({ icon: Icon, n, label, warn }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
      n === 0
        ? warn ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-400"
        : "bg-stone-100 text-stone-700"
    }`}>
      <Icon size={12} /> {n === 0 && warn ? `no ${label}` : `${n} ${label}`}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [branch, setBranch] = useState(user.branch);
  const [semester, setSemester] = useState(String(user.semester));
  const [q, setQ] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  api.get("/resources/subjects", { params: { branch, semester } })
    .then((res) => setSubjects(res.data))
    .catch((err) => {
      console.error("SUBJECTS FAILED:", err.response?.status, err.response?.data || err.message);
      const d = err.response?.data;
      toast.error(
        `${err.response?.status || "No response"}: ${d?.error || d?.message || err.message}`
      );
    })
    .finally(() => setLoading(false));
}, [branch, semester]);
  const shown = subjects.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  const linkFor = (name) => {
    const p = new URLSearchParams();
    if (branch) p.set("branch", branch);
    if (semester) p.set("semester", semester);
    return `/subject/${encodeURIComponent(name)}?${p}`;
  };

  const select =
    "border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <section className="pt-4">
          <h1 className="text-3xl font-extrabold text-stone-900">
            {greeting()}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-stone-500 mt-1">
            Here's everything your class has shared for {branch || "all branches"},{" "}
            {semester ? `semester ${semester}` : "all semesters"}.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a subject..."
                   className={`${select} w-full pl-9`} />
          </div>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={select}>
            <option value="">All branches</option>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className={select}>
            <option value="">All sems</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          <button onClick={() => { setBranch(user.branch); setSemester(String(user.semester)); setQ(""); }}
                  title="Back to my branch and sem"
                  className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-400 hover:text-stone-700 transition">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-3xl bg-stone-200/60 animate-pulse" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-3xl p-12 text-center">
            <Inbox size={40} className="mx-auto text-stone-300" />
            <p className="mt-3 font-bold text-stone-800">Nothing here yet</p>
            <p className="text-sm text-stone-500 max-w-xs mx-auto">
              Nobody has shared anything for this semester. Be the one who starts it, your classmates will thank you.
            </p>
            <Link to="/upload"
                  className="inline-flex items-center gap-1.5 mt-5 bg-teal-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-teal-700 transition">
              <Plus size={16} /> Share the first file
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s, i) => {
              const tone = toneFor(s.name);
              return (
                <Link key={s._id} to={linkFor(s.name)}
                      style={{ animationDelay: `${i * 50}ms` }}
                      className="animate-fade-up group relative overflow-hidden bg-white rounded-3xl border border-stone-200 p-5
                                 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/40">
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone.bar}`} />
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-extrabold ${tone.tile}`}>
                    {initials(s.name)}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-stone-900 leading-snug group-hover:text-teal-700 transition">
                    {s.name}
                  </h3>
                  <p className="text-xs text-stone-400">{s.total} {s.total === 1 ? "file" : "files"} in total</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill icon={ClipboardList} n={s.syllabus} label="syllabus" warn />
                    <Pill icon={BookOpen} n={s.notes} label="notes" />
                    <Pill icon={FileText} n={s.papers} label="papers" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}