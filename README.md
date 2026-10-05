# El dominio z · Grupo 01

Web de exposición en español, creada con React y Vite, que desarrolla los ejercicios **1a, 1f, 3d y 4d** del trabajo grupal de Transformada Z de la UTP.

## Iniciar

```powershell
npm install
npm run dev
```

Abrir la dirección que muestra Vite. Para producción: `npm run build`. Para revisar la compilación: `npm run preview`.

## Contenido

- 47 pasos con explicación, fórmula anterior y nueva, y animación del cambio. El ejercicio 3d se agrupa en 5 pasos siguiendo la hoja de resolución.
- Navegación por pasos, reproducción automática con pausa y resolución completa.
- Gráficas SVG de muestras discretas, tabla numérica y componentes de 3d.
- Plano complejo con polos, frontera y exploración de la región de convergencia.
- Ejemplos adicionales identificados como ampliaciones: dilución, vibración, filtro y control inestable.
- Modo exposición, diseño móvil y respeto de la preferencia de movimiento reducido.
- PDF originales accesibles desde la sección de fuentes.

Se usa la transformada **unilateral** con k ≥ 0. En 3d la convención se declara porque el enunciado no especifica ROC. Los ejemplos de aplicación son modelos idealizados, no datos experimentales.

## Validación

`npm test` compara las transformadas con sumas de las sucesiones, contrasta 4d con una implementación independiente de la recurrencia y valida todas las fórmulas con KaTeX.

El material original se conserva en `public/fuentes`. Las fórmulas, explicaciones y modelos están separados en `src/lessons.js` y `src/domain.js`.
