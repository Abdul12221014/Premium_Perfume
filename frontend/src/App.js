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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
