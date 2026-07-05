import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import defaultLogo from "../assets/logo.png";
import { readSettings } from "../utils/storage";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/billing", label: "New Sale", icon: ShoppingCart },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/credit", label: "Credit", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  const [shopSettings, setShopSettings] = useState(readSettings());

  useEffect(() => {
    const load = () => setShopSettings(readSettings());
    window.addEventListener("pos-data-change", load);
    return () => window.removeEventListener("pos-data-change", load);
  }, []);

  return (
    <aside className="app-sidebar flex h-screen w-72 shrink-0 flex-col border-r border-green-950/20 bg-slate-950 p-5 text-white">
      <div className="mb-8 flex items-center gap-3">
        <img
          src={shopSettings.logo || defaultLogo}
          alt="Shop Logo"
          className="h-14 w-14 rounded-lg bg-white object-contain p-1.5"
          onError={(event) => {
            event.currentTarget.src = defaultLogo;
          }}
        />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{shopSettings.shopName}</h1>
          <p className="text-xs text-green-200">Agro POS</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg bg-white/10 p-4 text-sm text-slate-200">
        <p className="font-semibold text-white">Offline Ready</p>
        <p>Sales, stock, credit, and settings save on this laptop.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
