import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { AuthRoute } from "./components/AuthRoute";
import { Dashboard } from "./pages/Dashboard";
import { Members } from "./pages/Members";
import Auth from "./pages/Auth";
import Sales from "./pages/Sales";
import OnboardStripe from "./pages/OnboardStripe";
import { PrivateLayout } from "./layout/PrivateLayout";
import { RootLayout } from "./layout/RootLayout";
import ManageStripe from "./pages/ManageStripe";
import NotFound from "./pages/NotFound";
import ProductManagement from "./pages/ProductManagement";

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/members"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Members />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <Sales />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ProductManagement />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/onboard-stripe"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <OnboardStripe />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-stripe"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <ManageStripe />
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RootLayout>
  );
}
