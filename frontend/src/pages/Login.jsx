import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';


//Componenet Declartion 
const Login = () => {
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

	     const response = await fetch('http://127.0.0.1:5000/login', {
		      method:"POST",
		      headers: {"Content-Type": "application/json"},
		      body: JSON.stringify(formData),
	     });
    if (response.ok) {
	       const data = await response.json();
	       navigate('/dashboard');
          console.log(data);
    }else {
          navigate('/login');
    }
    }catch (error) {
	       console.error('Error:', error);
    }
    console.log('Login attempt:', formData);
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
        <p>Don't have an account? Register here. </p>
      </form>
    </div>
  );
};

export default Login;
