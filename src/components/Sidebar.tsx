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
    <aside className="w-64 glass-card border-r border-white/10 flex flex-col ios-shadow-sm">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 rounded-2xl p-2.5 ios-shadow-sm">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-foreground">ContaTienda</h2>
            <p className="text-xs text-foreground/60">Gestión Contable</p>
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
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
                "hover:bg-white/10",
                isActive
                  ? "bg-primary/20 text-primary font-semibold ios-shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;