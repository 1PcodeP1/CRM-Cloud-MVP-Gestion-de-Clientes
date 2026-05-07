# Casos de Prueba - Sprint 6

Este documento recopila los casos de prueba del Sprint 6, enfocados en:

- HU-12: Gráfica de crecimiento mensual (Métricas de registro en 6 meses).
- HU-13: Panel de clientes inactivos (Muestra clientes que requieren atención).

Formato orientado a experiencia de usuario, alineado al estilo de `CASOS_DE_PRUEBA.md`.

| ID Escenario | Escenario de Prueba | Descripción | Precondición (Dado que) | Steps (When) | Resultado esperado (Then) | Resultado obtenido | Ciclo 1 | Ciclo 2 | Evidencia (Foto/Video) |
|---|---|---|---|---|---|---|---|---|---|
| **CP-CHART-01** | Visualización de últimos 6 meses | El usuario valida que la gráfica muestre el periodo correcto | Hay clientes registrados en distintos meses | Reviso la gráfica en el dashboard | Veo exactamente 6 barras correspondientes a los últimos 6 meses (ej. Oct, Nov, Dic...) | Aprobado | | | Captura de pantalla |
| **CP-CHART-02** | Diferenciación del mes actual | El usuario distingue fácilmente el mes en curso | Hay datos cargados en la gráfica | Observo los colores de las barras | La barra del mes más reciente es verde oscuro, mientras que los meses anteriores son verde claro | Aprobado | | | Captura de pantalla |
| **CP-CHART-03** | Variación mensual | El usuario ve si el mes actual mejoró respecto al anterior | Hay datos suficientes en los últimos 2 meses | Reviso la píldora informativa sobre la gráfica | Aparece un porcentaje (positivo, negativo o neutro) comparando los clientes del mes actual vs mes anterior | Aprobado | | | Captura de pantalla |
| **CP-CHART-04** | Meses en cero con altura visible | El usuario revisa que un mes sin registros no parezca un error de carga | Existe al menos un mes en el semestre sin ningún cliente registrado | Veo la gráfica correspondiente a ese mes | La barra de ese mes no está completamente plana, tiene una ligera altura para confirmar que sí cargó y el tooltip muestra '0' | Aprobado | | | Captura de pantalla |
| **CP-ATTEN-01** | Lista vacía cuando están al día | El usuario verifica el panel cuando sus clientes son recientes | Todos los clientes fueron registrados recientemente (menos de 10 días) y ninguno está 'Inactivo' | Reviso la sección 'Requieren atención' | Aparece el mensaje feliz: 'Todos tus clientes están al día. ¡Buen trabajo manteniendo el contacto!' | Aprobado | | | Captura de pantalla |
| **CP-ATTEN-02** | Aparición de cliente Inactivo | El usuario valida que los Inactivos pasen automáticamente a la lista | Cambio el estado de un cliente a 'Inactivo' | Vuelvo al panel principal | El cliente aparece en la lista con la etiqueta roja 'Inactivo' | Aprobado | | | Captura de pantalla |
| **CP-ATTEN-03** | Aparición por inactividad de tiempo | El usuario valida la regla de 10 días | Un cliente lleva más de 10 días sin editarse en el sistema | Reviso la lista 'Requieren atención' | El cliente aparece con una etiqueta naranja que dice 'X días sin actividad' (ej: '15 días sin actividad') | Aprobado | | | Captura de pantalla |
| **CP-ATTEN-04** | Límite máximo de 4 clientes | El usuario comprueba el límite de visualización | Tengo 10 clientes inactivos o abandonados desde hace meses | Reviso la sección 'Requieren atención' | El sistema solo muestra los 4 clientes más antiguos/abandonados, sin saturar la pantalla | Aprobado | | | Captura de pantalla |
