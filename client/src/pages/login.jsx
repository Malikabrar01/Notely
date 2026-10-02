import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/auth/login", form);
      saveSession(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold text-indigo-600">Notely</h1>
        <p className="text-gray-500 text-sm">Log in to see your papers and notes</p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={onChange} required
          className="w-full border rounded-lg px-3 py-2" />
        <input name="password" type="password" placeholder="Password" value={form.password}
          onChange={onChange} required
          className="w-full border rounded-lg px-3 py-2" />

        <button disabled={busy}
          className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-center text-gray-500">
          New here? <Link to="/signup" className="text-indigo-600 font-medium">Create account</Link>
        </p>
      </form>
    </div>
  );
}