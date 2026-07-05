import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { money, readStore } from "../utils/storage";

const isToday = (dateText) =>
  new Date(dateText).toDateString() === new Date().toDateString();

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const load = () => {
      setProducts(readStore("products"));
      setCustomers(readStore("customers"));
      setSales(readStore("sales"));
    };

    load();
    window.addEventListener("pos-data-change", load);
    return () => window.removeEventListener("pos-data-change", load);
  }, []);

  const metrics = useMemo(() => {
    const todaySales = sales
      .filter((sale) => isToday(sale.date))
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const pendingCredit = customers.reduce(
      (sum, customer) => sum + Number(customer.credit || 0),
      0
    );
    const lowStock = products.filter(
      (product) => Number(product.stock || 0) <= Number(product.minStock || 0)
    );
    const expiringSoon = products.filter((product) => {
      if (!product.expiry) return false;
      const days =
        (new Date(product.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    });

    return { todaySales, pendingCredit, lowStock, expiringSoon };
  }, [customers, products, sales]);

  const cards = [
    { title: "Total Products", value: products.length, icon: Package, color: "bg-green-600" },
    { title: "Today's Sales", value: `Rs. ${money(metrics.todaySales)}`, icon: ShoppingCart, color: "bg-blue-600" },
    { title: "Credit Customers", value: customers.filter((item) => Number(item.credit || 0) > 0).length, icon: Users, color: "bg-amber-500" },
    { title: "Pending Credit", value: `Rs. ${money(metrics.pendingCredit)}`, icon: Wallet, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Overview
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.title}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{card.value}</h2>
                </div>
                <div className={`${card.color} rounded-lg p-3 text-white`}>
                  <Icon size={26} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-700">
            <AlertTriangle size={22} />
            Low Stock
          </h2>
          <div className="space-y-3">
            {metrics.lowStock.length === 0 ? (
              <p className="text-slate-500">No low stock items.</p>
            ) : (
              metrics.lowStock.slice(0, 6).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="font-bold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category || "Uncategorized"}</p>
                  </div>
                  <span className="font-bold text-red-600">{money(product.stock)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-amber-700">
            <CalendarClock size={22} />
            Expiring Soon
          </h2>
          <div className="space-y-3">
            {metrics.expiringSoon.length === 0 ? (
              <p className="text-slate-500">No products expiring within 30 days.</p>
            ) : (
              metrics.expiringSoon.slice(0, 6).map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="font-bold text-slate-950">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.sinhala}</p>
                  </div>
                  <span className="font-bold text-amber-700">{product.expiry}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
