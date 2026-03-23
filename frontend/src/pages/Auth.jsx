import { useState } from 'react';
import { ShieldCheck, User, Building, Loader2 } from 'lucide-react';
import './Auth.css';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('citizen'); // 'citizen' or 'council'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [municipio, setMunicipio] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Ambas as roles (Cidadão e Autarquia) estão guardadas no mesmo container e podem ser lidas por email!
        const res = await fetch(`/api/cidadaos/email/${email}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.erro || 'Credenciais inválidas ou utilizador inexistente.');
        
        // Verifica se a role bate certo (se escolheu Autarquia, assegura que é Autarquia no Azure)
        const isCouncil = data.dados.tipoUtilizador === 'Autarquia';
        if (role === 'council' && !isCouncil) throw new Error('Esta conta pertence a um Cidadão.');
        if (role === 'citizen' && isCouncil) throw new Error('Esta conta pertence a uma Autarquia.');
        
        setUser({ ...data.dados, role: isCouncil ? 'council' : 'citizen' });
      } else {
        // Fluxo de Registo Frontal ligado para o CosmosDB
        if (role === 'council') {
          const res = await fetch('/api/autarquias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: name, email, municipio })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.erro || 'Falha no registo da Autarquia');
          
          setUser({ ...data.dados, role: 'council' });
        } else {
          const res = await fetch('/api/cidadaos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: name, email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.erro || 'Falha no registo do Cidadão');
          
          setUser({ ...data.dados, role: 'citizen' });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <ShieldCheck size={48} color="var(--accent-primary)" style={{margin: '0 auto 1rem'}} />
          <h2>{isLogin ? 'Bem-vindo de volta' : 'Registar Conta CityGuards'}</h2>
          <p className="text-secondary">Escolha o seu tipo de acesso.</p>
        </div>

        <div className="role-selector">
          <button 
            type="button"
            className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => { setRole('citizen'); setError(''); }}
          >
            <User size={20} /> Cidadão
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'council' ? 'active' : ''}`}
            onClick={() => { setRole('council'); setError(''); }}
          >
            <Building size={20} /> Autarquia
          </button>
        </div>

        {error && <div className="badge-danger" style={{padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)'}}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nome {role === 'council' ? 'da Entidade' : 'Completo'}</label>
                <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} placeholder={role === 'council' ? 'Câmara Municipal de X' : 'Ex: João Silva'} />
              </div>
              {role === 'council' && (
                <div className="form-group">
                  <label>Município</label>
                  <input type="text" className="form-control" required value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Distrito ou Concelho" />
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label>Email Oficial</label>
            <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label>Palavra-passe</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="primary-btn auth-submit" disabled={loading}>
            {loading ? <Loader2 className="spinning" size={20} /> : (isLogin ? 'Entrar na Plataforma' : 'Registar Conta')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Ainda não tem conta? " : "Já tem uma conta? "}
            <span className="text-gradient toggle-link" onClick={() => {setIsLogin(!isLogin); setError('');}}>
              {isLogin ? "Registe-se aqui" : "Entre aqui"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
