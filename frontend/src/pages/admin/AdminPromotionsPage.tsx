import { useEffect, useState } from "react";
import { get, post, del } from "../../api/client";
import { Plus, Trash2, X, Check } from "lucide-react";

export function AdminPromotionsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", discount: 10, startdate: "", enddate: "", bookid: 0, branchid: 0 });

  const fetch_ = () => get("/api/promotions").then(setPromos);
  useEffect(() => {
    fetch_();
    get("/api/books?limit=100").then(r => setBooks(r.items));
    get("/api/branches").then(setBranches);
  }, []);

  const handleSave = async () => {
    await post("/api/promotions", form);
    setShowForm(false); fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Акції ({promos.length})</h1>
        <button onClick={() => {
          setForm({ title: "", discount: 10, startdate: new Date().toISOString().split("T")[0], enddate: "", bookid: books[0]?.bookid || 0, branchid: branches[0]?.branchid || 0 });
          setShowForm(true);
        }} className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Додати
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">Нова акція</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="sm:col-span-2">
              <label className="block font-medium text-text mb-1">Назва акції</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Знижка (%)</label>
              <input type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Книга</label>
              <select value={form.bookid} onChange={e => setForm({...form, bookid: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {books.map((b: any) => <option key={b.bookid} value={b.bookid}>{b.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Філія</label>
              <select value={form.branchid} onChange={e => setForm({...form, branchid: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {branches.map((b: any) => <option key={b.branchid} value={b.branchid}>{b.city}, {b.address}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Початок</label>
              <input type="date" value={form.startdate} onChange={e => setForm({...form, startdate: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Кінець</label>
              <input type="date" value={form.enddate} onChange={e => setForm({...form, enddate: e.target.value})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
          </div>
          <button onClick={handleSave} className="mt-4 flex items-center gap-2 px-5 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
            <Check className="w-4 h-4" /> Створити
          </button>
        </div>
      )}

      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-oak-50">
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Назва</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Книга</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Філія</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Знижка</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Період</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дії</th>
          </tr></thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.promotionid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-5 py-3 font-medium text-text">{p.title}</td>
                <td className="px-5 py-3 text-text-secondary">{p.book}</td>
                <td className="px-5 py-3 text-text-secondary">{p.branch}</td>
                <td className="px-5 py-3 text-right"><span className="px-2 py-0.5 bg-oak-800 text-white text-xs font-semibold">-{p.discount}%</span></td>
                <td className="px-5 py-3 text-text-secondary text-xs">{new Date(p.startdate).toLocaleDateString("uk-UA")} — {new Date(p.enddate).toLocaleDateString("uk-UA")}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={async () => { if(confirm("Видалити?")) { await del(`/api/promotions/${p.promotionid}`); fetch_(); } }}
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
