import { useEffect, useState } from "react";
import { get } from "../../api/client";

export function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { get("/api/clients").then(setClients) }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Клієнти ({clients.length})</h1>
      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-oak-50">
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Ім'я</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Email</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Телефон</th>
            <th className="text-left px-5 py-3 font-semibold text-text-secondary text-xs uppercase">Філія</th>
          </tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.clientid} className="border-b border-border last:border-0 hover:bg-oak-50/50">
                <td className="px-5 py-3 font-medium text-text">{c.firstname} {c.lastname}</td>
                <td className="px-5 py-3 text-text-secondary">{c.email}</td>
                <td className="px-5 py-3 text-text-secondary">{c.phone}</td>
                <td className="px-5 py-3 text-text-secondary">{c.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
