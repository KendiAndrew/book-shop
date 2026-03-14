import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api/client";
import { Plus, Edit3, Trash2, X, Check } from "lucide-react";

export function AdminGenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState("");

  const fetch_ = () => get("/api/genres").then(setGenres);
  useEffect(() => { fetch_() }, []);

  const handleSave = async () => {
    if (editing) await put(`/api/genres/${editing.genreid}`, { genrename: name });
    else await post("/api/genres", { genrename: name });
    setShowForm(false); fetch_();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await del(`/api/genres/${id}`); fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Жанри ({genres.length})</h1>
        <button onClick={() => { setEditing(null); setName(""); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Додати
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-5 mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="block font-medium text-text mb-1 text-sm">Назва жанру</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-oak-500" />
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-sm hover:bg-oak-50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {genres.map(g => (
          <div key={g.genreid} className="bg-white border border-border p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-text">{g.genrename}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditing(g); setName(g.genrename); setShowForm(true); }}
                className="p-1 hover:bg-oak-100"><Edit3 className="w-3.5 h-3.5 text-text-muted" /></button>
              <button onClick={() => handleDelete(g.genreid)}
                className="p-1 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
