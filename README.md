# 📄 AgriTech: Herramienta de Conversión HTML a PDF

Esta aplicación permite convertir documentos HTML complejos (incluyendo estilos de Tailwind CSS) en archivos PDF de alta fidelidad utilizando **Puppeteer** en el backend.

## 🚀 Requisitos Previos

- **Node.js** (Versión 18 o superior recomendada)
- **npm** (Instalado con Node.js)

## 🛠️ Instalación

1. Navega a la carpeta de la herramienta:
   ```bash
   cd html-to-pdf-app
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

## 🏃 Cómo Iniciar la Herramienta

La herramienta requiere que **dos servidores** estén activos simultáneamente:

### 1. Iniciar el Servidor de Generación (Backend)
Este servidor utiliza Puppeteer para renderizar el HTML y generar el PDF.
```bash
node server.cjs
```
*El servidor correrá en: `http://localhost:3001`*

### 2. Iniciar la Interfaz de Usuario (Frontend)
Abre una nueva terminal y ejecuta:
```bash
npm run dev
```
*Vite asignará un puerto (usualmente `http://localhost:5173`). Revisa la consola para confirmar el puerto exacto.*

## 📖 Uso

1. Abre la URL del frontend en tu navegador.
2. Sigue las instrucciones en pantalla para cargar o pegar el HTML que deseas convertir.
3. El frontend enviará el contenido al backend en el puerto 3001.
4. El backend devolverá el PDF generado listo para descargar.

## ⚠️ Notas Importantes

- **Tailwind CSS**: El servidor backend tiene un retraso configurado para permitir que el CDN de Tailwind procese todos los estilos antes de capturar el PDF.
- **Puertos**: Asegúrate de que los puertos 3001 y el asignado por Vite estén libres antes de iniciar.
