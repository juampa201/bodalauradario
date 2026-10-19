# Conectar el formulario con Google Sheets

El formulario guarda las respuestas en la pestaña **Confirmaciones** de la hoja indicada en `Code.gs`.

1. Abre la hoja de cálculo y ve a **Extensiones → Apps Script**.
2. Sustituye el contenido de `Code.gs` por el archivo de este directorio y guarda.
3. Ve a **Implementar → Nueva implementación → Aplicación web**.
4. Selecciona **Ejecutar como: Yo** y acceso **Cualquier usuario**. Autoriza el acceso a la hoja.
5. Copia la URL de la aplicación web que termina en `/exec`.
6. Pega esa URL en `appsScriptUrl` dentro de `assets/js/config.js` y publica el cambio.

La primera respuesta creará la pestaña `Confirmaciones` con sus encabezados. No se necesitan credenciales en la web.
