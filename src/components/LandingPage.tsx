import { FunctionComponent } from "preact";
import "./LandingPage.css";
import accLogo from "../assets/landing/acc-logo.svg";
import lmuLogo from "../assets/landing/lmu-logo.svg";

const LandingPage: FunctionComponent = () => {
  return (
    <div className="landing-page h-full flex flex-col items-center justify-center">
      <div className="hero-section text-center max-w-4xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Racemate</h1>
        <p className="text-xl mb-4">
          Track, analyze, and improve your racing performance with advanced telemetry tools
        </p>
        
        <div className="game-logos">
          <div className="game-logo">
            <img src={accLogo} alt="Assetto Corsa Competizione" width="200" height="80" />
          </div>
          <div className="game-logo coming-soon">
            <img src={lmuLogo} alt="Le Mans Ultimate" width="200" height="80" />
            <span className="coming-soon-badge">COMING SOON</span>
          </div>
        </div>
        
        <div className="cta-buttons flex flex-col md:flex-row gap-4 justify-center mb-12">
          <a 
            href="/laps" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Browse Laps
          </a>
          <a 
            href="/telemetry" 
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Analyze Telemetry
          </a>
        </div>
      </div>
      
      <div className="features-section w-full max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Racing Telemetry Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Lap Analysis</h3>
            <p>Compare your laps side by side with detailed metrics and visualizations to find the perfect racing line.</p>
          </div>
          
          <div className="feature-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Telemetry Graphs</h3>
            <p>View detailed telemetry data with interactive graphs for speed, throttle, brake, and more to optimize your performance.</p>
          </div>
          
          <div className="feature-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-blue-400">Track Visualization</h3>
            <p>See your racing line and performance metrics overlaid on track maps to identify areas for improvement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
