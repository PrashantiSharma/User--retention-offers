import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  const handleBookDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-24 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold leading-tight">QuillPilot: Your AI Co-Pilot for Marketers</h1>
          <p className="mt-6 text-xl">Supercharge your campaigns with AI-driven experimentation, real-time personalization, and autonomous optimization.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold shadow hover:bg-indigo-100"
            >
              Get Started
            </Button>
            <Button 
              onClick={handleBookDemo}
              variant="ghost"
              className="underline font-medium"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-extrabold text-indigo-600">457%</p>
            <p className="mt-2 text-lg">Growth in NPV per Customer</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold text-indigo-600">45%</p>
            <p className="mt-2 text-lg">Uplift in Cart Revenue</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold text-indigo-600">120%</p>
            <p className="mt-2 text-lg">Growth in Upsell ARPU</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Why Marketers Love QuillPilot</h2>
          <p className="mt-6 text-lg text-gray-600">Traditional tools are too slow, reactive, and gut-driven. QuillPilot brings insight, automation, and adaptability into your marketing stack.</p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">AI Agents for 1:1 Personalization</h3>
            <p className="mt-3 text-gray-600">Treat every customer as an individual — not a segment. Deliver hyper-personalized journeys at scale.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">Autonomous Optimization</h3>
            <p className="mt-3 text-gray-600">Let AI self-optimize your campaigns in real time based on what works — no manual tweaking needed.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">Continuous Learning</h3>
            <p className="mt-3 text-gray-600">AI adapts to customer behavior and market shifts on the fly — keeping your campaigns relevant always.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">Behavioral Intelligence</h3>
            <p className="mt-3 text-gray-600">Understand real-time customer intent and craft responses that convert better and faster.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">Scalable Experimentation</h3>
            <p className="mt-3 text-gray-600">Run dynamic A/B tests and campaign variants on autopilot, backed by AI insights.</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-2xl shadow">
            <h3 className="text-xl font-bold">From Campaigns to Continuous Engagement</h3>
            <p className="mt-3 text-gray-600">Move beyond static campaigns and into always-on, AI-adaptive marketing loops.</p>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-24 bg-indigo-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold">Get Started in 3 Simple Steps</h2>
          <ol className="mt-12 space-y-10">
            <li>
              <h3 className="text-xl font-semibold">1. Connect Your Data Sources</h3>
              <p className="text-gray-600">Integrate with Shopify, BigCommerce, CRMs and data warehouses in minutes.</p>
            </li>
            <li>
              <h3 className="text-xl font-semibold">2. Define Your Goals</h3>
              <p className="text-gray-600">Pick your outcomes — QuillPilot will experiment and optimize accordingly.</p>
            </li>
            <li>
              <h3 className="text-xl font-semibold">3. Launch Your Co-Pilot</h3>
              <p className="text-gray-600">Start seeing results — campaigns adapt in real-time without your team lifting a finger.</p>
            </li>
          </ol>
          <Button 
            onClick={handleGetStarted}
            className="mt-12 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow hover:bg-indigo-500"
          >
            Book a Pilot
          </Button>
        </div>
      </section>

      {/* Future Section */}
      <section className="bg-white py-16 text-center">
        <h2 className="text-2xl font-extrabold">The Future of Marketing is AI-Driven</h2>
        <p className="mt-4 max-w-xl mx-auto text-gray-600">QuillPilot shifts marketing from segments to individuals, from static campaigns to real-time engagement, from rules to autonomy.</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p> 2025 QuillPilot — Built by Marketers for Marketers.</p>
          <p className="mt-2">For investment or partnerships, contact founders@quillpilot.ai</p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Schedule a Demo</h3>
            {/* Add demo form here */}
            <Button 
              onClick={() => setShowDemoModal(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
