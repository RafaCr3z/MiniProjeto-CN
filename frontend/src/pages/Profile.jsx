import { useState, useEffect } from 'react';
import { User, Star, Award, Ticket, Clock, Gift } from 'lucide-react';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Atualiza pontos do cidadão
        const resUser = await fetch(`/api/cidadaos/email/${user.email}`);
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUser({ ...user, pontosGamificacao: dataUser.dados.pontosGamificacao });
        }

        // Vai buscar lista de ocorrências Azure
        const resHist = await fetch(`/api/ocorrencias/cidadao/${user.id}`);
        if (resHist.ok) {
          const dataHist = await resHist.json();
          setHistory(dataHist.dados);
        }
      } catch(e) {
        console.error("Erro leitura no CosmosDB");
      }
    };
    fetchRealData();
  }, [user.email, user.id, setUser]); // Warning: depending on setUser can be safe as long as it's from App.jsx

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass-panel">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h2>{user.nome}</h2>
          <p className="text-secondary">Cidadão Registado (Cosmos DB: {user.id})</p>
        </div>
        <div className="profile-points">
          <span className="points-label">Saldo Azure Gamificado</span>
          <span className="points-total text-gradient">{user.pontosGamificacao || 0} pts</span>
        </div>
      </div>

      <div className="profile-content">
        <section className="rewards-section">
          <h3><Gift size={24} className="icon-inline" /> Recompensas Disponíveis</h3>
          <p className="text-secondary mb-4">Troque os seus pontos obtidos por aprovações da Câmara.</p>
          
          <div className="rewards-grid">
            <div className={`reward-card glass-panel ${(user.pontosGamificacao||0) < 150 ? 'locked' : ''}`}>
              <div className="reward-icon"><Ticket size={32} /></div>
              <h4>Piscinas Municipais</h4>
              <p>Entrada gratuita válida por 1 dia.</p>
              <button className="primary-btn reward-btn" disabled={(user.pontosGamificacao||0) < 150}>Resgatar (150 pts)</button>
            </div>
            
            <div className={`reward-card glass-panel ${(user.pontosGamificacao||0) < 50 ? 'locked' : ''}`}>
              <div className="reward-icon"><Star size={32} /></div>
              <h4>Mercearia Central</h4>
              <p>10% de desconto em compras &gt; 20€.</p>
              <button className="primary-btn reward-btn" disabled={(user.pontosGamificacao||0) < 50}>Resgatar (50 pts)</button>
            </div>
            
            <div className={`reward-card glass-panel ${(user.pontosGamificacao||0) < 500 ? 'locked' : ''}`}>
              <div className="reward-icon"><Award size={32} /></div>
              <h4>Museu da Cidade</h4>
              <p>Passe VIP familiar (4 pessoas).</p>
              <button className="secondary-btn reward-btn" disabled={(user.pontosGamificacao||0) < 500}>Bloqueado (500 pts)</button>
            </div>
          </div>
        </section>

        <section className="history-section glass-panel">
          <h3><Clock size={24} className="icon-inline" /> Histórico de Ocorrências Pessoais</h3>
          <ul className="history-list">
            {history.length === 0 ? (
              <p className="text-center text-secondary">Ainda não enviou nenhuma ocorrência válida.</p>
            ) : history.map(h => (
              <li className="history-item" key={h.id}>
                <div className="history-details">
                  <strong>{h.descricao}</strong>
                  <span>{new Date(h.dataReporte).toLocaleDateString()} ({h.estado})</span>
                </div>
                <div className={`history-points ${h.estado === 'Resolvido' ? 'success' : 'pending'}`}>
                  {h.estado === 'Resolvido' ? '+50 pts' : 'A avaliar'}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Profile;
