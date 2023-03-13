import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/header';
import Main from '../components/Main';
import Login from '../components/LoginForm';
import Register from '../components/RegisterForm';
import Footer from '../components/footer';
import Error from '../components/error'
import jwtDecode from 'jwt-decode';
import CreateSnippet from '../components/CreateSnippet';
import EditPage from '../components/EditPage';

const Navigation = () => {
  // Get token from local storage and set it to state
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  if(token){
    // If token exists, decode it
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp < Date.now() / 1000) {
      localStorage.removeItem('authToken')
    } else {
      // token is still valid
    }
  }

  // Check for local token on mount and set it to state
  useEffect(() => {
    const localToken = localStorage.getItem('authToken');
    if (localToken) {
      setToken(localToken);
    }
  }, [])

  // Handle successful login by setting token in state and local storage
  const handleLoginSuccess = (token) => {
    setToken(token);
    localStorage.setItem('authToken', token);
  };

  // Handle logout by clearing token from state and local storage and reloading page
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    window.location.reload()
  };

  // Render router with routes and header/footer components
  return (
    <Router>
      <Header isLoggedIn={token !== null} onLogout={handleLogout} token={token}/>
      <Routes>
        <Route path="*" element={<Error />} />
        <Route path="/" element={<Main  isLoggedIn={token !== null} token={token}/>} />
        <Route path='/edit/:id' element={<EditPage token={token}/>} />
        <Route path='createsnippet' element={<CreateSnippet token={token} isLoggedIn={token !== null} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer title="*-*" description="code communication" />
    </Router>
  );
};

export default Navigation;
