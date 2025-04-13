import "./app.css";
import { LocationProvider, Route, Router } from "preact-iso/router";
import Telemetry from "./components/Telemetry";
import LapListing from "./components/LapListing";
import Main from "./components/Main";

const App = () => {
  return (
    <>
      <header className={"bg-gray-950 sticky top-0 z-10 flex h-16"}>
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
      <main className={"flex-grow"}>
        <div className={"h-full"}>
          <LocationProvider>
            <Router>
              <Route path="/telemetry" component={Telemetry} />
              <Route path="/laps" component={LapListing} />
              <Route default component={Main} />
            </Router>
          </LocationProvider>
        </div>
      </main>
    </>
  );
};

export default App;
