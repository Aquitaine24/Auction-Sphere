import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import Layout from "./components/Layout";

const AppRoutes = () => {
  const location = useLocation();

  // Define the routes that should not have the layout
  const noLayoutRoutes = ["/", "/register", "/login"];

  return (
    <>
      {!noLayoutRoutes.includes(location.pathname) ? (
        <Layout>
          <Routes>
            <Route path="/home" element={<HomePage />}></Route>
          </Routes>
        </Layout>
      ) : (
        <Routes>
          {/* Put pages here that should not have the dashboard header (make sure path is in noLayoutRoutes too) */}
          <Route path="/register" element={<RegisterPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
