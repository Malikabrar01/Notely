import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

export default function Moderation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/resources/reported")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const dismiss = async (id) => {
  try {
    await api.post(`/resources/${id}/dismiss`);
    remove(id);
  } catch (err) {
    alert(err.response?.data?.message || "Could not dismiss");
  }
};

const del = async (id) => {
  if (!window.confirm("Delete this file permanently?")) return;
  try {
    await api.delete(`/resources/${id}`);
    remove(id);
  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }
};

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 space-y-3">
        <h1 className="text-xl font-bold">Reported files</h1>
        {loading ? <p>Loading...</p> : items.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            No reports. All clear. 🎉
          </div>
        ) : items.map((item) => (
          <div key={item._id} className="bg-white border rounded-xl p-4 space-y-2">
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {item.subject} · {item.branch} · Sem {item.semester} · by {item.uploadedBy?.name}
                </p>
              </div>
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                 className="text-sm text-indigo-600 underline shrink-0">Open file</a>
            </div>
            <ul className="text-sm text-red-700 list-disc pl-5">
              {item.reports.map((r, i) => <li key={i}>{r.reason || "No reason given"}</li>)}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => dismiss(item._id)} className="text-sm border rounded-lg px-3 py-1.5">
                Dismiss reports
              </button>
              <button onClick={() => del(item._id)}
                      className="text-sm text-white bg-red-600 rounded-lg px-3 py-1.5">
                Delete file
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}