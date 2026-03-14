import { useEffect, useState } from "react";
import { get } from "../../api/client";
import { Library, Package, CreditCard, Users } from "lucide-react";

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [branchReport, setBranchReport] = useState<any[]>([]);

  useEffect(() => {
    get("/api/analytics/dashboard").then(setStats);
    get("/api/analytics/branch-report").then(setBranchReport);
  }, []);

  if (!stats) return <p className="text-text-muted">Завантаження...</p>;

  const cards = [
    { label: "Всього книг", value: stats.total_books, icon: Library, bg: "bg-oak-100", color: "text-oak-700" },
    { label: "Замовлень", value: stats.total_orders, icon: Package, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Дохід", value: `${stats.total_revenue.toFixed(0)} грн`, icon: CreditCard, bg: "bg-oak-50", color: "text-oak-600" },
    { label: "Клієнтів", value: stats.total_clients, icon: Users, bg: "bg-accent-50", color: "text-accent-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-border p-5">
            <div className={`p-2.5 ${c.bg} w-fit mb-3`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-text">{c.value}</p>
            <p className="text-sm text-text-muted mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {branchReport.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-text mb-4">Звіт по філіях</h2>
          <div className="bg-white border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-oak-50">
                  <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Філія</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Замовлень</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Продано книг</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Дохід</th>
                </tr>
              </thead>
              <tbody>
                {branchReport.map((r: any) => (
                  <tr key={r.branchid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                    <td className="px-5 py-3 font-medium text-text">{r.city}, {r.address}</td>
                    <td className="px-5 py-3 text-right text-text-secondary">{r.totalorders}</td>
                    <td className="px-5 py-3 text-right text-text-secondary">{r.totalbookssold}</td>
                    <td className="px-5 py-3 text-right font-semibold">{Number(r.totalrevenue).toFixed(0)} грн</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
