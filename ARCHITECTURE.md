# Arquitectura de BrielCode

## Vista general

```text
Visitante
  └─ Vercel (archivos estáticos: index.html, CSS y JavaScript)
       └─ Supabase con clave pública anon/publishable
            ├─ Postgres: textos del sitio, servicios y proyectos publicados
            └─ Storage: imágenes públicas del portafolio
  └─ /proyecto?id=<id del proyecto>: detalle del caso publicado

Administrador
  └─ /admin (interfaz estática; acceso con Supabase Auth)
       └─ Supabase valida la sesión y aplica Row Level Security (RLS)
            ├─ admin_users: lista explícita de cuentas autorizadas
            ├─ Postgres: creación, edición y eliminación de contenido
            └─ Storage: carga y eliminación de imágenes
```

## Componentes

- **Landing pública:** `index.html`, `styles.css` y `public.js`. Mantiene contenido inicial legible sin JavaScript y carga la versión publicada desde Supabase cuando se configura el proyecto. Todas las llamadas a la acción de contacto comparten el teléfono y mensaje de WhatsApp gestionados desde el panel.
- **Detalle de proyecto:** `proyecto.html` y `project.js`. Cada tarjeta abre su propio detalle por ID, con portada, galería, cliente, año, rol, reto, solución, resultados y enlace al sitio externo.
- **Panel privado:** `admin.html` y `admin.js`, accesible por `/admin`. Permite iniciar/cerrar sesión y recuperar contraseña; editar todo el texto visible, metadatos SEO, teléfono/mensaje de WhatsApp, imagen de perfil e imagen de portada; y crear, editar, ocultar, ordenar y eliminar servicios y proyectos. Los proyectos aceptan categoría, cliente, año, rol, reto, solución, resultados, etiquetas, enlace, portada y galería de imágenes.
- **Configuración pública:** `supabase-config.js` contiene únicamente la URL del proyecto y su clave `anon`/`publishable`. Estas credenciales se entregan al navegador; **nunca** se debe colocar aquí una clave `service_role` o un secreto.
- **Datos y seguridad:** `supabase/schema.sql` crea las tablas, contenido inicial, bucket y políticas RLS. La tabla `admin_users` determina qué cuentas autenticadas pueden modificar datos o archivos.
- **Despliegue:** Vercel sirve los archivos estáticos y mantiene `/admin` como ruta del panel mediante la regla que ya existe en `vercel.json`. No se requiere servidor propio ni proceso de compilación.

## Configuración necesaria para activar el panel

1. Crea o abre el proyecto de Supabase y ejecuta `supabase/schema.sql` completo en **SQL Editor**. Si existe la antigua tabla `public.proyectos` con las columnas `titulo`, `descripcion`, `tags` y `url_imagen`, el script importa esos proyectos cuando `public.projects` todavía está vacía.
2. En **Project Settings → API**, copia la Project URL y la clave pública `anon`/`publishable`. Pon esos dos valores en `supabase-config.js`. No uses la clave `service_role`.
3. En **Authentication → Users**, crea manualmente la cuenta del administrador. Desactiva el registro público de usuarios (Sign-ups) en la configuración de Authentication.
4. En SQL Editor, busca el UUID de la cuenta creada:

   ```sql
   select id, email from auth.users where email = 'tu-correo@ejemplo.com';
   ```

5. Autoriza esa cuenta en el panel:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID-COPIADO-DE-LA-CONSULTA');
   ```

6. En **Authentication → URL Configuration**, configura la URL de producción del sitio como Site URL y permite `https://TU-DOMINIO/admin?reset=1` como Redirect URL para recuperación de contraseña.
7. Publica el repositorio en Vercel. Abre `/admin`, inicia sesión y configura en el panel el número de WhatsApp con el indicativo del país.

La cuenta se autentica con Supabase Auth; las políticas de base de datos y Storage rechazan escrituras de cualquier sesión que no esté incluida en `admin_users`. El HTML del panel, por ser estático, no es secreto ni se usa como control de acceso.

## Modelo de datos

- `site_content`: una fila `main` con los textos y ajustes de la landing en JSONB.
- `services`: nombre, descripción, icono, orden y estado de publicación.
- `projects`: nombre, categoría, cliente, año, rol, descripción, reto, solución, resultados, etiquetas, URL, orden, estado de publicación, imagen principal y galería.
- `admin_users`: identificadores de usuarios de Supabase Auth autorizados para escribir.
- Storage `portafolio`: imágenes públicas de proyectos y perfil; solo administradores autenticados pueden cargarlas o eliminarlas.

El sitio público solo consulta textos, servicios y proyectos; las consultas filtran los elementos no publicados. Los detalles también requieren que el proyecto esté publicado. Las credenciales de Supabase no permiten saltarse RLS.
