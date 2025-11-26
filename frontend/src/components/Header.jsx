import { useNavigate } from 'react-router-dom'
import { getAuthHeaders } from '../utils/auth'

function Header({user}) {
  
const navigate = useNavigate();  
const firstLetter = user[0].toUpperCase();
const API_URL = import.meta.env.VITE_API_URL; // API URL prefix    
  
  
  const handleClick = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
          if (response.ok) {
            const data = await response.json();
            localStorage.removeItem('user');
            localStorage.removeItem('token');  // Remove JWT token
            navigate('/login');
            console.log('Log-out Succesfully:', data);
          } else {
           alert('Failed To Logout');
          }
      } catch (error) {
	       console.error('Error:', error);
      }
  };
  
  return (
        <div className="dashboard">
        <header className="dashboard-header">
            <h1>FinanceFlow</h1>
            <div className="user-info">
              <span className="welcome-text">Welcome back {user}!</span>
              <div className="user-avatar">{firstLetter}</div> 
              <button  onClick={handleClick} type="submit" className="logout-btn">
              <span>Logout</span>
              </button>
            </div>
          </header>
        </div>
    );
}

export default Header;
