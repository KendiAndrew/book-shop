import { useEffect, useState } from "react";
import { get, put } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { User, Check, AlertCircle } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    get("/api/clients/me").then((p) => {
      setProfile(p);
      setForm({ firstname: p.firstname, lastname: p.lastname, email: p.email, phone: p.phone });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await put("/api/clients/me", form);
      setMsg("Профіль оновлено!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!profile) return <div className="max-w-md mx-auto px-6 py-12 text-text-muted">Завантаження...</div>;

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-oak-100 flex items-center justify-center">
          <User className="w-6 h-6 text-oak-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{user?.username}</h1>
          <p className="text-xs text-text-muted capitalize">{user?.role}</p>
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-4">
          <Check className="w-4 h-4" /> {msg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Ім'я</label>
            <input type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Прізвище</label>
            <input type="text" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Телефон</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
        </div>
        <div className="text-sm text-text-muted">
          Філія: {profile.branch}
        </div>
        <button type="submit"
          className="px-5 py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800">
          Зберегти
        </button>
      </form>
    </div>
  );
}
