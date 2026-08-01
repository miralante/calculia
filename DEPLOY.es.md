# Desplegar Calculia en Cloudflare Pages

Calculia se despliega en **Cloudflare Pages**, usando la integración
nativa con GitHub. No hay un workflow personalizado de GitHub
Actions — el panel de Cloudflare es quien gestiona build y deploy.

## Cómo funciona

1. El repo de GitHub está conectado a un proyecto de Cloudflare
   llamado `calculia` (Workers & Pages → Pages → Connect to Git).
2. Cada push a `master` lanza un build en la infraestructura de
   Cloudflare.
3. El build no hace nada: sin `build command`, sin `output directory`
   (la raíz `.`), los archivos estáticos se sirven tal cual.
4. El workflow
   [`.github/workflows/validate.yml`](.github/workflows/validate.yml)
   sigue corriendo en cada push y PR para validar contenido, pero
   **no despliega**.

`wrangler.toml` se mantiene por dos motivos:

- Fija el nombre del proyecto (`name = "calculia"`) para que el CLI
  local de `wrangler` apunte al mismo recurso.
- Declara el binding `[assets]` (`directory = "."`) para que un
  `wrangler deploy` manual desde una máquina de desarrollador haga
  exactamente lo mismo que la CI de Cloudflare. Cloudflare no
  necesita este archivo — la configuración del dashboard es la fuente
  de verdad en el momento del deploy.

> **Aviso:** Calculia usa el patrón moderno de **Workers + static
> assets** (la tabla `[assets]` en `wrangler.toml`), no el patrón
> legacy `pages_build_output_dir`. Es la ruta recomendada actual de
> Cloudflare para sitios estáticos, y es lo que ya es el recurso
> "calculia" en el dashboard. El CLI legacy `wrangler pages deploy`
> no aplica aquí — usa `wrangler deploy` si necesitas publicar desde
> tu máquina.

## Configuración en Cloudflare

| Ajuste                | Valor                          |
| --------------------- | ------------------------------ |
| Framework preset      | None                           |
| Build command         | *(vacío)*                      |
| Build output dir      | `.`                            |
| Production branch     | `master`                       |
| Root directory        | *(vacío — raíz del repo)*      |

No se necesitan variables de entorno: la app no hace llamadas de
servidor, y todos los assets (fuentes, iconos, datos de actividades)
van dentro del repo.

## Cabeceras HTTP necesarias

El sitio usa un archivo [`_headers`](_headers) en la raíz del repo
para fijar cabeceras de seguridad (CSP, X-Frame-Options,
Referrer-Policy, Permissions-Policy, etc.) y la política de caché
larga para los assets inmutables y corta para los HTML y el service
worker. Cloudflare Pages lee este archivo en cada deploy y aplica
las reglas automáticamente — sin tocar el dashboard.

## Redirecciones necesarias

El sitio usa un [`_redirects`](_redirects) en la raíz del repo.
Calculia no tiene routing client-side (usa una estructura plana de
carpetas), así que la única regla es el fallback 404, para evitar
que una ruta inexistente devuelva el JSON de error por defecto de
Cloudflare.

## Cómo redesplegar

Nada que hacer. Push a `master` y Cloudflare reconstruye.

Para un rebuild manual (p. ej. tras una incidencia de Cloudflare),
ves a Workers & Pages → calculia → "Create deployment" → elige una
rama o sube un directorio.

## Cómo hacer rollback

Cloudflare dashboard → Workers & Pages → calculia → **Deployments**.
Cada build exitoso aparece con su timestamp. Haz clic en cualquiera y
elige **"Retry deployment"** o **"Rollback to this deployment"**.

## Cómo añadir un dominio personalizado

Cloudflare dashboard → Workers & Pages → calculia → **Custom
domains** → **Set up a custom domain** → sigue el asistente. El DNS
se configura automáticamente si el dominio ya está en Cloudflare,
o por CNAME si está en otro proveedor.

## Rotación de credenciales

No hay tokens de API ni secretos que rotar. La integración con
GitHub es una autorización OAuth de una sola vez; para revocarla
basta con quitar el acceso de la app en
[github.com/settings/applications](https://github.com/settings/applications).