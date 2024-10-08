// AppRoutes.tsx

import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LoadingScreen from "./components/LoadingScreen";
import Layout from "./components/Layout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const CreateAuctionPage = lazy(() => import("./pages/CreateAuctionPage"));
const AuctionList = lazy(() => import("./components/AuctionList"));
const AuctionPage = lazy(() => import("./pages/AuctionPage"));

const AppRoutes = () => {
  const location = useLocation();

  // Define the routes that should not display certain layout components
  const noHeaderRoutes = ["/", "/register", "/login"];

  return (
    <Layout hideHeader={noHeaderRoutes.includes(location.pathname)}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/list" element={<AuctionList />} />
          <Route path="/create" element={<CreateAuctionPage />} />
          <Route path="/auction/:address" element={<AuctionPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default AppRoutes;
