import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Se Não Logado */}
            {!user ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth setUser={setUser} />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            ) : user.role === 'council' ? (
              /* Perfil Autarquia */
              <>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              /* Perfil Cidadão */
              <>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<Report user={user} />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
