import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<any[]>([]);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (auth !== "true") {
      navigate("/");
    } else {
      fetchVentas();
      setupRealtimeSubscription();
    }
  }, [navigate]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("ventas-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ventas",
        },
        () => {
          fetchVentas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchVentas = async () => {
    const { data, error } = await supabase
      .from("ventas")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      toast.error("Error al cargar ventas");
    } else {
      setVentas(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("ventas").insert({
      monto: parseFloat(monto),
      fecha: new Date(fecha).toISOString(),
      notas: notas.trim() || null,
    });

    if (error) {
      toast.error("Error al registrar venta");
    } else {
      toast.success("Venta registrada exitosamente");
      setMonto("");
      setNotas("");
      setFecha(new Date().toISOString().split("T")[0]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ventas").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar venta");
    } else {
      toast.success("Venta eliminada");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar currentPage="ventas" />
      
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <header className="mb-4 md:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Registro de Ventas</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Gestiona tus ingresos</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchVentas} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Recargar</span>
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Nueva Venta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas (opcional)</Label>
                  <Textarea
                    id="notas"
                    placeholder="Descripción adicional..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? "Registrando..." : "Registrar Venta"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Historial de Ventas ({ventas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {ventas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay ventas registradas
                </p>
              ) : (
                <>
                  {/* Vista de tabla para desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Notas</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ventas.map((venta) => (
                          <TableRow key={venta.id}>
                            <TableCell>
                              {new Date(venta.fecha).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              ${parseFloat(venta.monto).toFixed(2)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {venta.notas || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(venta.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vista de cards para móvil */}
                  <div className="md:hidden space-y-3">
                    {ventas.map((venta) => (
                      <Card key={venta.id} className="glass-card ios-shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">
                                {new Date(venta.fecha).toLocaleDateString()}
                              </p>
                              <p className="text-2xl font-bold text-primary">
                                ${parseFloat(venta.monto).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(venta.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {venta.notas && (
                            <p className="text-sm text-foreground/70 mt-2">
                              {venta.notas}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Ventas;