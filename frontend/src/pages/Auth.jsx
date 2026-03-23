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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'council') {
        // Simulating hardcoded council login setup
        setTimeout(() => {
          setUser({ role: 'council', name: 'Gestor Municipal' });
        }, 500);
        return;
      }

      // Cidadão requests via API
      if (isLogin) {
        const res = await fetch(`/api/cidadaos/email/${email}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.erro || 'Falha no login');
        setUser({ ...data.dados, role: 'citizen' });
      } else {
        const res = await fetch('/api/cidadaos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: name, email })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.erro || 'Falha no registo');
        setUser({ ...data.dados, role: 'citizen' });
      }
    } catch (err) {
      setError(err.message);
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

        {error && <div className="badge-danger" style={{padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'left'}}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && role === 'citizen' && (
            <div className="form-group">
              <label>Nome Completo</label>
              <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" />
            </div>
          )}
          <div className="form-group">
            <label>Email {role==='council' && '(Simulação)'}</label>
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

        {role === 'citizen' && (
          <div className="auth-footer">
            <p>
              {isLogin ? "Ainda não tem conta? " : "Já tem uma conta? "}
              <span className="text-gradient toggle-link" onClick={() => {setIsLogin(!isLogin); setError('');}}>
                {isLogin ? "Registe-se aqui" : "Entre aqui"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
