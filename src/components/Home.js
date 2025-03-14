import React from 'react';
import '../styles/Home.css';
import tf2Logo from '../assets/tf2-logo.png';

const Home = () => {
  return (
    <div className="home-container">
      <div className="background">
        <div className="mountains"></div>
      </div>
      <div className="logo-container">
        <img src={tf2Logo} alt="Team Fortress 2 Logo" className="tf2-logo" />
      </div>
      <div className="content">
        <h1>True Quickplay</h1>
        <p>Bringing back the classic Team Fortress 2 experience!</p>
      </div>
    </div>
  );
};

export default Home;