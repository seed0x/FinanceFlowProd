import { useNavigate } from 'react-router-dom'

function Header({user}) {
  
const navigate = useNavigate();  
const firstLetter = user[0].toUpperCase();
const API_URL = import.meta.env.VITE_API_URL; // API URL prefix    
  
  
  const handleClick = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
          if (response.ok) {
            const data = await response.json();
            
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
          </header>
        </div>
    );
}

export default Header;
