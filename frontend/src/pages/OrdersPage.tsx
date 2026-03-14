import { useEffect, useState } from "react";
import { get } from "../api/client";
import { Package } from "lucide-react";

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    get("/api/orders").then(setOrders);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">Мої замовлення</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-oak-200 mx-auto mb-3" />
          <p className="text-text-muted">Замовлень поки немає</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.orderid} className="bg-white border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text">Замовлення #{o.orderid}</p>
                <p className="text-xs text-text-muted mt-0.5">{o.branch}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text">{Number(o.total).toFixed(2)} грн</p>
                <p className="text-xs text-text-muted">{new Date(o.orderdate).toLocaleDateString("uk-UA")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
