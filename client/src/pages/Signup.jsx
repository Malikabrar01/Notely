import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, School, MapPin, GraduationCap, Layers, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { Field, SelectField } from "../components/AuthLayout";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "Other"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const NEW = "__new__";

export default function Signup() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "", collegeId: "",
    collegeName: "", collegeCity: "", branch: "", semester: "",
  });
  const [busy, setBusy] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/colleges")
      .then((res) => setColleges(res.data))
      .catch(() => toast.error("Could not load colleges"));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const adding = form.collegeId === NEW;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        branch: form.branch,
        semester: Number(form.semester),
        ...(adding
          ? { newCollege: { name: form.collegeName, city: form.collegeCity } }
          : { collegeId: form.collegeId }),
      };
      const res = await api.post("/auth/signup", payload);
      saveSession(res.data);
      toast.success(
        res.data.user.role === "moderator"
          ? "You're the first from your college here, so you're its moderator. Welcome!"
          : "Account created. Welcome to Notely!"
      );
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not sign up");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join your college on Notely in a minute">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field icon={User} name="name" placeholder="Full name"
               value={form.name} onChange={onChange} required />
        <Field icon={Mail} name="email" type="email" placeholder="Email address"
               value={form.email} onChange={onChange} required />
        <Field icon={Lock} name="password" type="password" placeholder="Password (min 6 characters)"
               value={form.password} onChange={onChange} required minLength={6} />

        <SelectField icon={School} name="collegeId" value={form.collegeId} onChange={onChange} required>
          <option value="">Select your college</option>
          {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          <option value={NEW}>+ My college isn't listed</option>
        </SelectField>

        {adding && (
          <div className="space-y-3 rounded-2xl bg-teal-50 border border-teal-100 p-3 animate-fade-up">
            <p className="text-xs text-teal-800">
              You'll be the first from your college. Add its full name and your classmates can join it.
            </p>
            <Field icon={School} name="collegeName" placeholder="Full college / university name"
                   value={form.collegeName} onChange={onChange} required minLength={3} maxLength={100} />
            <Field icon={MapPin} name="collegeCity" placeholder="City (optional)"
                   value={form.collegeCity} onChange={onChange} maxLength={60} />
          </div>
        )}

        <div className="flex gap-3">
          <SelectField icon={GraduationCap} name="branch" value={form.branch} onChange={onChange} required>
            <option value="">Branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </SelectField>
          <SelectField icon={Layers} name="semester" value={form.semester} onChange={onChange} required>
            <option value="">Sem</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Sem {s}</option>)}
          </SelectField>
        </div>

        <button
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white rounded-xl py-2.5
                     font-semibold hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 transition"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}