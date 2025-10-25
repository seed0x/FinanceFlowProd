import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';

function App() {

  const [currentUser, setCurrentUser] = useState(
      localStorage.getItem('user')
    );  // Store logged-in user

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setCurrentUser}/>} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/dashboard" element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
