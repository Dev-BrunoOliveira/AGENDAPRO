import { useState, useEffect } from "react";
import "./App.css";
import { Calendar, Users, Star, X, ArrowLeft } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"CLIENT" | "BUSINESS" | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );
  const [view, setView] = useState<"landing" | "client-dash" | "business-dash">(
    "landing",
  );

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const role = session.user.user_metadata.role;
        setView(role === "BUSINESS" ? "business-dash" : "client-dash");
        setIsAuthModalOpen(false);
      } else {
        setView("landing");
      }
    });
  }, []);

  const openAuth = (role: "CLIENT" | "BUSINESS") => {
    setUserRole(role);
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert("Erro no login: " + error.message);
    } else if (authMode === "register") {
      const fullName = formData.get("fullName") as string;
      const phone = formData.get("phone") as string;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: userRole,
          },
        },
      });
      if (error) alert("Erro no cadastro: " + error.message);
      else alert("Sucesso! Verifique seu e-mail para confirmar.");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) console.error("Erro no login:", error.message);
  };

  function ClientDashboard() {
    return (
      <div className="dash-container">
        <header className="dash-header glass">
          <h2>Olá, Bruno!</h2>
          <button
            className="btn-logout"
            onClick={() => supabase.auth.signOut()}
          >
            Sair
          </button>
        </header>
        <main className="dash-content">
          <section className="next-appointments">
            <h3>Seus Próximos Agendamentos</h3>
            <div className="appointment-card glass">
              <div className="info">
                <p className="service">Corte de Cabelo + Barba</p>
                <p className="establishment">Barbearia Treze Core</p>
              </div>
              <div className="date-time">
                <span>15/05</span>
                <span>14:30</span>
              </div>
            </div>
          </section>
          <button className="btn-new-schedule">Novo Agendamento</button>
        </main>
      </div>
    );
  }

  function BusinessDashboard() {
    return (
      <div className="dash-container">
        <header className="dash-header glass">
          <h2>Painel Administrativo</h2>
          <div className="header-actions">
            <div className="stats-quick glass">Total Hoje: 12 Cortes</div>
            <button
              className="btn-logout"
              onClick={() => supabase.auth.signOut()}
            >
              Sair
            </button>
          </div>
        </header>
        <div className="admin-grid">
          <aside className="sidebar glass">
            <nav>
              <button className="active">Agenda</button>
              <button>Clientes</button>
              <button>Configurações</button>
            </nav>
          </aside>
          <main className="agenda-view">
            <h3>Agenda do Dia</h3>
            <table className="agenda-table glass">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>09:00</td>
                  <td>Carlos Silva</td>
                  <td>Barba Terapia</td>
                  <td>
                    <span className="status confirmed">Confirmado</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* --- TELA: LANDING PAGE --- */}
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
                  <h3>Referencia</h3>
                  <p>9 a cada 10 empresas aumentaram a produtividade.</p>
                </div>
                <div className="feature-card">
                  <div className="icon-box">
                    <Star />
                  </div>
                  <h3>Filtragem</h3>
                  <p>
                    Encontre seus clientes com facilidade utilizando filtros.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* --- TELA: DASHBOARD CLIENTE --- */}
      {view === "client-dash" && <ClientDashboard />}

      {/* --- TELA: DASHBOARD EMPRESA --- */}
      {view === "business-dash" && <BusinessDashboard />}

      {/* --- MODAL DE AUTENTICAÇÃO --- */}
      {isAuthModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setIsAuthModalOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="modal-header">
              {authMode !== "login" && (
                <button
                  className="back-btn"
                  onClick={() => setAuthMode("login")}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="modal-title">
                {authMode === "login" && "Acessar Conta"}
                {authMode === "register" &&
                  (userRole === "CLIENT"
                    ? "Criar Conta Cliente"
                    : "Cadastrar Empresa")}
                {authMode === "forgot" && "Recuperar Senha"}
              </h2>
            </div>

            {authMode !== "forgot" && (
              <>
                <button className="btn-google" onClick={handleGoogleLogin}>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                  />
                  {authMode === "login"
                    ? "Entrar com Google"
                    : "Cadastrar com Google"}
                </button>
                <div className="divider">
                  <span>ou use seu e-mail</span>
                </div>
              </>
            )}

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Nome Completo"
                    required
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Telefone: 011 952378000"
                    required
                  />
                </>
              )}

              <input name="email" type="email" placeholder="E-mail" required />
              {authMode !== "forgot" && (
                <input
                  name="password"
                  type="password"
                  placeholder="Senha"
                  required
                />
              )}

              {authMode === "login" && (
                <button
                  type="button"
                  className="link-text"
                  onClick={() => setAuthMode("forgot")}
                >
                  Esqueceu a senha?
                </button>
              )}

              <button type="submit" className="btn-submit">
                {authMode === "login" && "Entrar"}
                {authMode === "register" && "Finalizar Cadastro"}
                {authMode === "forgot" && "Enviar Link"}
              </button>
            </form>

            <div className="modal-footer">
              <p>
                {authMode === "login" ? "Não tem conta? " : "Já possui conta? "}
                <button
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "register" : "login")
                  }
                >
                  {authMode === "login" ? "Cadastre-se" : "Fazer Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
