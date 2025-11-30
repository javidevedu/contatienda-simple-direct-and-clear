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
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 ios-shadow-sm backdrop-blur-xl">
      <div className="w-full px-3 md:px-6">
        <div className="flex flex-col md:items-center gap-2 md:gap-4 py-2 md:py-4">
          {/* Header con logo - más pequeño en móvil */}
          <div className="flex items-center justify-center md:justify-start">
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="bg-primary/20 rounded-lg md:rounded-2xl p-1 md:p-2.5 ios-shadow-sm">
                <Store className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-xs md:text-xl text-foreground">ContaTienda</h2>
                <p className="text-[10px] md:text-xs text-foreground/60 hidden md:block">Gestión Contable</p>
              </div>
            </div>
          </div>
          
          {/* Navegación - siempre visible, compacta en móvil */}
          <div className="flex items-center justify-center gap-1 md:gap-3 w-full max-w-4xl">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.to.replace("/", "");
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-2 py-1.5 md:px-8 md:py-3 rounded-lg md:rounded-xl transition-all flex-1",
                    "hover:bg-white/10",
                    isActive
                      ? "bg-primary/20 text-primary font-semibold ios-shadow-sm"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-sm font-medium">{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;