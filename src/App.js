import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './components/Home';
import Servers from './components/Servers';
import Social from './components/Social';
import Footer from './components/Footer';
import './App.css';

function App() {
  // Use basename for GitHub Pages - this needs to match the repository name in your homepage URL
  const basename = process.env.NODE_ENV === 'production' ? '/truequickplay' : '';
  
  return (
    <Router basename={basename}>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/social" element={<Social />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;