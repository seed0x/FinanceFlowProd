import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL; // API URL prefix
//Componenet Declartion 
const Login = ({ setUser }) => {
  const [showPaywall, setShowPaywall] = useState(true);
  
  const [formData, setFormData] = useState({
    user: '',
    password: ''
  });
  
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
	     const response = await fetch(`${API_URL}/login`, {
		        method:"POST",
		        headers: {"Content-Type": "application/json"},
		        body: JSON.stringify(formData),
	     });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', data.user);
            localStorage.setItem('token', data.token);  // Store JWT token
            setUser(data.user);
            navigate('/dashboard');
          } else {
            alert('Invalid credentials');
          }
      } catch (error) {
	       console.error('Error:', error);
      }
  };

  return (
    <div className="login-page">
      {showPaywall && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '10px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</h1>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Premium Feature</h2>
            <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
              Logging in is a <strong>premium feature</strong>.
              <br />
              Upgrade to FinanceFlow Pro for only <strong>$99.99/month</strong>!
            </p>
            <button
              onClick={() => setShowPaywall(false)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Upgrade Now
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
              Click to dismiss this paywall
            </p>
          </div>
        </div>
      )}
      <form className="login-container" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input 
          type="text" 
          name="user" 
          placeholder="Username" 
          value={formData.user}
          onChange={handleInputChange}
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleInputChange}
          required 
        />
        <button type="submit">Login</button>
        <p className="helper-text">Don't have an account? <Link to="/signup"> Sign up here. </Link> </p>
      </form>
    </div>
  );
};

export default Login;
