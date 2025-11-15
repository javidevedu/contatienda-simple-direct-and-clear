import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, TrendingDown, Users, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage?: string;
}

const Sidebar = ({ currentPage }: SidebarProps) => {
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/ventas", icon: ShoppingCart, label: "Ventas" },
    { to: "/egresos", icon: TrendingDown, label: "Egresos" },
    { to: "/deudas", icon: Users, label: "Deudas" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r shadow-lg flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-accent rounded-lg p-2">
            <Store className="w-6 h-6 text-sidebar-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-sidebar-foreground">ContaTienda</h2>
            <p className="text-xs text-sidebar-foreground/80">Gestión Contable</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPage === link.to.replace("/", "");
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/80"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;