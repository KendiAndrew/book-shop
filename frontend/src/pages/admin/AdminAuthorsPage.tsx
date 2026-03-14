import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api/client";
import { Plus, Edit3, Trash2, X, Check } from "lucide-react";

export function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ firstname: "", lastname: "", biography: "" });

  const fetch_ = () => get("/api/authors").then(setAuthors);
  useEffect(() => { fetch_() }, []);

  const openNew = () => { setEditing(null); setForm({ firstname: "", lastname: "", biography: "" }); setShowForm(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ firstname: a.firstname, lastname: a.lastname, biography: a.biography || "" }); setShowForm(true); };

  const handleSave = async () => {
    if (editing) await put(`/api/authors/${editing.authorid}`, form);
    else await post("/api/authors", form);
    setShowForm(false); fetch_();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await del(`/api/authors/${id}`); fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Автори ({authors.length})</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Додати
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">{editing ? "Редагувати" : "Новий автор"}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block font-medium text-text mb-1">Ім'я</label>
              <input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Прізвище</label>
              <input value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-medium text-text mb-1">Біографія</label>
              <textarea value={form.biography} onChange={e => setForm({...form, biography: e.target.value})} rows={2}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500 resize-none" />
            </div>
          </div>
          <button onClick={handleSave} className="mt-4 flex items-center gap-2 px-5 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
            <Check className="w-4 h-4" /> {editing ? "Зберегти" : "Створити"}
          </button>
        </div>
      )}

      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-oak-50">
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Ім'я</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Прізвище</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Біографія</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дії</th>
          </tr></thead>
          <tbody>
            {authors.map(a => (
              <tr key={a.authorid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-5 py-3 font-medium text-text">{a.firstname}</td>
                <td className="px-5 py-3 text-text">{a.lastname}</td>
                <td className="px-5 py-3 text-text-secondary text-xs max-w-xs truncate">{a.biography || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-oak-100"><Edit3 className="w-4 h-4 text-text-muted" /></button>
                  <button onClick={() => handleDelete(a.authorid)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
