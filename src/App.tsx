import './App.css';
import { Calendar, Users, Clock, Star } from 'lucide-react';

export default function App() {
  return (
    <div className="app-container">
      
      <div className="main-bg">
        <img src="/barbearia.jpg" alt="Background" />
      </div>

      <nav className="navbar">
        {/* Seu código da Navbar aqui */}
      </nav>

      <main className="content-wrapper">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Transforme seu negócio com <br/><span className="text-cyan">AgendaPro</span></h1>
            <p>A plataforma completa de agendamentos para sua gestão.</p>
          </div>
          
          <div className="btn-group">
            <button className="btn-primary">Começar como Cliente </button>
            <button className="btn-secondary">Sou Estabelecimento</button>
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
              <div className="icon-box"><Users /></div>
              <h3>Referencia</h3>
              <p>9 a cada 10 empresas que utilizam nossos serviços, tiveram produtividade aumentada em até 100%.</p>
            </div> 
            
            

            {/* Outros cards */}
          </div>
        </section>
      </main>
    </div>
  );
}