import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedCards from './components/FeaturedCards';
import Footer from './components/Footer';
import './styles/app.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-linear-to-b from-blue-100 to-white">
        <Header />
        <Hero />
        <FeaturedCards />
        <Footer />
      </div>
    </Router>
  );
};

export default App;