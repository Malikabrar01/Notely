import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "Other"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const HINTS = {
  paper: "e.g. End Sem 2024",
  notes: "e.g. Unit 3 – Normalization",
  syllabus: "e.g. 2025 scheme",
};

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({
    type: sp.get("type") || "paper",
    title: "",
    subject: sp.get("subject") || "",
    year: "",
    branch: sp.get("branch") || user.branch,
    semester: sp.get("semester") || String(user.semester),
  });
  const [file, setFile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/resources/subjects", { params: { branch: form.branch, semester: form.semester } })
      .then((res) => setSubjects(res.data.map((s) => s.name)))
      .catch(() => {});
  }, [form.branch, form.semester]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please choose a file");
    if (file.size > 10 * 1024 * 1024) return toast.error("File must be under 10 MB");

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v && data.append(k, k === "subject" ? v.trim() : v));
    data.append("file", file);

    setBusy(true);
    try {
      await api.post("/resources", data);
      toast.success("Shared! Thanks for helping your class.");
      const p = new URLSearchParams({ branch: form.branch, semester: form.semester });
      navigate(`/subject/${encodeURIComponent(form.subject.trim())}?${p}`);
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.error ? `${d.message}: ${d.error}` : d?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full border border-stone-200 rounded-xl px-3.5 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition";
  const label = "block text-sm font-semibold text-stone-700 mb-1.5";

  return (
    <div className="min-h-screen">
      <Navbar />
      <form onSubmit={onSubmit}
            className="animate-fade-up max-w-lg mx-auto my-6 bg-white p-7 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Share with your class</h1>
          <p className="text-sm text-stone-500">Takes a minute, helps everyone.</p>
        </div>

        <div>
          <span className={label}>What are you sharing?</span>
          <div className="grid grid-cols-3 gap-2">
            {[["paper", "Paper"], ["notes", "Notes"], ["syllabus", "Syllabus"]].map(([v, l]) => (
              <button type="button" key={v} onClick={() => setForm({ ...form, type: v })}
                      className={`rounded-xl py-2.5 text-sm font-semibold border transition ${
                        form.type === v
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-stone-600 border-stone-200 hover:border-teal-300"
                      }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Subject</label>
          <input name="subject" list="subject-list" value={form.subject} onChange={onChange}
                 placeholder="e.g. Data Structures" required className={field} />
          <datalist id="subject-list">
            {subjects.map((s) => <option key={s} value={s} />)}
          </datalist>
          <p className="text-xs text-stone-400 mt-1">Pick an existing subject so everything stays together.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={form.type === "paper" ? "" : "col-span-2"}>
            <label className={label}>Title</label>
            <input name="title" value={form.title} onChange={onChange}
                   placeholder={HINTS[form.type]} required className={field} />
          </div>
          {form.type === "paper" && (
            <div>
              <label className={label}>Exam year</label>
              <input name="year" type="number" value={form.year} onChange={onChange}
                     placeholder="2024" className={field} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Branch</label>
            <select name="branch" value={form.branch} onChange={onChange} className={field}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Semester</label>
            <select name="semester" value={form.semester} onChange={onChange} className={field}>
              {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>File</label>
          <label className="flex items-center gap-3 border-2 border-dashed border-stone-300 rounded-xl p-4 cursor-pointer
                            hover:border-teal-400 hover:bg-teal-50/40 transition">
            <Paperclip size={18} className="text-teal-600 shrink-0" />
            <span className="text-sm text-stone-600 truncate">
              {file ? file.name : "Choose a PDF, JPG or PNG (up to 10 MB)"}
            </span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                   onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>

        <button disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl py-3
                           font-semibold hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 transition">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Uploading..." : "Share it"}
        </button>
        <Link to="/" className="block text-center text-sm text-stone-400 hover:text-stone-600">Cancel</Link>
      </form>
    </div>
  );
}