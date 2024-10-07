// App.tsx

import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./components/AuthContext"; // If using AuthContext

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
