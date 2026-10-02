import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Notely</h1>
        <button onClick={logout} className="text-sm border rounded-lg px-3 py-1">Log out</button>
      </div>
      <p className="mt-6 text-lg">Welcome, {user.name} 👋</p>
      <p className="text-gray-500">
        {user.college?.name || user.college} · {user.branch} · Semester {user.semester}
      </p>
    </div>
  );
}