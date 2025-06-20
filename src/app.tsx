import "./app.css";
import { LocationProvider, Route, Router } from "preact-iso/router";
import Telemetry from "./components/Telemetry";
import LapListing from "./components/LapListing";
import Main from "./components/Main";
import Header from "./components/Header";
import Profile from "./components/Profile";
import LandingPage from "./components/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className={"h-screen flex flex-col overflow-hidden"}>
        <Header />
        <main className={"flex-1 min-h-0 overflow-hidden"}>
          <LocationProvider>
            <div className="h-full overflow-hidden">
              <Router>
                {[
                  <Route path="/telemetry" component={Telemetry} />,
                  <Route path="/laps" component={LapListing} />,
                  <Route path="/profile" component={Profile} />,
                  <Route path="/dashboard" component={Main} />,
                  <Route default component={LandingPage} />
                ]}
              </Router>
            </div>
          </LocationProvider>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
