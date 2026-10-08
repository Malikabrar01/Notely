import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { Field } from "../components/AuthLayout";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/login", form);
      saveSession(res.data);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not log in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your papers and notes">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field icon={Mail} name="email" type="email" placeholder="Email address"
               value={form.email} onChange={onChange} required />
        <Field icon={Lock} name="password" type="password" placeholder="Password"
               value={form.password} onChange={onChange} required />

        <button
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-2.5
                     font-semibold hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 transition"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-center text-gray-500">
          New to Notely?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}