import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';

import About from './About';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';
import Product from './Product';  // Import the Product component
import TryOn3D from './TryOn3D';  // Import the TryOn3D component
import './App.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-content">
      <h1>Welcome to Our App</h1>
      <p>Discover amazing features and start using our app today.</p>
      <button onClick={() => navigate('/home')} className="cta-button">
        Get Started
      </button>
    </div>
  );
};

function App() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleOpenSignup = () => {
    setIsSignupOpen(true);
  };

  const handleCloseSignup = () => {
    setIsSignupOpen(false);
  };

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/home#contact-details">Contact</Link>  {/* Link to the contact section */}
            </li>
            <li>
              <button onClick={handleOpenSignup}>Sign Up</button>
            </li>
            <li>
              <button onClick={handleOpenLogin}>Log In</button>
            </li>
            <li>
              <Link to="/tryon3d">Try on 3D</Link> {/* Add the Try on 3D link */}
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />  {/* Add the Product route */}
          <Route path="/tryon3d" element={<TryOn3D />} />  {/* Add the TryOn3D route */}
        </Routes>
        {isSignupOpen && <Signup onClose={handleCloseSignup} />}
        {isLoginOpen && <Login onClose={handleCloseLogin} />}
      </div>
    </Router>
  );
}

export default App;
