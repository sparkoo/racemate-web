import "./app.css";
import { LocationProvider, Route, Router } from "preact-iso/router";
import Telemetry from "./components/Telemetry";
import LapListing from "./components/LapListing";
import Main from "./components/Main";

const App = () => {
  return (
    <>
      <header class="bg-gray-950 grid grid-cols-2">
        <div>
          <a href="/" class="logo">
            RaceMate
          </a>
        </div>
        <nav>
          <a class="" href="/laps">
            Laps
          </a>
        </nav>
      </header>
      <main>
        <LocationProvider>
          <Router>
            <Route path="/telemetry" component={Telemetry} />
            <Route path="/laps" component={LapListing} />
            <Route default component={Main} />
          </Router>
        </LocationProvider>
      </main>
    </>
  );
};

export default App;
