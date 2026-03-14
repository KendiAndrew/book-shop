import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  BookOpen, Search, ShoppingCart, User, LogOut, Menu,
  Home, Library, Users, BarChart3, Settings, Tag, Truck,
  Package, ChevronDown
} from "lucide-react";
import { useState } from "react";

const ADMIN_NAV = [
  { to: "/admin", icon: BarChart3, label: "Dashboard" },
  { to: "/admin/books", icon: Library, label: "Книги" },
  { to: "/admin/authors", icon: Users, label: "Автори" },
  { to: "/admin/genres", icon: Tag, label: "Жанри" },
  { to: "/admin/orders", icon: Package, label: "Замовлення" },
  { to: "/admin/clients", icon: Users, label: "Клієнти" },
  { to: "/admin/deliveries", icon: Truck, label: "Поставки" },
  { to: "/admin/promotions", icon: Tag, label: "Акції" },
  { to: "/admin/branches", icon: Home, label: "Філії" },
];

export function Layout() {
  const { user, logout, isAdmin, isAuth } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-8 h-8 bg-oak-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text tracking-tight">BookShop</span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-oak-50 transition-colors no-underline">
              Головна
            </Link>
            <Link to="/catalog" className="px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-oak-50 transition-colors no-underline">
              Каталог
            </Link>
            {isAdmin && (
              <Link to="/admin" className="px-3 py-2 text-sm text-oak-700 font-medium hover:bg-oak-50 transition-colors no-underline">
                Панель адміна
              </Link>
            )}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuth && (
              <Link to="/cart" className="relative p-2 hover:bg-oak-50 transition-colors no-underline">
                <ShoppingCart className="w-5 h-5 text-text-secondary" />
                {count > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-oak-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-oak-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-oak-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-oak-700" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">{user?.username}</span>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border shadow-lg z-50 py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-text hover:bg-oak-50 no-underline"
                      >
                        Профіль
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-text hover:bg-oak-50 no-underline"
                      >
                        Мої замовлення
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Вийти
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary border border-border hover:bg-oak-50 transition-colors no-underline"
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-oak-800 border border-oak-800 hover:bg-oak-900 transition-colors no-underline"
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BODY */}
      {isAdminPage && isAdmin ? (
        <div className="flex">
          {/* Admin sidebar */}
          <aside
            className={`${sidebarOpen ? "w-56" : "w-14"} shrink-0 bg-white border-r border-border min-h-[calc(100vh-3.5rem)] transition-all duration-300 sticky top-14`}
          >
            <div className="p-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center gap-3 px-2.5 py-2 hover:bg-oak-50 transition-colors text-text-secondary"
              >
                <Menu className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="text-sm">Меню</span>}
              </button>
            </div>
            <nav className="px-2 space-y-0.5">
              {ADMIN_NAV.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-2.5 py-2 transition-colors text-sm no-underline ${
                      active
                        ? "bg-oak-800 text-white font-medium"
                        : "text-text-secondary hover:bg-oak-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : ""}`} />
                    {sidebarOpen && <span>{label}</span>}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 p-6 max-w-6xl">
            <Outlet />
          </main>
        </div>
      ) : (
        <main>
          <Outlet />
        </main>
      )}
    </div>
  );
}
