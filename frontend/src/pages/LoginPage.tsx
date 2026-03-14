import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-oak-800 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Вхід</h1>
          <p className="text-sm text-text-muted mt-1">Увійдіть до свого акаунту</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Логін</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:border-oak-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-oak-800 text-white font-medium hover:bg-oak-900 transition-colors border border-oak-800"
          >
            Увійти
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Немає акаунту?{" "}
          <Link to="/register" className="text-oak-700 font-medium hover:text-oak-900 no-underline">
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
