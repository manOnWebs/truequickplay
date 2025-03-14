import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Servers from './components/Servers';
import Social from './components/Social';
import './App.css';

function App() {
  // Use basename for GitHub Pages
  const basename = process.env.NODE_ENV === 'production' ? '/TrueQuickplay' : '';
  
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
