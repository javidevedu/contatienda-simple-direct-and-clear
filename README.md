# ContaTienda - Sistema de Gestión Contable

Sistema moderno de gestión contable para tiendas de barrio, con sincronización en tiempo real y despliegue fácil en Vercel.

## 🚀 Características

- ✅ **Autenticación simple** con usuarios predefinidos
- 📊 **Dashboard interactivo** con gráficos y resumen
- 💰 **Registro de Ventas** con historial completo
- 📉 **Gestión de Egresos** para control de gastos
- 👥 **Control de Deudas** con estados (pendiente/pagado)
- 🔄 **Sincronización en tiempo real** entre dispositivos
- 📱 **Diseño responsive** y moderno
- ☁️ **Base de datos en la nube** con Lovable Cloud

## 🔐 Credenciales de Acceso

- Usuario: `u123` | Contraseña: `123`
- Usuario: `u1234` | Contraseña: `1234`

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Gráficos**: Recharts
- **Base de datos**: PostgreSQL (en la nube)

## 📦 Estructura de la Base de Datos

### Tabla: ventas
- `id` (UUID): Identificador único
- `monto` (DECIMAL): Monto de la venta
- `fecha` (TIMESTAMP): Fecha de la venta
- `notas` (TEXT): Notas opcionales
- `created_at` (TIMESTAMP): Fecha de creación

### Tabla: egresos
- `id` (UUID): Identificador único
- `monto` (DECIMAL): Monto del egreso
- `fecha` (TIMESTAMP): Fecha del egreso
- `descripcion` (TEXT): Descripción del gasto
- `created_at` (TIMESTAMP): Fecha de creación

### Tabla: deudas
- `id` (UUID): Identificador único
- `comprador` (TEXT): Nombre del comprador
- `monto` (DECIMAL): Monto de la deuda
- `fecha` (TIMESTAMP): Fecha de la deuda
- `estado` (TEXT): Estado (pendiente/pagado)
- `created_at` (TIMESTAMP): Fecha de creación

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno (automáticas con Lovable)
3. Despliega con un click
4. ¡Listo! Tu app está en producción

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📱 Funcionalidades por Módulo

### Dashboard
- Resumen de totales (ventas, egresos, deudas, balance)
- Gráfico de barras con últimos 6 meses
- Gráfico circular de distribución
- Botón de recarga manual

### Ventas
- Formulario de nueva venta (monto, fecha, notas)
- Tabla con historial completo
- Eliminación de registros
- Actualización en tiempo real

### Egresos
- Formulario de nuevo egreso (monto, fecha, descripción)
- Tabla con historial completo
- Eliminación de registros
- Actualización en tiempo real

### Deudas
- Formulario de nueva deuda (comprador, monto, fecha)
- Tabla de deudas pendientes
- Tabla de deudas pagadas
- Cambio de estado con un click
- Eliminación de registros

## 🎨 Diseño

La aplicación utiliza un sistema de diseño moderno con:
- Colores principales: Verde esmeralda (#3ECFA2) y Azul profesional
- Sidebar lateral con navegación clara
- Tarjetas con sombras suaves
- Animaciones fluidas
- Iconos de Lucide React

## 🔒 Seguridad

- Autenticación requerida para acceder
- Validación de formularios
- Row Level Security (RLS) habilitado
- Datos protegidos en la nube

## 📞 Soporte

Para más información sobre Lovable Cloud:
- [Documentación](https://docs.lovable.dev/features/cloud)
- [Comunidad Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

Desarrollado con ❤️ usando Lovable
