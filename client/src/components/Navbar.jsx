import { Link } from "react-router-dom";
import { Plus, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const isStaff = ["moderator", "admin"].includes(user.role);

  return (
    <header className="sticky top-0 z-10 bg-[#faf7f2]/85 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center">n</span>
          <span className="text-lg font-extrabold text-stone-900 tracking-tight">notely</span>
        </Link>

        <div className="flex items-center gap-2">
          {isStaff && (
            <Link to="/moderation"
                  className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-teal-700 px-2 py-1.5 transition">
              <ShieldCheck size={16} /> <span className="hidden sm:inline">Moderation</span>
            </Link>
          )}
          <Link to="/upload"
                className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm font-semibold
                           rounded-xl px-3.5 py-2 hover:bg-teal-700 active:scale-95 transition">
            <Plus size={16} /> Share
          </Link>
          <div className="hidden sm:block text-right leading-tight ml-2">
            <p className="text-sm font-semibold text-stone-800">{user.name}</p>
            <p className="text-xs text-stone-400">{user.college?.name}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <button onClick={logout} title="Log out"
                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}