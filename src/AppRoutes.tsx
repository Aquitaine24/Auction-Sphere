// AppRoutes.tsx

import { Route, Routes, useLocation } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";

import Layout from "./components/Layout";

const AppRoutes = () => {
  const location = useLocation();

  // Define the routes that should not display certain layout components
  const noHeaderRoutes = ["/", "/register", "/login"];

  return (
    <Layout hideHeader={noHeaderRoutes.includes(location.pathname)}>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
