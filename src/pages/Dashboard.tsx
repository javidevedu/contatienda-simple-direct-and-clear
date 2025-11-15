import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, TrendingUp, TrendingDown, Users, DollarSign, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from "@/components/Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<any[]>([]);
  const [egresos, setEgresos] = useState<any[]>([]);
  const [deudas, setDeudas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (auth !== "true") {
      navigate("/");
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ventasRes, egresosRes, deudasRes] = await Promise.all([
        supabase.from("ventas").select("*").order("fecha", { ascending: false }),
        supabase.from("egresos").select("*").order("fecha", { ascending: false }),
        supabase.from("deudas").select("*").order("fecha", { ascending: false }),
      ]);

      if (ventasRes.data) setVentas(ventasRes.data);
      if (egresosRes.data) setEgresos(egresosRes.data);
      if (deudasRes.data) setDeudas(deudasRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);
  const totalEgresos = egresos.reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);
  const totalDeudas = deudas
    .filter(d => d.estado === "pendiente")
    .reduce((sum, d) => sum + parseFloat(d.monto || 0), 0);
  const balance = totalVentas - totalEgresos;

  // Datos para gráfico mensual
  const getMonthlyData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const currentMonth = new Date().getMonth();
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      
      const ventasMes = ventas.filter(v => {
        const fecha = new Date(v.fecha);
        return fecha.getMonth() === monthIndex;
      }).reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);

      const egresosMes = egresos.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getMonth() === monthIndex;
      }).reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

      last6Months.push({
        mes: month,
        ventas: ventasMes,
        egresos: egresosMes,
      });
    }

    return last6Months;
  };

  const pieData = [
    { name: "Ventas", value: totalVentas, color: "hsl(var(--primary))" },
    { name: "Egresos", value: totalEgresos, color: "hsl(var(--destructive))" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage="dashboard" />
      <div className="flex-1 overflow-auto bg-muted/30">
        <header className="sticky top-0 z-10 bg-background border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Usuario: {sessionStorage.getItem("usuario")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${totalVentas.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {ventas.length} registros
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  ${totalEgresos.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {egresos.length} registros
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Deudas Pendientes</CardTitle>
                <Users className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  ${totalDeudas.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {deudas.filter(d => d.estado === "pendiente").length} pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                  ${balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas - Egresos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Ventas vs Egresos (Últimos 6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ventas" fill="hsl(var(--primary))" name="Ventas" />
                    <Bar dataKey="egresos" fill="hsl(var(--destructive))" name="Egresos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Distribución de Ingresos y Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;