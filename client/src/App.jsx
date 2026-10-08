import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Moderation from "./pages/Moderation";
import ProtectedRoute from "./components/ProtectedRoute";
import SubjectPage from "./pages/SubjectPage";

export default function App() {
  return (
    <Routes>
      <Route path="/subject/:name" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}