// Layout.tsx

import React from "react";
import DashboardHeader from "./LayoutHeader"; // or your header component

interface LayoutProps {
  hideHeader?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ hideHeader, children }) => {
  return (
    <div className="flex flex-col w-screen min-h-screen">
      {!hideHeader && <DashboardHeader />}
      <main className="flex-grow">{children}</main>
      {/* Optionally include a footer */}
    </div>
  );
};

export default Layout;
