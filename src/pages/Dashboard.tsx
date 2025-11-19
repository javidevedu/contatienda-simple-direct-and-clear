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
    const last12Months = [];

    for (let i = 11; i >= 0; i--) {
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

      last12Months.push({
        mes: month,
        ventas: ventasMes,
        egresos: egresosMes,
      });
    }

    return last12Months;
  };

  const pieData = [
    { name: "Ventas", value: totalVentas, color: "hsl(var(--primary))" },
    { name: "Egresos", value: totalEgresos, color: "hsl(var(--destructive))" },
  ];

  // Datos para distribución por días del mes
  const getDailyData = () => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const ventasDia = ventas.filter(v => {
        const fecha = new Date(v.fecha);
        return fecha.getDate() === day && 
               fecha.getMonth() === new Date().getMonth() &&
               fecha.getFullYear() === new Date().getFullYear();
      }).reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);

      const egresosDia = egresos.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getDate() === day && 
               fecha.getMonth() === new Date().getMonth() &&
               fecha.getFullYear() === new Date().getFullYear();
      }).reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

      dailyData.push({
        dia: day,
        ventas: ventasDia,
        egresos: egresosDia,
      });
    }

    return dailyData;
  };

  const getDailyTotals = () => {
    const data = getDailyData();
    const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
    const totalEgresos = data.reduce((sum, d) => sum + d.egresos, 0);
    return {
      ventas: totalVentas,
      egresos: totalEgresos,
      balance: totalVentas - totalEgresos
    };
  };

  // Datos para distribución por horas del día
  const getHourlyData = () => {
    const hourlyData = [];
    const today = new Date();

    for (let hour = 0; hour < 24; hour++) {
      const ventasHora = ventas.filter(v => {
        const fecha = new Date(v.fecha);
        return fecha.getHours() === hour &&
               fecha.getDate() === today.getDate() &&
               fecha.getMonth() === today.getMonth() &&
               fecha.getFullYear() === today.getFullYear();
      }).reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);

      const egresosHora = egresos.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getHours() === hour &&
               fecha.getDate() === today.getDate() &&
               fecha.getMonth() === today.getMonth() &&
               fecha.getFullYear() === today.getFullYear();
      }).reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

      hourlyData.push({
        hora: `${hour}:00`,
        ventas: ventasHora,
        egresos: egresosHora,
      });
    }

    return hourlyData;
  };

  const getHourlyTotals = () => {
    const data = getHourlyData();
    const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
    const totalEgresos = data.reduce((sum, d) => sum + d.egresos, 0);
    return {
      ventas: totalVentas,
      egresos: totalEgresos,
      balance: totalVentas - totalEgresos
    };
  };

  // Datos para distribución por días de la semana
  const getWeeklyData = () => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const weeklyData = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const ventasDia = ventas.filter(v => {
        const fecha = new Date(v.fecha);
        return fecha.getDay() === dayIndex;
      }).reduce((sum, v) => sum + parseFloat(v.monto || 0), 0);

      const egresosDia = egresos.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getDay() === dayIndex;
      }).reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

      weeklyData.push({
        dia: days[dayIndex],
        ventas: ventasDia,
        egresos: egresosDia,
      });
    }

    // Reordenar para que empiece en Lunes
    return [...weeklyData.slice(1), weeklyData[0]];
  };

  const getWeeklyTotals = () => {
    const data = getWeeklyData();
    const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
    const totalEgresos = data.reduce((sum, d) => sum + d.egresos, 0);
    return {
      ventas: totalVentas,
      egresos: totalEgresos,
      balance: totalVentas - totalEgresos
    };
  };

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
    <div className="min-h-screen bg-muted/30">
      <Sidebar currentPage="dashboard" />
      
      <div className="container mx-auto px-6 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
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

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-foreground/80">Total Ventas</CardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${totalVentas.toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  {ventas.length} registros
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-foreground/80">Total Egresos</CardTitle>
                <TrendingDown className="w-5 h-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  ${totalEgresos.toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  {egresos.length} registros
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-foreground/80">Deudas Pendientes</CardTitle>
                <Users className="w-5 h-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  ${totalDeudas.toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  {deudas.filter(d => d.estado === "pendiente").length} pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-foreground/80">Balance</CardTitle>
                <DollarSign className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                  ${balance.toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  Ventas - Egresos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Ventas vs Egresos (Últimos 12 meses)</CardTitle>
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
                <CardTitle>Distribución de Ingresos y Gastos (Últimos 12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                    Balance: ${balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {balance >= 0 ? "Positivo ✓" : "Negativo ✗"}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Distribución mensual (días)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getDailyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
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
                <CardTitle>Distribución mensual - Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className={`text-2xl font-bold ${getDailyTotals().balance >= 0 ? "text-primary" : "text-destructive"}`}>
                    Balance: ${getDailyTotals().balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getDailyTotals().balance >= 0 ? "Positivo ✓" : "Negativo ✗"}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Ventas", value: getDailyTotals().ventas, color: "hsl(var(--primary))" },
                        { name: "Egresos", value: getDailyTotals().egresos, color: "hsl(var(--destructive))" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Distribución diaria (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getHourlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
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
                <CardTitle>Distribución diaria - Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className={`text-2xl font-bold ${getHourlyTotals().balance >= 0 ? "text-primary" : "text-destructive"}`}>
                    Balance: ${getHourlyTotals().balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getHourlyTotals().balance >= 0 ? "Positivo ✓" : "Negativo ✗"}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Ventas", value: getHourlyTotals().ventas, color: "hsl(var(--primary))" },
                        { name: "Egresos", value: getHourlyTotals().egresos, color: "hsl(var(--destructive))" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Distribución semanal (Lun-Dom)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
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
                <CardTitle>Distribución semanal - Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className={`text-2xl font-bold ${getWeeklyTotals().balance >= 0 ? "text-primary" : "text-destructive"}`}>
                    Balance: ${getWeeklyTotals().balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getWeeklyTotals().balance >= 0 ? "Positivo ✓" : "Negativo ✗"}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Ventas", value: getWeeklyTotals().ventas, color: "hsl(var(--primary))" },
                        { name: "Egresos", value: getWeeklyTotals().egresos, color: "hsl(var(--destructive))" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
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