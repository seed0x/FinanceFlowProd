import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // using same styles for now might put into Signup.css later 

 const API_URL = import.meta.env.VITE_API_URL; // API URL prefix

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
	     const response = await fetch(`${API_URL}/signup`, {
		        method:"POST",
		        headers: {"Content-Type": "application/json"},
		        body: JSON.stringify(formData),
	     });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', data.user);
            localStorage.setItem('token', data.token);  // Store JWT token
            navigate('/dashboard');  // Auto-login after signup
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
        <h2>Sign Up</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Create Account</button>
        <p className="helper-text">
          Already have an account? <Link to="/login">Login here.</Link>
        </p>
      </form>
    </div>
  );
}
