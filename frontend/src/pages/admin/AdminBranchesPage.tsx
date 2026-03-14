import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api/client";
import { Plus, Edit3, Trash2, X, Check } from "lucide-react";

export function AdminBranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ city: "", address: "", postcode: "", managerid: null as number | null });

  const fetch_ = () => get("/api/branches").then(setBranches);
  useEffect(() => { fetch_() }, []);

  const handleSave = async () => {
    if (editing) await put(`/api/branches/${editing.branchid}`, form);
    else await post("/api/branches", form);
    setShowForm(false); fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Філії ({branches.length})</h1>
        <button onClick={() => { setEditing(null); setForm({ city: "", address: "", postcode: "", managerid: null }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Додати
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">{editing ? "Редагувати" : "Нова філія"}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><label className="block font-medium text-text mb-1">Місто</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" /></div>
            <div><label className="block font-medium text-text mb-1">Адреса</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" /></div>
            <div><label className="block font-medium text-text mb-1">Поштовий індекс</label>
              <input value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" /></div>
          </div>
          <button onClick={handleSave} className="mt-4 flex items-center gap-2 px-5 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
            <Check className="w-4 h-4" /> {editing ? "Зберегти" : "Створити"}
          </button>
        </div>
      )}

      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-oak-50">
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Місто</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Адреса</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Індекс</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Менеджер</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дії</th>
          </tr></thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.branchid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-5 py-3 font-medium text-text">{b.city}</td>
                <td className="px-5 py-3 text-text-secondary">{b.address}</td>
                <td className="px-5 py-3 text-text-secondary">{b.postcode}</td>
                <td className="px-5 py-3 text-text-secondary">{b.manager || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => { setEditing(b); setForm({ city: b.city, address: b.address, postcode: b.postcode, managerid: b.managerid }); setShowForm(true); }}
                    className="p-1.5 hover:bg-oak-100"><Edit3 className="w-4 h-4 text-text-muted" /></button>
                  <button onClick={async () => { if(confirm("Видалити?")) { await del(`/api/branches/${b.branchid}`); fetch_(); } }}
                    className="p-1.5 hover:bg-red-50"><Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
