import { useEffect, useState } from "react";
import { get } from "../../api/client";
import { Package, Eye, X } from "lucide-react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => { get("/api/orders").then(setOrders) }, []);

  const viewDetail = async (id: number) => {
    const d = await get(`/api/orders/${id}`);
    setDetail(d);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Замовлення ({orders.length})</h1>

      {detail && (
        <div className="bg-white border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">Замовлення #{detail.orderid}</h2>
            <button onClick={() => setDetail(null)} className="p-1 hover:bg-oak-50"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-text-muted mb-2">Клієнт: {detail.client} | Філія: {detail.branch}</p>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left py-2 text-xs uppercase text-text-secondary">Книга</th>
              <th className="text-right py-2 text-xs uppercase text-text-secondary">К-сть</th>
              <th className="text-right py-2 text-xs uppercase text-text-secondary">Ціна</th>
              <th className="text-right py-2 text-xs uppercase text-text-secondary">Сума</th>
            </tr></thead>
            <tbody>
              {detail.items?.map((i: any) => (
                <tr key={i.orderdetailid} className="border-b border-border">
                  <td className="py-2">{i.title}</td>
                  <td className="py-2 text-right">{i.quantity}</td>
                  <td className="py-2 text-right">{i.unitprice} грн</td>
                  <td className="py-2 text-right font-semibold">{(i.quantity * Number(i.unitprice)).toFixed(2)} грн</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12"><Package className="w-12 h-12 text-oak-200 mx-auto mb-3" /><p className="text-text-muted">Замовлень немає</p></div>
      ) : (
        <div className="bg-white border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-oak-50">
              <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">#</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Клієнт</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Філія</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дата</th>
              <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Сума</th>
              <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дії</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.orderid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                  <td className="px-5 py-3 font-medium text-text">#{o.orderid}</td>
                  <td className="px-5 py-3 text-text-secondary">{o.client || "—"}</td>
                  <td className="px-5 py-3 text-text-secondary">{o.branch}</td>
                  <td className="px-5 py-3 text-text-secondary">{new Date(o.orderdate).toLocaleDateString("uk-UA")}</td>
                  <td className="px-5 py-3 text-right font-semibold">{Number(o.total).toFixed(2)} грн</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => viewDetail(o.orderid)} className="p-1.5 hover:bg-oak-100"><Eye className="w-4 h-4 text-text-muted" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
