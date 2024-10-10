// App.tsx

import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./components/AuthContext";
import { AuctionProvider } from "./components/AuctionContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuctionProvider>
          <AppRoutes />
        </AuctionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
