import "./app.css";
import { LocationProvider, Route, Router } from "preact-iso/router";
import Telemetry from "./components/Telemetry";
import LapListing from "./components/LapListing";
import Main from "./components/Main";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className={"h-screen flex flex-col overflow-hidden"}>
        <Header />
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
    </AuthProvider>
  );
};

export default App;
