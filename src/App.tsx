import { useState } from "react";
import "./App.css";
import { Calendar, Users, Star, X, ArrowLeft } from "lucide-react";

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"CLIENT" | "BUSINESS" | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");

  const openAuth = (role: "CLIENT" | "BUSINESS") => {
    setUserRole(role);
    setAuthMode("login"); 
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app-container">
      <div className="main-bg">
        <img src="/barbearia.jpg" alt="Background" />
      </div>

      <main className="content-wrapper">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Transforme seu negócio com <br /><span className="text-cyan">AgendaPro</span></h1>
            <p>A plataforma completa de agendamentos para sua gestão.</p>
          </div>

          <div className="btn-group">
            <button className="btn-primary" onClick={() => openAuth("CLIENT")}>Começar como Cliente</button>
            <button className="btn-secondary" onClick={() => openAuth("BUSINESS")}>Sou Estabelecimento</button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-box"><Calendar /></div>
              <h3>Agendamento</h3>
              <p>Sistema que evita conflitos, e facilidade de uso tanto web quanto no mobile.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><Users /></div>
              <h3>Clientes</h3>
              <p>Gerencie seus clientes facilmente, e otimize o seu tempo.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><Star /></div>
              <h3>Referencia</h3>
              <p>9 a cada 10 empresas que utilizam nossos serviços, tiveram produtividade aumentada em até 100%.</p>
            </div>
          </div>
        </section>
      </main>

      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsAuthModalOpen(false)}><X size={24} /></button>
            
            {/* Cabeçalho Dinâmico */}
            <div className="modal-header">
              {authMode !== "login" && (
                <button className="back-btn" onClick={() => setAuthMode("login")}><ArrowLeft size={20} /></button>
              )}
              <h2 className="modal-title">
                {authMode === "login" && "Acessar Conta"}
                {authMode === "register" && (userRole === "CLIENT" ? "Criar Conta Cliente" : "Cadastrar Empresa")}
                {authMode === "forgot" && "Recuperar Senha"}
              </h2>
            </div>

            {authMode !== "forgot" && (
              <>
                <button className="btn-google">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                  {authMode === "login" ? "Entrar com Google" : "Cadastrar com Google"}
                </button>
                <div className="divider"><span>ou use seu e-mail</span></div>
              </>
            )}

            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              {authMode === "register" && (
                <>
                  <input type="text" placeholder="Nome Completo" required />
                  <input type="tel" placeholder="Telefone: 011 952378000" pattern="[0-9]{3} [0-9]{9}" required />
                </>
              )}

              <input type="email" placeholder="E-mail" required />
              
              {authMode !== "forgot" && (
                <input type="password" placeholder="Senha" required />
              )}

              {authMode === "login" && (
                <button type="button" className="link-text" onClick={() => setAuthMode("forgot")}>
                  Esqueceu a senha?
                </button>
              )}

              <button type="submit" className="btn-submit">
                {authMode === "login" && "Entrar"}
                {authMode === "register" && "Finalizar Cadastro"}
                {authMode === "forgot" && "Enviar Link de Recuperação"}
              </button>
            </form>

            <div className="modal-footer">
              {authMode === "login" ? (
                <p>Não tem conta? <button onClick={() => setAuthMode("register")}>Cadastre-se</button></p>
              ) : (
                <p>Já possui conta? <button onClick={() => setAuthMode("login")}>Fazer Login</button></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}