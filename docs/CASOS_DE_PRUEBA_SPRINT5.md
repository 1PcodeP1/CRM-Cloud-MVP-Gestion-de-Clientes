# Casos de Prueba - Sprint 5

Este documento recopila los casos de prueba del Sprint 5, enfocados en:

- HU-10: Eliminacion de cliente.
- HU-11: Visualizacion de indicadores clave en dashboard.

Formato orientado a experiencia de usuario, alineado al estilo de `CASOS_DE_PRUEBA.md`.

| ID Escenario | Escenario de Prueba | Descripcion | Precondicion (Dado que) | Steps (When) | Resultado esperado (Then) | Resultado obtenido | Ciclo 1 | Ciclo 2 | Evidencia (Foto/Video) |
|---|---|---|---|---|---|---|---|---|---|
| **CP-DEL-01** | Boton de eliminacion visible en detalle | El usuario valida que la accion de eliminar esta disponible en la vista detalle | Existe al menos un cliente y me encuentro en su pantalla de detalle | Observo la zona de acciones del cliente | Veo el boton `Eliminar cliente` habilitado en la pantalla | Aprobado | | | Captura de pantalla |
| **CP-DEL-02** | Confirmacion al eliminar cliente | El usuario recibe una advertencia antes de eliminar un registro | Estoy en el detalle de un cliente existente | Hago clic en `Eliminar cliente` | Aparece la confirmacion con el texto: `¿Estas seguro de que deseas eliminar a [Nombre del cliente]? Esta accion no se puede deshacer` | Aprobado | | | Captura de pantalla |
| **CP-DEL-03** | Confirmar eliminacion redirige y muestra mensaje | El usuario elimina un cliente y vuelve al listado con feedback de exito | Estoy en el detalle de un cliente existente | Confirmo la ventana de eliminacion | El sistema elimina el cliente, redirige al listado y muestra: `El cliente ha sido eliminado correctamente` | Aprobado | | | Captura de pantalla |
| **CP-DEL-04** | Cancelar eliminacion no aplica cambios | El usuario decide no eliminar despues de abrir la confirmacion | Estoy en el detalle de un cliente existente | Hago clic en `Eliminar cliente` y luego en `Cancelar` en la confirmacion | La ventana se cierra, no hay cambios y el cliente permanece en el sistema | Aprobado | | | Captura de pantalla |
| **CP-DEL-05** | Cliente eliminado no aparece en listado ni metricas | El usuario valida consistencia global tras eliminar | Existe un cliente visible en listado y contabilizado en dashboard | Elimino el cliente desde detalle y reviso listado + dashboard | El cliente ya no aparece en listado y sus datos dejan de influir en metricas del panel | Aprobado | | | Captura de pantalla |
| **CP-KPI-01** | Render de 4 indicadores principales | El usuario abre dashboard y valida estructura de KPIs | Tengo sesion activa y accedo al dashboard | Observo las tarjetas superiores del panel | Se muestran 4 tarjetas: `Total de clientes`, `Clientes activos`, `Prospectos`, `Inactivos` | Aprobado | | | Captura de pantalla |
| **CP-KPI-02** | Formato cantidad y porcentaje por tarjeta | El usuario valida lectura inmediata de valores | Existen clientes registrados | Observo el texto secundario de cada tarjeta | Cada tarjeta muestra formato `X clientes · Y%` con valores correctos | Aprobado | | | Captura de pantalla |
| **CP-KPI-03** | Calculo en tiempo real | El usuario verifica que los KPIs cambian segun datos actuales | Existe al menos un cliente en el sistema | Registro/edito/elimina clientes y vuelvo al dashboard | Los indicadores se actualizan con los datos actuales, sin necesidad de recalculos manuales | Aprobado | | | Captura de pantalla |
| **CP-KPI-04** | Colores por estado en tarjetas | El usuario identifica estados por color | Estoy en el dashboard con KPIs visibles | Comparo visualmente las tarjetas por estado | Activos se ve en verde, Prospectos en amarillo e Inactivos en gris | Aprobado | | | Captura de pantalla |
| **CP-KPI-05** | Dashboard sin clientes | El usuario abre panel en base vacia | No hay clientes registrados en el sistema | Ingreso al dashboard | Todas las tarjetas muestran `0` (incluyendo porcentaje) y no aparecen errores en pantalla | Aprobado | | | Captura de pantalla |
