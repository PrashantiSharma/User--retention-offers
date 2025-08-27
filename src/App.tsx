import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import PersonalizationTest from './test/PersonalizationTest';
import ChannelIntegrationManager from './components/channels/ChannelIntegrationManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/test" element={<PersonalizationTest />} />
        <Route path="/channels" element={<ChannelIntegrationManager />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
