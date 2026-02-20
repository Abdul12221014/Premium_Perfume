import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import TheHousePage from "@/pages/TheHousePage";
import AtelierPage from "@/pages/AtelierPage";
import ContactPage from "@/pages/ContactPage";
import JournalPage from "@/pages/JournalPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import SuccessPage from "@/pages/SuccessPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLogin from "@/pages/admin/AdminLogin";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Main Navigation and Footer */}
            <Route
              path="/*"
              element={
                <>
                  <Navigation />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/fragrance/:slug" element={<ProductDetailPage />} />
                    <Route path="/the-house" element={<TheHousePage />} />
                    <Route path="/atelier" element={<AtelierPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/journal/:slug" element={<ArticleDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                  </Routes>
                  <Footer />
                </>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/products" element={<AdminProductsPage />} />
                      <Route path="/orders" element={<AdminOrdersPage />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
