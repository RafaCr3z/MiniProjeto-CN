import { Link } from 'react-router-dom';
import { Camera, Gift, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container animate-fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          O seu bairro nas suas mãos.<br />
          E a sua voz <span className="text-gradient">valorizada</span>.
        </h1>
        <p className="hero-subtitle">
          Registe problemas na infraestrutura pública da sua cidade de forma rápida.
          A autarquia resolve e você ganha pontos para trocar no comércio local!
        </p>
        <div className="hero-actions">
          <Link to="/report" className="primary-btn">
            Reportar Ocorrência
          </Link>
          <Link to="/dashboard" className="secondary-btn">
            Acesso Câmara
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">Como Funciona?</h2>
        <div className="steps-grid">
          <div className="step-card glass-panel">
            <div className="step-icon">
              <Camera size={32} />
            </div>
            <h3>1. Fotografe & Reporte</h3>
            <p>Encontrou um buraco na via ou lixo acumulado? Tire uma foto, o GPS faz o resto e envia automaticamente o aviso.</p>
          </div>
          <div className="step-card glass-panel">
            <div className="step-icon" style={{color: 'var(--accent-primary)', background: 'var(--accent-glow)'}}>
              <CheckCircle size={32} />
            </div>
            <h3>2. A Autarquia Resolve</h3>
            <p>A Câmara Municipal recebe todos os alertas numa plataforma eficiente de triagem e resolve o problema.</p>
          </div>
          <div className="step-card glass-panel">
            <div className="step-icon" style={{color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)'}}>
              <Gift size={32} />
            </div>
            <h3>3. Ganhe Recompensas</h3>
            <p>Quando a ocorrência for resolvida, receba pontos. Troque-os por acessos municipais ou descontos no comércio local!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
