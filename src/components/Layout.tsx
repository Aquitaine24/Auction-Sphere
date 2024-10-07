// Layout.tsx

import React from "react";
import DashboardHeader from "./LayoutHeader";

interface LayoutProps {
  hideHeader?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ hideHeader, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <DashboardHeader />}
      <main className="flex-grow">{children}</main>
      {/* Optionally include a footer */}
    </div>
  );
};

export default Layout;
