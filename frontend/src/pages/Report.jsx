import { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle } from 'lucide-react';
import './Report.css';

const Report = ({ user }) => {
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState('A obter localização...');
  const [loading, setLoading] = useState(false);
  
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [listaAutarquias, setListaAutarquias] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setLocation('Lat: 38.722, Lng: -9.139 (Coordenadas Atuais)');
    }, 1500);

    // Carregar a lista dinâmica de Câmaras da base de dados
    const fetchAutarquias = async () => {
      try {
        const res = await fetch('/api/autarquias');
        if (res.ok) {
          const data = await res.json();
          // Remove duplicados pelo nome do município, opcionalmente
          setListaAutarquias(data.dados);
        }
      } catch(e) {
        console.error("Erro a carregar autarquias", e);
      }
    };
    fetchAutarquias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/ocorrencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cidadaoId: user.id, // Vindo do App.jsx state
          descricao: `[${category}] ${description}`,
          municipio: municipio,
          latitude: "38.722",
          longitude: "-9.139",
          fotografiaUrl: ""
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Falha a guardar ocorrência no Azure.");
      
      setSubmitted(true);
    } catch (err) {
      alert("Erro de servidor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="report-container animate-fade-in text-center">
        <div className="success-card glass-panel">
          <CheckCircle size={64} className="success-icon" />
          <h2>Ocorrência Registada!</h2>
          <p>A Câmara Municipal de {municipio} foi notificada. Acompanhe o estado do seu reporte no Perfil.</p>
          <div className="points-reward">
            Quando resolvido, irá ganhar<br/>
            <span className="points-value text-gradient">+50 Pontos</span>
          </div>
          <button className="primary-btn mt-4" onClick={() => { setSubmitted(false); setDescription(''); }}>
            Reportar Novo Problema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container animate-fade-in">
      <div className="report-header text-center">
        <h1 className="section-title" style={{marginBottom: '1rem'}}>
          Reportar <span className="text-gradient">Problema</span>
        </h1>
        <p className="text-secondary text-center" style={{maxWidth: '600px', margin: '0 auto'}}>
          Ajude-nos a melhorar a cidade atuando como {user.nome}.
        </p>
      </div>

      <form className="report-form glass-panel" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fotografia da Ocorrência</label>
          <div className="upload-area">
            <Camera size={48} className="upload-icon" />
            <span>Tirar Foto ou Carregar</span>
            <input type="file" className="file-input" accept="image/*" />
          </div>
        </div>

        <div className="form-group">
          <label>Município Alvo</label>
          <select className="form-control" required value={municipio} onChange={e => setMunicipio(e.target.value)}>
            <option value="" disabled>Onde ocorreu o problema?</option>
            {listaAutarquias.length === 0 ? (
               <option value="" disabled>A carregar base de dados...</option>
            ) : (
               listaAutarquias.map(aut => (
                  <option key={aut.id} value={aut.municipio}>
                    {aut.municipio} ({aut.nome})
                  </option>
               ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Localização Acoplada (GPS)</label>
          <div className="location-display">
            <MapPin size={20} color="var(--accent-primary)" />
            <span>{location}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Tipo de Problema</label>
          <select className="form-control" required value={category} onChange={e => setCategory(e.target.value)}>
            <option value="" disabled>Selecione uma categoria...</option>
            <option value="Buraco na Via">Buraco na Via</option>
            <option value="Falha Iluminacao">Falha de Iluminação</option>
            <option value="Lixo">Acumulação de Lixo</option>
            <option value="Sinalizacao">Sinalização Danificada</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="form-group">
          <label>Descrição Opcional</label>
          <textarea 
            className="form-control" 
            rows="3" 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Adicione detalhes úteis para a equipa da Câmara..."
          ></textarea>
        </div>

        <button type="submit" className="primary-btn submit-btn" disabled={loading || listaAutarquias.length === 0}>
          {loading ? 'A Enviar Azure...' : 'Enviar Reporte'}
        </button>
      </form>
    </div>
  );
};

export default Report;
