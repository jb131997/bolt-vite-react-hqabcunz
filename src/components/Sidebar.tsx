import {
  AlertCircle,
  BarChart2,
  Calendar,
  CreditCard,
  DollarSign,
  Home,
  Loader2,
  LogOut,
  Package,
  Settings,
  Users,
  Users2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStripe } from "../context/StripeContext";
import { supabase } from "../lib/supabase";
import { SidebarMenuItem } from "./SidebarMenuItem";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stripeAccount, loading } = useStripe();

  // Determine active state for menu items
  const isActive = (path: string) => location.pathname === path;

  // Sidebar menu items
  const SidebarMenuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Members", path: "/members" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: DollarSign, label: "Sales", path: "/sales" },
    { icon: Calendar, label: "Classes", path: "/classes" },
    { icon: Users2, label: "Staff", path: "/staff" },
    { icon: Package, label: "Products", path: "/products" }, // Added Products link
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Stripe link based on account status
  const stripeLink = loading ? (
    <SidebarMenuItem
      label="Loading..."
      icon={Loader2}
      iconClassName="animate-spin"
      disabled
    />
  ) : stripeAccount?.details_submitted ? (
    <SidebarMenuItem
      label="Manage Stripe"
      icon={CreditCard}
      path="/manage-stripe"
      isActive={isActive("/manage-stripe")}
    />
  ) : (
    <SidebarMenuItem
      label="Complete Onboarding"
      icon={AlertCircle}
      path="/onboard-stripe"
      isActive={isActive("/onboard-stripe")}
      className="text-orange-600 hover:bg-orange-50"
    />
  );

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Max Fitness</h1>
      </div>

      <nav className="mt-6 px-2">
        {SidebarMenuItems.map(({ icon: Icon, label, path }) => (
          <SidebarMenuItem
            key={path}
            label={label}
            icon={Icon}
            path={path}
            isActive={isActive(path)}
          />
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 space-y-1">
        {stripeLink}
        <SidebarMenuItem
          label="Settings"
          icon={Settings}
          path="/settings"
          isActive={isActive("/settings")}
        />
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

