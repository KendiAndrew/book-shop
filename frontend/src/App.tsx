import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { BookPage } from "./pages/BookPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CartPage } from "./pages/CartPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { AdminBooksPage } from "./pages/admin/AdminBooksPage";
import { AdminAuthorsPage } from "./pages/admin/AdminAuthorsPage";
import { AdminGenresPage } from "./pages/admin/AdminGenresPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminClientsPage } from "./pages/admin/AdminClientsPage";
import { AdminDeliveriesPage } from "./pages/admin/AdminDeliveriesPage";
import { AdminPromotionsPage } from "./pages/admin/AdminPromotionsPage";
import { AdminBranchesPage } from "./pages/admin/AdminBranchesPage";
import { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuth } = useAuth();
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Guest */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/book/:id" element={<BookPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User */}
              <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

              {/* Admin */}
              <Route path="/admin" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
              <Route path="/admin/books" element={<RequireAdmin><AdminBooksPage /></RequireAdmin>} />
              <Route path="/admin/authors" element={<RequireAdmin><AdminAuthorsPage /></RequireAdmin>} />
              <Route path="/admin/genres" element={<RequireAdmin><AdminGenresPage /></RequireAdmin>} />
              <Route path="/admin/orders" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
              <Route path="/admin/clients" element={<RequireAdmin><AdminClientsPage /></RequireAdmin>} />
              <Route path="/admin/deliveries" element={<RequireAdmin><AdminDeliveriesPage /></RequireAdmin>} />
              <Route path="/admin/promotions" element={<RequireAdmin><AdminPromotionsPage /></RequireAdmin>} />
              <Route path="/admin/branches" element={<RequireAdmin><AdminBranchesPage /></RequireAdmin>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
