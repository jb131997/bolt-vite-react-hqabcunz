import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./index.css";
import { StripeProvider } from "./context/StripeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <StripeProvider>
        <Router>
          <App />
        </Router>
      </StripeProvider>
    </AuthProvider>
  </StrictMode>
);
