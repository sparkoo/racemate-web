import "./app.css";
import { LocationProvider, Route, Router } from "preact-iso/router";
import Telemetry from "./components/Telemetry";
import LapListing from "./components/LapListing";
import Main from "./components/Main";

const App = () => {
  return (
    <div className={"h-screen flex flex-col overflow-hidden"}>
      <header className={"bg-gray-950 flex h-16"}>
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
      <main className={"flex-1 min-h-0"}>
        <LocationProvider>
          <Router>
            <Route path="/telemetry" component={Telemetry} />
            <Route path="/laps" component={LapListing} />
            <Route default component={Main} />
          </Router>
        </LocationProvider>
      </main>
    </div>
  );
};

export default App;
