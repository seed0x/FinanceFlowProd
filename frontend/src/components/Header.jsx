function Header({user}) {
const firstLetter = user[0].toUpperCase();
    
    return (
        <div className="dashboard">
        <header className="dashboard-header">
            <h1>FinanceFlow</h1>
            <div className="user-info">
            <span className="welcome-text">Welcome back {user}!</span>
              <div className="user-avatar">{firstLetter}</div>
            </div>
          </header>
        </div>
    );
}

export default Header;
