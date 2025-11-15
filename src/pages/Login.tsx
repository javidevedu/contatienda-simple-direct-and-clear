import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Store } from "lucide-react";

const USUARIOS = {
  u123: "123",
  u1234: "1234",
};

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (USUARIOS[usuario as keyof typeof USUARIOS] === contrasena) {
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.setItem("usuario", usuario);
        toast.success("¡Bienvenido a ContaTienda!");
        navigate("/dashboard");
      } else {
        toast.error("Credenciales inválidas");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">ContaTienda</CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión Contable para Tiendas de Barrio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingrese su usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Ingrese su contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className="transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-all"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-2">
              <strong>Usuarios de prueba:</strong>
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="text-center">• u123 / 123</p>
              <p className="text-center">• u1234 / 1234</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;