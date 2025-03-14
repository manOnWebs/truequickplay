import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">True Quickplay</Link>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/servers">Servers</Link></li>
          <li><Link to="/social">Social Media</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;