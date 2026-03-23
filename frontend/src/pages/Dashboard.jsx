import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/ocorrencias');
      if (!res.ok) throw new Error("Erro de resposta da API CosmosDB");
      
      const data = await res.json();
      setIssues(data.dados); // A API devolve { dados: [...] }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);
  
  const handleResolve = async (id) => {
    try {
      const res = await fetch(`/api/ocorrencias/${id}/resolver`, { method: 'PUT' });
      const data = await res.json();
      
      if (res.ok) {
        // Atualiza UI list
        setIssues(issues.map(i => i.id === id ? { ...i, estado: 'Resolvido' } : i));
        alert(data.mensagem);
      } else {
        alert("Erro no Azure: " + data.erro);
      }
    } catch(e) {
      alert("Falha de rede ao tentar contactar Cosmos API.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolvido': return <span className="badge badge-success">Resolvido</span>;
      case 'Em Análise': return <span className="badge badge-warning">Em Análise</span>;
      default: return <span className="badge badge-danger">Pendente</span>;
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Painel Autarquia <span className="text-gradient">CityGuards</span></h1>
        <p className="text-secondary">Gestão e triagem de ocorrências cívicas (B2B SaaS).</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon warning"><AlertTriangle size={28} /></div>
          <div className="stat-info">
            <span className="stat-value">{issues.filter(i=>i.estado!=='Resolvido').length}</span>
            <span className="stat-label">Pendentes/Ativas</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon success"><CheckCircle size={28} /></div>
          <div className="stat-info">
            <span className="stat-value">{issues.filter(i=>i.estado==='Resolvido').length}</span>
            <span className="stat-label">Resolvidos na BD</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content glass-panel">
        <div className="content-header">
          <h2>Ocorrências Reportadas no CosmosDB</h2>
          <button className="secondary-btn" onClick={fetchIssues}>Atualizar</button>
        </div>
        
        <div className="table-responsive">
          <table className="issues-table">
            <thead>
              <tr>
                <th>ID do Cosmos</th>
                <th>Descrição AI</th>
                <th>Data</th>
                <th>Cidadao (PartitionKey)</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>A carregar dados do Azure...</td></tr> : 
               issues.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center'}}>Sem base de dados vazia.</td></tr> :
               issues.map(issue => (
                <tr key={issue.id}>
                  <td><small>{issue.id.substring(0, 15)}...</small></td>
                  <td><strong>{issue.descricao}</strong></td>
                  <td>{new Date(issue.dataReporte).toLocaleDateString()}</td>
                  <td>{issue.cidadaoId}</td>
                  <td>{getStatusBadge(issue.estado)}</td>
                  <td>
                    {issue.estado !== 'Resolvido' ? (
                      <button 
                        className="action-btn resolve-btn"
                        onClick={() => handleResolve(issue.id)}
                        title="Resolver no CosmosDB"
                      >
                        <CheckCircle size={18} /> Resolver
                      </button>
                    ) : (
                      <span className="text-secondary" style={{fontSize: '0.9rem'}}>Atribuído (+50)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
