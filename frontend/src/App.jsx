import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';


function App() {

  const [currentUser, setCurrentUser] = useState(
      localStorage.getItem('user')
    );  // Store logged-in user

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setCurrentUser}/>} />
        <Route path="/dashboard" element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
