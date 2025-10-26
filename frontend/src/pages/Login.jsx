import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL; // API URL prefix
//Componenet Declartion 
const Login = ({ setUser }) => {
  
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
                credentials: 'include',           
	     });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', data.user);
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
        <p>Don't have an account? <Link to="/Signup"> Sign up here. </Link> </p>
      </form>
    </div>
  );
};

export default Login;
