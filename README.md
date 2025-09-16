# ExpenseWise - Sistema de Gestión de Gastos

## 📊 **Estado del Proyecto**

✅ **APLICACIÓN FUNCIONAL** - Los problemas P0 críticos han sido solucionados:

- ✅ **RLS Policies Fixed**: Sin más recursión infinita
- ✅ **Supabase Storage**: Upload de archivos funcional  
- ✅ **Error Boundary**: Manejo robusto de errores
- ✅ **Auth Mejorado**: Retry logic y mejor UX
- ✅ **TypeScript/ESLint**: Reglas más estrictas

---

## 🚀 **Quick Start**

```bash
# Instalar dependencias
npm install

# Desarrollo (puerto 8080)
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## 🏗️ **Stack Tecnológico**

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State**: React Query + Context API
- **Forms**: React Hook Form + Zod validation
- **Auth**: Supabase Auth con RLS policies

---

## 📁 **Estructura del Proyecto**

```
src/
├── components/          # Componentes UI y layout
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Layout principal con auth
│   ├── Navigation.tsx  # Header/navegación
│   └── ErrorBoundary.tsx # Manejo global de errores
├── pages/              # Páginas de la aplicación
│   ├── Dashboard.tsx   # Dashboard principal con KPIs
│   ├── UploadReceipt.tsx # Upload y extracción IA
│   ├── Settings.tsx    # Configuración de usuario
│   └── Auth.tsx        # Login/registro
├── hooks/              # React hooks personalizados
│   ├── use-auth.tsx    # Autenticación y perfil
│   └── use-toast.ts    # Notificaciones
├── integrations/
│   └── supabase/       # Cliente y tipos de Supabase
├── types/              # Definiciones de tipos
└── lib/                # Utilidades
```

---

## 🔧 **Scripts Recomendados**

Agrega estos scripts útiles a tu `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint:fix": "eslint . --fix",
    "test": "echo \"No tests configured yet\"",
    "build:analyze": "echo \"Bundle analyzer not configured\"",
    "preview:network": "vite preview --host"
  }
}
```

---

## 🔑 **Variables de Entorno**

Crea un archivo `.env.local` (NO subas a git):

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="qvzoqglsnfqnifwlqblb"
VITE_SUPABASE_URL="https://qvzoqglsnfqnifwlqblb.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"

# Para Edge Functions (configurar en Supabase Dashboard)
GEMINI_API_KEY="tu-gemini-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-key"
```

---

## 🔒 **Seguridad y Permisos**

### **Roles de Usuario**
- **EMPLOYEE**: Crear y ver sus propios gastos
- **APPROVER**: Aprobar/rechazar gastos + funciones de EMPLOYEE  
- **ADMIN**: Acceso completo al sistema

### **RLS Policies Implementadas**
- ✅ Usuarios solo ven sus datos
- ✅ Admins ven todo
- ✅ Storage con carpetas por usuario
- ✅ Funciones security definer para evitar recursión

---

## 🚀 **Deploy y Producción**

### **Lovable Deploy**
1. Click en "Publish" en la interfaz de Lovable
2. Tu app estará disponible en `tu-proyecto.lovable.app`

### **Deploy Personalizado**
```bash
# Build optimizado
npm run build

# Los archivos están en dist/
# Subir a Vercel, Netlify, etc.
```

---

## 🐛 **Debugging y Logs**

### **Desarrollo**
- Console logs disponibles en DevTools
- Error Boundary muestra stack traces detallados
- React Query DevTools habilitado

### **Producción**
- Errores se envían a console.error
- TODO: Integrar Sentry/LogRocket para monitoring

---

## 📋 **Próximos Pasos (P1/P2)**

### **P1 - Funcionalidad (2-3 semanas)**
- [ ] Tests con Vitest + React Testing Library
- [ ] Mejorar TypeScript strict mode
- [ ] Optimización de performance (lazy loading)
- [ ] Manejo de estado más robusto

### **P2 - Calidad (1-2 semanas)**  
- [ ] CI/CD con GitHub Actions
- [ ] Auditoría de accesibilidad
- [ ] Monitoring y analytics
- [ ] Documentación API

---

## 🆘 **Troubleshooting**

### **Errores Comunes**

**"infinite recursion detected"**
```bash
# ✅ SOLUCIONADO: RLS policies refactorizadas
# Si persiste, recarga la página
```

**Upload de archivos falla**
```bash
# ✅ SOLUCIONADO: Supabase Storage configurado
# Verifica que el bucket 'receipts' exista
```

**TypeScript errors**
```bash
# Ejecutar type checking
npm run typecheck
```

---

## 📞 **Soporte**

- **Logs**: Disponibles en Supabase Dashboard > Logs
- **DB**: Supabase Dashboard > SQL Editor  
- **Storage**: Supabase Dashboard > Storage
- **Edge Functions**: Supabase Dashboard > Functions

---

**🎉 ¡ExpenseWise está listo para uso!** Los problemas críticos P0 han sido solucionados.
