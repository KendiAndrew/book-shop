import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { get } from "../api/client";
import { BookOpen, AlertCircle } from "lucide-react";

export function RegisterPage() {
  const [form, setForm] = useState({
    username: "", password: "", firstname: "", lastname: "",
    email: "", phone: "+380", branchid: 1,
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/branches").then(setBranches);
  }, []);

  const set = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-oak-800 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Реєстрація</h1>
          <p className="text-sm text-text-muted mt-1">Створіть акаунт покупця</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Ім'я</label>
              <input type="text" value={form.firstname} onChange={(e) => set("firstname", e.target.value)} required
                className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Прізвище</label>
              <input type="text" value={form.lastname} onChange={(e) => set("lastname", e.target.value)} required
                className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Логін</label>
            <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)} required
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required
              placeholder="example@mail.com"
              className="w-full px-4 py-2.5 bg-white border border-border text-sm placeholder:text-text-muted focus:outline-none focus:border-oak-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Телефон</label>
            <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} required
              placeholder="+380XXXXXXXXX"
              className="w-full px-4 py-2.5 bg-white border border-border text-sm placeholder:text-text-muted focus:outline-none focus:border-oak-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Пароль</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500" />
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Філія</label>
              <select value={form.branchid} onChange={(e) => set("branchid", Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500">
                {branches.map((b: any) => (
                  <option key={b.branchid} value={b.branchid}>{b.city}, {b.address}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit"
            className="w-full py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800">
            Зареєструватись
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Вже маєте акаунт?{" "}
          <Link to="/login" className="text-oak-700 font-medium hover:text-oak-900 no-underline">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
