import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, TrendingDown, Users, Store, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  currentPage?: string;
}

const Sidebar = ({ currentPage }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/ventas", icon: ShoppingCart, label: "Ventas" },
    { to: "/egresos", icon: TrendingDown, label: "Egresos" },
    { to: "/deudas", icon: Users, label: "Deudas" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 ios-shadow-sm backdrop-blur-xl">
      <div className="w-full px-4 md:px-6">
        <div className="flex flex-col md:items-center gap-3 md:gap-4 py-3 md:py-4">
          {/* Header con logo y menú hamburguesa */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-2xl p-2.5 ios-shadow-sm">
                <Store className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg md:text-xl text-foreground">ContaTienda</h2>
                <p className="text-xs text-foreground/60">Gestión Contable</p>
              </div>
            </div>
            
            {/* Menú hamburguesa para móvil */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <Menu className="w-6 h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-card border-white/10 w-[280px]">
                <div className="flex flex-col gap-4 mt-8">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentPage === link.to.replace("/", "");
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          "hover:bg-white/10",
                          isActive
                            ? "bg-primary/20 text-primary font-semibold ios-shadow-sm"
                            : "text-foreground/70 hover:text-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-base font-medium">{link.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Navegación desktop */}
          <div className="hidden md:flex items-center justify-center gap-3 w-full max-w-4xl">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.to.replace("/", "");
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center justify-center gap-2 px-8 py-3 rounded-xl transition-all flex-1",
                    "hover:bg-white/10",
                    isActive
                      ? "bg-primary/20 text-primary font-semibold ios-shadow-sm"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
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