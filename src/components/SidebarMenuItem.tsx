import { Link } from "react-router-dom";

interface SidebarMenuItemProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  isActive?: boolean;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export function SidebarMenuItem({
  label,
  icon: Icon,
  path,
  isActive = false,
  className = "",
  iconClassName = "",
  disabled = false,
}: SidebarMenuItemProps) {
  const baseClasses =
    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg mb-1";
  const activeClasses = isActive
    ? "bg-gray-100 text-gray-900"
    : "text-gray-600 hover:bg-gray-50";

  if (disabled) {
    return (
      <div className={`${baseClasses} text-gray-600 ${className}`}>
        <Icon className={`h-5 w-5 mr-3 ${iconClassName}`} />
        {label}
      </div>
    );
  }

  return (
    <Link
      to={path || "#"}
      className={`${baseClasses} ${activeClasses} ${className}`}
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </Link>
  );
}
