import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "Other"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Signup() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "", collegeId: "", branch: "", semester: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/colleges").then((res) => setColleges(res.data));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/auth/signup", { ...form, semester: Number(form.semester) });
      saveSession(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full border rounded-lg px-3 py-2 bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold text-indigo-600">Create your Notely account</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input name="name" placeholder="Full name" value={form.name} onChange={onChange} required className={field} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required className={field} />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={onChange} required minLength={6} className={field} />

        <select name="collegeId" value={form.collegeId} onChange={onChange} required className={field}>
          <option value="">Select your college</option>
          {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <div className="flex gap-3">
          <select name="branch" value={form.branch} onChange={onChange} required className={field}>
            <option value="">Branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select name="semester" value={form.semester} onChange={onChange} required className={field}>
            <option value="">Sem</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>

        <button disabled={busy}
          className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
          {busy ? "Creating..." : "Sign up"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}