import { useState, useEffect } from "react";
import "./App.css";
import { Calendar, Users, Star } from "lucide-react";
import { supabase } from "./supabaseClient";
import { ClientDashboard } from "./components/ClientDashboard";
import { BusinessDashboard } from "./components/BusinessDashboard";
import { AuthModal } from "./components/AuthModal";
import { ToastContainer } from "./components/Toast";

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"CLIENT" | "BUSINESS" | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const [view, setView] = useState<"landing" | "client-dash" | "business-dash">(
    "landing",
  );
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const barberRef = params.get("b");
    if (barberRef) {
      localStorage.setItem("barberRef", barberRef);
      localStorage.setItem("autoOpenModal", "true");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const role = session.user.user_metadata.role || "CLIENT";
        setUserId(session.user.id);
        setView(role === "BUSINESS" ? "business-dash" : "client-dash");
        setIsAuthModalOpen(false);
      } else {
        setUserId(null);
        setView("landing");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const openAuth = (role: "CLIENT" | "BUSINESS") => {
    setUserRole(role);
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app-container">
      {view === "landing" && (
        <>
          <div className="main-bg">
            <img src="/barbearia.jpg" alt="Background" />
          </div>

          <main className="content-wrapper">
            <section className="hero-section">
              <div className="hero-text">
                <h1>
                  Agende serviços com <br />
                  <span className="text-cyan">AgendaPro</span>
                </h1>
                <p>A plataforma completa de agendamentos para sua gestão.</p>
              </div>

              <div className="btn-group">
                <button
                  className="btn-primary"
                  onClick={() => openAuth("CLIENT")}
                >
                  Começar como Cliente
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => openAuth("BUSINESS")}
                >
                  Sou Estabelecimento
                </button>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="icon-box">
                    <Calendar />
                  </div>
                  <h3>Agendamento</h3>
                  <p>
                    Sistema que evita conflitos e facilita o uso web e mobile.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="icon-box">
                    <Users />
                  </div>
                  <h3>Clientes</h3>
                  <p>Gerencie seus clientes facilmente e otimize seu tempo.</p>
                </div>
                <div className="feature-card">
                  <div className="icon-box">
                    <Star />
                  </div>
                  <h3>Referência</h3>
                  <p>9 a cada 10 empresas aumentaram a produtividade.</p>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {view === "client-dash" && userId && <ClientDashboard userId={userId} />}
      {view === "business-dash" && userId && <BusinessDashboard userId={userId} />}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userRole={userRole}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
      <ToastContainer />
    </div>
  );
}
