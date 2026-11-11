# Bienes Raíces Asociados — Página web

Sitio público de Bienes Raíces Asociados. Servidor Node.js sin dependencias (`server.js`) que:

- Lee los proyectos en vivo desde el CRM (`/api/public/proyectos`) y los guarda en caché.
- Genera una página por proyecto (`/proyectos/<id>`) con datos para Google (JSON-LD), `sitemap.xml` y `robots.txt`.
- Si el CRM no responde, usa los proyectos de respaldo de `site/js/projects.js`.

Los precios, fotos y datos de los proyectos **se editan desde el CRM** (sección *Página web*), no en este repositorio.

## Variables de entorno

| Variable   | Ejemplo                                  |
|------------|------------------------------------------|
| `CRM_URL`  | `https://app.13-140-223-220.sslip.io`    |
| `SITE_URL` | `https://bienesraicesasociados.co`       |
| `DATA_DIR` | `./data`                                 |
| `PORT`     | lo asigna el hosting                     |

## Ejecutar en local

```
node server.js
```

Requiere Node 20 o superior. Publicado en Hostinger (Web App conectada a este repositorio: cada push se despliega solo).
