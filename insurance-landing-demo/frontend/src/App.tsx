import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;

