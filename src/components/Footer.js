import React from 'react';
// Removing the unused Link import
import '../styles/Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-bottom">
        <p>&copy; {year} True Quickplay. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;