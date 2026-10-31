# FlowBoard

Demo original de gestión empresarial para un **proyecto personal de portafolio**, adecuada para presentar en Contra y Upwork. Todas las empresas, personas, actividades, cifras y resultados son ficticios. No representa un encargo comercial ni resultados reales de clientes.

[Ver demo pública](https://flowboard-sooty-one.vercel.app/) · [Repositorio](https://github.com/AvelarLic96/flowboard)

La demo está desplegada en Vercel. Los datos que modifiques se guardan únicamente en tu navegador.

## Ejecutar localmente

Requisitos: Node.js 22.13 o superior (se recomienda una versión LTS vigente) y npm.

```bash
cd ~/Projects/flowboard
npm ci
npm run dev
```

Abre http://localhost:3000. No requiere variables de entorno, cuentas, base de datos ni servicios de pago.

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # Producción
npm start          # Servir la compilación de producción
npm run test:e2e   # Pruebas con Playwright y Google Chrome instalado
```

Las pruebas abren un perfil aislado y usan el servidor de producción. Incluyen seis recorridos: creación/validación/eliminación y persistencia, arrastre Kanban, adaptación móvil/tablet, recuperación de almacenamiento análisis automatizado de accesibilidad WCAG con axe y renderizado/interacción de gráficos. Estos controles automatizados no sustituyen una auditoría manual completa. Ejecuta `npm run build` primero. Si no tienes Google Chrome, instala Chromium con `npx playwright install chromium` y elimina `channel: "chrome"` de playwright.config.ts.

## Funciones

- **Overview:** indicadores, ingresos interactivos de tres o seis meses, actividad y proyectos activos.
- **Clients:** altas con React Hook Form y Zod, búsqueda por nombre/empresa/email, filtro por estado y eliminación confirmada. Los clientes con proyectos vinculados deben reasignarse desde la edición de proyectos antes de eliminarlos.
- **Projects:** creación y edición, vista de tarjetas o tabla, búsqueda y filtros. Cliente, presupuesto USD, prioridad, progreso, estado y entrega. Marcar Completed ajusta el progreso a 100%.
- **Task board:** tareas con prioridad, etiquetas, responsable, proyecto y fecha. Arrastre con ratón/táctil mediante un grip dedicado; también teclado y selector de estado para una alternativa accesible. Filtro por proyecto y búsqueda.
- **Reports:** ingresos contra objetivos, distribución de estados, clientes por presupuesto y resumen de fechas de entrega.
- Buscador global, notificaciones basadas en actividad local, perfil ficticio, navegación móvil y restauración confirmada de datos de muestra.

## Persistencia y significado de los datos

`localStorage` usa la clave versionada `flowboard.workspace.v1`, validada con Zod al cargar. Cada navegador/origen tiene su propia copia. Las pestañas abiertas se sincronizan mediante eventos `storage`. Los cambios se conservan al recargar, pero no se comparten entre dispositivos ni usuarios. No hay autenticación ni backend. El perfil es ilustrativo.

Los ingresos mensuales y objetivos de mayo–octubre de 2026 son muestras estáticas ficticias en `lib/data.ts`, independientes de los presupuestos. Clientes, presupuestos, proyectos, tareas, actividad y distribución de estados se calculan desde los datos guardados. Los vencimientos se comparan con la fecha actual; no se registran fechas reales de finalización y no se afirma un porcentaje histórico de entregas puntuales.

Si el almacenamiento está bloqueado o lleno se muestra una advertencia; los cambios siguen en memoria mientras la pestaña permanezca abierta. Datos guardados ilegibles no se sobrescriben al cargar: se muestra la muestra inicial con aviso; una modificación posterior guarda el estado actual y Reset demo data permite restaurar explícitamente la muestra. No introduzcas información sensible o real.

## Arquitectura

Next.js App Router, React, TypeScript y Tailwind CSS. Componentes UI compatibles con shadcn/ui en `components/ui` (Button con CVA/Slot y Dialog con Radix); configuración en `components.json`. React Hook Form/Zod para formularios; Recharts para gráficos; dnd-kit para arrastre con puntero y teclado; Lucide para iconos.

```text
app/                 Rutas, metadata y estilos globales
components/          Shell, vistas, formularios, gráficos y Kanban
components/ui/       Primitivas de interfaz accesibles
lib/data.ts          Modelos, validación y muestras ficticias
components/store.tsx Estado compartido, persistencia y recuperación
tests/               Pruebas de recorridos del navegador
```

La interfaz, el logotipo geométrico y los datos se implementaron desde cero para esta demo. No se usaron fotografías, referencias visuales externas, recursos de empleadores ni proyectos contratados. Las bibliotecas de código abierto se declaran en package.json y conservan sus respectivas licencias; la originalidad del proyecto no supone autoría de esas dependencias.

Accesibilidad: navegación semántica, salto al contenido, etiquetas de formularios y errores asociados, foco visible, diálogos con foco contenido y cierre con Escape, regiones de avisos, opciones de movimiento sin arrastre, resúmenes textuales de gráficos y respeto por movimiento reducido. La navegación de móvil se despliega desde el botón superior. Las tablas mantienen su desplazamiento horizontal interno.

## Desplegar en Vercel

1. Usa el repositorio público [AvelarLic96/flowboard](https://github.com/AvelarLic96/flowboard), que incluye el historial de desarrollo.
2. En Vercel, selecciona **Add New → Project** e importa ese repositorio.
3. Mantén el preset **Next.js**, raíz del repositorio, instalación `npm ci` y compilación `npm run build`.
4. No agregues variables de entorno. Despliega.

El workflow `.github/workflows/ci.yml` repite lint, build y pruebas E2E en cada push o pull request; en CI usa Chromium instalado por Playwright.

También puedes ejecutar `npx vercel` desde esta carpeta después de iniciar sesión. El proyecto no requiere funcionalidades de pago. El despliegue de producción está conectado a la rama `main`; los nuevos pushes generan una nueva compilación en Vercel.

## Presentarlo en tu portafolio

Texto sugerido: “FlowBoard es un proyecto personal original de portafolio: una demo de gestión de clientes, proyectos y tareas con Next.js y TypeScript. Todos los datos son ficticios. Implementé navegación adaptable, formularios validados, reportes y persistencia local sin backend.”

No presentes los ingresos de muestra, los nombres ficticios o las métricas como resultados empresariales reales. Antes de compartir una captura, usa Reset demo data para volver a una muestra consistente.
