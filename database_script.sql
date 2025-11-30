-- =====================================================
-- SCRIPT DE BASE DE DATOS - CONTATIENDA
-- Sistema de Gestión Contable para Tiendas
-- =====================================================
-- Motor: PostgreSQL 
-- Fecha de creación: 2025-11-30
-- =====================================================

-- =====================================================
-- TABLA: ventas
-- Descripción: Almacena el registro de todas las ventas realizadas
-- =====================================================
CREATE TABLE public.ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto NUMERIC(10, 2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT ventas_monto_positivo CHECK (monto > 0)
);

-- Índices para optimizar consultas
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha DESC);
CREATE INDEX idx_ventas_created_at ON public.ventas(created_at DESC);

-- Comentarios de la tabla
COMMENT ON TABLE public.ventas IS 'Registro de ventas realizadas en la tienda';
COMMENT ON COLUMN public.ventas.id IS 'Identificador único de la venta';
COMMENT ON COLUMN public.ventas.monto IS 'Monto total de la venta en pesos';
COMMENT ON COLUMN public.ventas.fecha IS 'Fecha y hora de la venta';
COMMENT ON COLUMN public.ventas.notas IS 'Notas adicionales sobre la venta';
COMMENT ON COLUMN public.ventas.created_at IS 'Fecha de creación del registro';

-- =====================================================
-- TABLA: egresos
-- Descripción: Almacena el registro de todos los gastos realizados
-- =====================================================
CREATE TABLE public.egresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto NUMERIC(10, 2) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT egresos_monto_positivo CHECK (monto > 0),
    CONSTRAINT egresos_descripcion_no_vacia CHECK (length(trim(descripcion)) > 0)
);

-- Índices para optimizar consultas
CREATE INDEX idx_egresos_fecha ON public.egresos(fecha DESC);
CREATE INDEX idx_egresos_created_at ON public.egresos(created_at DESC);

-- Comentarios de la tabla
COMMENT ON TABLE public.egresos IS 'Registro de egresos y gastos de la tienda';
COMMENT ON COLUMN public.egresos.id IS 'Identificador único del egreso';
COMMENT ON COLUMN public.egresos.monto IS 'Monto del gasto en pesos';
COMMENT ON COLUMN public.egresos.descripcion IS 'Descripción detallada del gasto';
COMMENT ON COLUMN public.egresos.fecha IS 'Fecha y hora del egreso';
COMMENT ON COLUMN public.egresos.created_at IS 'Fecha de creación del registro';

-- =====================================================
-- TABLA: deudas
-- Descripción: Almacena el registro de deudas pendientes de clientes
-- =====================================================
CREATE TABLE public.deudas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprador TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT deudas_monto_positivo CHECK (monto > 0),
    CONSTRAINT deudas_comprador_no_vacio CHECK (length(trim(comprador)) > 0),
    CONSTRAINT deudas_estado_valido CHECK (estado IN ('pendiente', 'pagada', 'parcial'))
);

-- Índices para optimizar consultas
CREATE INDEX idx_deudas_estado ON public.deudas(estado);
CREATE INDEX idx_deudas_fecha ON public.deudas(fecha DESC);
CREATE INDEX idx_deudas_comprador ON public.deudas(comprador);
CREATE INDEX idx_deudas_created_at ON public.deudas(created_at DESC);

-- Comentarios de la tabla
COMMENT ON TABLE public.deudas IS 'Registro de cuentas pendientes y deudas de clientes';
COMMENT ON COLUMN public.deudas.id IS 'Identificador único de la deuda';
COMMENT ON COLUMN public.deudas.comprador IS 'Nombre del cliente deudor';
COMMENT ON COLUMN public.deudas.monto IS 'Monto adeudado en pesos';
COMMENT ON COLUMN public.deudas.estado IS 'Estado de la deuda: pendiente, pagada o parcial';
COMMENT ON COLUMN public.deudas.fecha IS 'Fecha en que se generó la deuda';
COMMENT ON COLUMN public.deudas.created_at IS 'Fecha de creación del registro';

-- =====================================================
-- SEGURIDAD: Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deudas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para ventas
CREATE POLICY "Permitir todo acceso a ventas" 
ON public.ventas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas de acceso para egresos
CREATE POLICY "Permitir todo acceso a egresos" 
ON public.egresos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas de acceso para deudas
CREATE POLICY "Permitir todo acceso a deudas" 
ON public.deudas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista: Resumen de ventas por día
CREATE OR REPLACE VIEW public.v_ventas_diarias AS
SELECT 
    DATE(fecha) as fecha,
    COUNT(*) as total_ventas,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio,
    MIN(monto) as venta_minima,
    MAX(monto) as venta_maxima
FROM public.ventas
GROUP BY DATE(fecha)
ORDER BY fecha DESC;

-- Vista: Resumen de egresos por día
CREATE OR REPLACE VIEW public.v_egresos_diarios AS
SELECT 
    DATE(fecha) as fecha,
    COUNT(*) as total_egresos,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio
FROM public.egresos
GROUP BY DATE(fecha)
ORDER BY fecha DESC;

-- Vista: Resumen de deudas por estado
CREATE OR REPLACE VIEW public.v_resumen_deudas AS
SELECT 
    estado,
    COUNT(*) as cantidad_deudas,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio
FROM public.deudas
GROUP BY estado;

-- Vista: Balance general
CREATE OR REPLACE VIEW public.v_balance_general AS
SELECT 
    'Ingresos (Ventas)' as concepto,
    SUM(monto) as monto
FROM public.ventas
UNION ALL
SELECT 
    'Egresos (Gastos)' as concepto,
    SUM(monto) * -1 as monto
FROM public.egresos
UNION ALL
SELECT 
    'Deudas Pendientes' as concepto,
    SUM(monto) as monto
FROM public.deudas
WHERE estado = 'pendiente';

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Comentar esta sección si no se requieren datos de prueba
-- =====================================================

-- Insertar ventas de ejemplo
INSERT INTO public.ventas (monto, fecha, notas) VALUES
(50000, '2025-01-15 10:30:00', 'Venta de productos varios'),
(75000, '2025-01-15 14:20:00', 'Venta al por mayor'),
(30000, '2025-01-16 09:15:00', 'Venta a cliente frecuente');

-- Insertar egresos de ejemplo
INSERT INTO public.egresos (monto, descripcion, fecha) VALUES
(20000, 'Compra de inventario', '2025-01-15 08:00:00'),
(15000, 'Pago de servicios públicos', '2025-01-16 10:00:00'),
(10000, 'Mantenimiento local', '2025-01-16 15:30:00');

-- Insertar deudas de ejemplo
INSERT INTO public.deudas (comprador, monto, estado, fecha) VALUES
('Juan Pérez', 40000, 'pendiente', '2025-01-14 16:00:00'),
('María González', 25000, 'parcial', '2025-01-15 11:00:00'),
('Carlos Rodríguez', 60000, 'pendiente', '2025-01-16 13:00:00');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
