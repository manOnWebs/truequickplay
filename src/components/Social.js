import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Social.css';
// Import the image directly to let webpack handle it
import hammMannImage from '../assets/hammmann.jpg';

const Social = () => {
  return (
    <div className="social-container">
      <div className="social-header">
        <h1>The TrueQuickplay Movement</h1>
        <p className="subtitle">A community initiative to bring back the spirit of TF2's original Quickplay</p>
      </div>
      
      <div className="founder-section">
        <h2>About the Founder</h2>
        <div className="founder-content">
          <div className="founder-image">
            <img src={hammMannImage} alt="Hamm Mann" />
            <p>Hamm Mann - Founder of TrueQuickplay</p>
          </div>
          <div className="founder-description">
            <p>
              The TrueQuickplay movement was started by YouTuber <strong>Hamm Mann</strong>, who recognized the 
              need for a better way to find and join community servers in Team Fortress 2 after the removal 
              of the original Quickplay system.
            </p>
            <p>
              Hamm Mann's vision was to create a simple, accessible way for players to find vanilla TF2 
              gameplay without the frustrations of Casual matchmaking or the overwhelming modifications 
              found on many community servers.
            </p>
            <p>
            He also wanted to find a method to populate the game's less popular maps without relying on 
            the server equivalent of a dice roll by hoping someone was already hosting it.
            </p>
            <p>
            With the addition of the Steam Networking feature, he saw an opening to bring back what was lost in 
            the Meet Your Match update, and after a lucky break with the algorithm, he made the most of it.
            </p>
            <p>
              Through his YouTube channel and community engagement, Hamm Mann has inspired TF2 players to 
              host their own servers with the "truequickplay" tag, creating a growing network of 
              player-hosted servers that offer the authentic TF2 experience.
            </p>
          </div>
        </div>
      </div>
      
      <div className="social-links-section">
        <h2>Connect with Hamm Mann</h2>
        <div className="social-links">
          <a href="https://www.youtube.com/@HammMann" target="_blank" rel="noopener noreferrer" className="social-link youtube">
            <i className="fab fa-youtube"></i>
            <span>YouTube</span>
          </a>
          <a href="https://steamcommunity.com/id/HammMann" target="_blank" rel="noopener noreferrer" className="social-link steam">
            <i className="fab fa-steam"></i>
            <span>Steam</span>
          </a>
          <a href="https://discord.gg/pnBbJg2tZf" target="_blank" rel="noopener noreferrer" className="social-link discord">
            <i className="fab fa-discord"></i>
            <span>Discord</span>
          </a>
        </div>
      </div>
      
      <div className="join-movement-section">
        <h2>Join the Movement</h2>
        <p>
          Want to be part of TrueQuickplay? It's easy! Just create a TF2 server with the tag "truequickplay" 
          and you'll automatically be listed on this site. Check out our <Link to="/servers">Servers</Link> page 
          for more information on how to set up your own server.
        </p>
        <p>
          Together, we can bring back the golden days of TF2 gameplay - one server at a time!
        </p>
      </div>
    </div>
  );
};

export default Social;