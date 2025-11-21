# GeoSurveyPro IDEHUPy

Aplicación PWA (Progressive Web App) para la recolección de datos en campo con funcionalidad Offline-First.

## Características

*   **Offline-First:** Funciona sin conexión a internet.
*   **Geo-Locking:** Bloqueo de encuestas si la precisión GPS es insuficiente (< 15m).
*   **Anti-Fraude:** Validación de tiempo y distancia recorrida.
*   **Panel Administrativo:**
    *   Gestión de Voluntarios.
    *   Chat en tiempo real (simulado).
    *   Monitor GPS (simulado).
    *   Configuración dinámica de preguntas.
*   **Exportación:** Generación de reportes JSON y transmisión vía Web Share API (WhatsApp, etc.).

## Stack Tecnológico

*   **Frontend:** React + TypeScript + Vite
*   **Estilos:** Tailwind CSS
*   **Gráficos:** Recharts
*   **Iconos:** Lucide React

## Instalación y Desarrollo

1.  Clonar repositorio.
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Correr servidor de desarrollo:
    ```bash
    npm run dev
    ```
4.  Construir para producción:
    ```bash
    npm run build
    ```

## Despliegue en Vercel

Este proyecto está optimizado para Vercel.
1.  Importar repositorio en Vercel.
2.  Framework Preset: `Vite`.
3.  Deploy.
