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
      const usuarioTrim = usuario.trim();
      const contrasenaTrim = contrasena.trim();
      
      if (USUARIOS[usuarioTrim as keyof typeof USUARIOS] === contrasenaTrim) {
        sessionStorage.setItem("authenticated", "true");
        sessionStorage.setItem("usuario", usuarioTrim);
        toast.success("¡Bienvenido a ContaTienda!");
        navigate("/dashboard");
      } else {
        toast.error("Credenciales inválidas");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md ios-shadow">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center ios-shadow-sm">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight">ContaTienda</CardTitle>
          <CardDescription className="text-base text-foreground/70">
            Sistema de Gestión Contable
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-semibold">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingrese su usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="h-12 rounded-xl glass-card border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-sm font-semibold">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Ingrese su contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className="h-12 rounded-xl glass-card border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <div className="mt-6 p-5 glass-card rounded-xl">
            <p className="text-sm font-semibold text-foreground/80 text-center mb-3">
              Usuarios de prueba
            </p>
            <div className="text-sm text-foreground/60 space-y-2">
              <p className="text-center font-mono">u123 / 123</p>
              <p className="text-center font-mono">u1234 / 1234</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;