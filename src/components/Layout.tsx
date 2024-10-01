import { ReactNode } from "react";
import DashboardHeader from "./LayoutHeader";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col w-screen min-h-screen">
      <DashboardHeader></DashboardHeader>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
