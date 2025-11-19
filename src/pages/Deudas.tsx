import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle, RefreshCw, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Deudas = () => {
  const navigate = useNavigate();
  const [deudas, setDeudas] = useState<any[]>([]);
  const [comprador, setComprador] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (auth !== "true") {
      navigate("/");
    } else {
      fetchDeudas();
      setupRealtimeSubscription();
    }
  }, [navigate]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("deudas-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deudas",
        },
        () => {
          fetchDeudas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchDeudas = async () => {
    const { data, error } = await supabase
      .from("deudas")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      toast.error("Error al cargar deudas");
    } else {
      setDeudas(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comprador.trim()) {
      toast.error("El nombre del comprador es obligatorio");
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("deudas").insert({
      comprador: comprador.trim(),
      monto: parseFloat(monto),
      fecha: new Date(fecha).toISOString(),
      estado: "pendiente",
    });

    if (error) {
      toast.error("Error al registrar deuda");
    } else {
      toast.success("Deuda registrada exitosamente");
      setComprador("");
      setMonto("");
      setFecha(new Date().toISOString().split("T")[0]);
    }
    setLoading(false);
  };

  const handleToggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "pendiente" ? "pagado" : "pendiente";
    const { error } = await supabase
      .from("deudas")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      toast.success(`Deuda marcada como ${nuevoEstado}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("deudas").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar deuda");
    } else {
      toast.success("Deuda eliminada");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const deudasPendientes = deudas.filter((d) => d.estado === "pendiente");
  const deudasPagadas = deudas.filter((d) => d.estado === "pagado");

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar currentPage="deudas" />
      
      <div className="container mx-auto px-6 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Deudas</h1>
              <p className="text-sm text-muted-foreground">Controla cuentas pendientes</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchDeudas} variant="outline" size="sm">
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
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Nueva Deuda</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comprador">Comprador *</Label>
                    <Input
                      id="comprador"
                      type="text"
                      placeholder="Nombre del comprador"
                      value={comprador}
                      onChange={(e) => setComprador(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto ($) *</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? "Registrando..." : "Registrar Deuda"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Deudas Pendientes ({deudasPendientes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {deudasPendientes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay deudas pendientes
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comprador</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudasPendientes.map((deuda) => (
                        <TableRow key={deuda.id}>
                          <TableCell className="font-medium">{deuda.comprador}</TableCell>
                          <TableCell className="font-semibold text-warning">
                            ${parseFloat(deuda.monto).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(deuda.fecha).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Pendiente</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleEstado(deuda.id, deuda.estado)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(deuda.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Deudas Pagadas ({deudasPagadas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {deudasPagadas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay deudas pagadas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Comprador</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudasPagadas.map((deuda) => (
                        <TableRow key={deuda.id}>
                          <TableCell className="font-medium">{deuda.comprador}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            ${parseFloat(deuda.monto).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(deuda.fecha).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge>Pagado</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleEstado(deuda.id, deuda.estado)}
                            >
                              Marcar pendiente
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(deuda.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Deudas;