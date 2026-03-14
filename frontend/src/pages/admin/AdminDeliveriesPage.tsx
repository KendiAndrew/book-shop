import { useEffect, useState } from "react";
import { get, post } from "../../api/client";
import { Plus, Check, X, Truck } from "lucide-react";

export function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierid: 0, bookid: 0, quantity: 1, deliveryprice: 0 });
  const [msg, setMsg] = useState("");

  const fetch_ = () => get("/api/deliveries").then(setDeliveries);
  useEffect(() => {
    fetch_();
    get("/api/books?limit=100").then(r => setBooks(r.items));
    get("/api/suppliers").then(setSuppliers);
  }, []);

  const handleSave = async () => {
    const res = await post("/api/deliveries", form);
    setMsg(res.message);
    setShowForm(false);
    fetch_();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Поставки ({deliveries.length})</h1>
        <button onClick={() => {
          setForm({ supplierid: suppliers[0]?.supplierid || 0, bookid: books[0]?.bookid || 0, quantity: 1, deliveryprice: 0 });
          setShowForm(true); setMsg("");
        }} className="flex items-center gap-2 px-4 py-2 bg-oak-800 text-white text-sm font-medium hover:bg-oak-900 border border-oak-800">
          <Plus className="w-4 h-4" /> Нова поставка
        </button>
      </div>

      {msg && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-4"><Truck className="w-4 h-4" /> {msg}</div>}

      {showForm && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">Нова поставка</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block font-medium text-text mb-1">Постачальник</label>
              <select value={form.supplierid} onChange={e => setForm({...form, supplierid: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {suppliers.map((s: any) => <option key={s.supplierid} value={s.supplierid}>{s.firstname} {s.lastname}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Книга</label>
              <select value={form.bookid} onChange={e => setForm({...form, bookid: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500">
                {books.map((b: any) => <option key={b.bookid} value={b.bookid}>{b.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Кількість</label>
              <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-border focus:outline-none focus:border-oak-500" />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Ціна поставки</label>
              <input type="number" value={form.deliveryprice} onChange={e => setForm({...form, deliveryprice: Number(e.target.value)})}
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
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дата</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Книга</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Постачальник</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">К-сть</th>
            <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Ціна</th>
          </tr></thead>
          <tbody>
            {deliveries.map(d => (
              <tr key={d.deliveryid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-5 py-3 text-text-secondary">{new Date(d.deliverydate).toLocaleDateString("uk-UA")}</td>
                <td className="px-5 py-3 font-medium text-text">{d.book}</td>
                <td className="px-5 py-3 text-text-secondary">{d.supplier}</td>
                <td className="px-5 py-3 text-right">{d.quantity}</td>
                <td className="px-5 py-3 text-right font-semibold">{d.deliveryprice} грн</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
