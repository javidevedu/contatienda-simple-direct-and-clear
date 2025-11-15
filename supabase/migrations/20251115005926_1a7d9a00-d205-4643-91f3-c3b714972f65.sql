-- Tabla de Ventas
CREATE TABLE public.ventas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Egresos
CREATE TABLE public.egresos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  descripcion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Deudas
CREATE TABLE public.deudas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comprador TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deudas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acceso público para esta aplicación simple)
CREATE POLICY "Permitir todo acceso a ventas"
  ON public.ventas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todo acceso a egresos"
  ON public.egresos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todo acceso a deudas"
  ON public.deudas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ventas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.egresos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deudas;

-- Crear índices para mejor rendimiento
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha DESC);
CREATE INDEX idx_egresos_fecha ON public.egresos(fecha DESC);
CREATE INDEX idx_deudas_fecha ON public.deudas(fecha DESC);
CREATE INDEX idx_deudas_estado ON public.deudas(estado);