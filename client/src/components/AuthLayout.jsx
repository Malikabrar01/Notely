import { useState } from "react";
import { Eye, EyeOff, FileText, BookOpen, ClipboardList } from "lucide-react";

const POINTS = [
  { icon: FileText, text: "Previous year papers for your exact semester" },
  { icon: BookOpen, text: "Notes shared by seniors and classmates" },
  { icon: ClipboardList, text: "Syllabus in one place, per branch" },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-900 text-white p-12">
        <h1 className="text-3xl font-bold tracking-tight">Notely</h1>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Study smarter,<br />together.
          </h2>
          <p className="mt-3 text-indigo-100 max-w-sm">
            Everything your college shares, organised by semester and branch.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-50">
                <span className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-indigo-200">Made for students, by students.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="lg:hidden text-2xl font-bold text-indigo-600 mb-6">Notely</h1>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const base =
  "w-full border border-gray-200 rounded-xl py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition";

export function Field({ icon: Icon, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        type={isPassword && show ? "text" : type}
        className={`${base} pl-10 ${isPassword ? "pr-10" : "pr-3"}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}
    </div>
  );
}

export function SelectField({ icon: Icon, children, ...props }) {
  return (
    <div className="relative flex-1">
      {Icon && <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
      <select {...props} className={`${base} ${Icon ? "pl-10" : "pl-3"} pr-3`}>
        {children}
      </select>
    </div>
  );
}