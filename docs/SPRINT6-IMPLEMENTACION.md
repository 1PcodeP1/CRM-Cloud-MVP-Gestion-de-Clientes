# Sprint 6 - Implementación

## Resumen

En este sprint se consolidó la implementación de funcionalidades analíticas avanzadas en el panel de control:

- HU-12: Gráfica de crecimiento mensual (Métricas de registro en los últimos 6 meses).
- HU-13: Panel de clientes inactivos (Identificación automática de clientes que requieren atención).

## HU-12: Gráfica de crecimiento mensual

**Estado:** Completada

### Criterios de aceptación cubiertos

- [x] **61.** La gráfica muestra 6 barras, una por cada uno de los últimos 6 meses, con la cantidad de clientes nuevos registrados en ese periodo.
- [x] **62.** El mes más reciente se destaca visualmente con un color verde sólido; los meses anteriores aparecen en verde claro.
- [x] **63.** Encima o junto a la gráfica se muestra la variación respecto al mes anterior, por ejemplo: '+25% respecto al mes anterior'.
- [x] **64.** Las etiquetas del eje horizontal muestran el nombre abreviado del mes: Sep, Oct, Nov, etc.
- [x] **65.** Si en algún mes no se registraron clientes, la barra aparece con una altura mínima visible para no confundirse con un error de carga.

### Implementación técnica

#### Backend
- Se creó el endpoint `GET /clients/stats/monthly` en el controlador de clientes.
- Lógica en `ClientsService.getMonthlyStats()` para agrupar registros mediante la columna `createdAt` en los últimos 6 meses.
- Cálculo automático del crecimiento porcentual comparando los dos últimos meses del arreglo.

#### Frontend
- Instalación e integración de la librería `recharts` para visualización de datos.
- Creación del componente `MonthlyRegistrationsChart.tsx` con barras dinámicas, tooltips y diseño responsivo.
- Lógica de altura mínima (`0.2`) para meses en cero.
- Consumo de API mediante `clientService.getMonthlyStats()`.

## HU-13: Panel de clientes inactivos (Requieren atención)

**Estado:** Completada

### Criterios de aceptación cubiertos

- [x] **66.** La sección 'Requieren atención' muestra hasta 4 clientes, ordenados por mayor tiempo sin actividad.
- [x] **67.** Un cliente aparece en esta sección si cumple al menos una condición: su estado es 'Inactivo' o lleva más de 10 días sin ninguna actualización registrada.
- [x] **68.** Cada fila muestra: nombre del cliente, nombre de la empresa y una etiqueta indicando el motivo ('Inactivo' o 'X días sin actividad').
- [x] **69.** El número de días mostrado en la etiqueta corresponde al tiempo real transcurrido desde la última modificación del cliente.
- [x] **70.** Si ningún cliente requiere atención, la sección muestra el mensaje: 'Todos tus clientes están al día'.

### Implementación técnica

#### Backend
- Se creó el endpoint `GET /clients/attention` en el controlador de clientes.
- Lógica en `ClientsService.getAttentionClients()` con constructor de consultas (QueryBuilder) filtrando por `status = 'Inactivo' OR updatedAt < Hace 10 días`.
- Ordenamiento ascendente por fecha de última actualización (`updatedAt`) para priorizar clientes olvidados, limitando el resultado a 4 (`take(4)`).
- Cálculo matemático del tiempo real transcurrido para generar el motivo del alertamiento.

#### Frontend
- Creación del componente `AttentionClientsList.tsx` con renderizado condicional de estado vacío ('Todos tus clientes están al día') vs listado.
- Etiquetado de filas con colores (rojo para "Inactivo", naranja para días sin actividad).
- Consumo de API mediante `clientService.getAttentionClients()`.
- Incorporación fluida y lado a lado con la gráfica en el Layout del Dashboard.

## Archivos modificados y creados

- `backend/src/clients/clients.controller.ts` (modificado)
- `backend/src/clients/clients.service.ts` (modificado)
- `frontend/src/services/clientService.ts` (modificado)
- `frontend/src/pages/DashboardPage.tsx` (modificado)
- `frontend/package.json` (modificado)
- `frontend/src/components/dashboard/MonthlyRegistrationsChart.tsx` (nuevo)
- `frontend/src/components/dashboard/AttentionClientsList.tsx` (nuevo)

## Evidencia de validación

### Pruebas manuales

- Se validó visualmente el renderizado responsivo de la gráfica con 6 barras y colores correctos.
- Se verificó que los cálculos de variación mensual fuesen matemáticamente precisos.
- Se comprobó la pantalla de contingencia/error de conexión (Error UI de red).
- Se validó la lógica de exclusión del panel de inactivos registrando un nuevo cliente ("Prospecto", 0 días de inactividad) comprobando que no aparece.
- Se verificó el mensaje de validación positiva ('Todos tus clientes están al día').
