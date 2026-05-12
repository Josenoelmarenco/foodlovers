# Deploy guide — Vercel + Render + Neon

> Guía para desplegar FoodLovers en producción usando **tres servicios gratuitos**. Pensada para alguien que NO tiene cuenta en ninguno todavía.

**Tiempo total:** 30-45 minutos la primera vez.

**Costo:** $0 mientras no excedas los free tiers (no los vas a excedir con tráfico de portafolio).

---

## Visión general

| Pieza | Servicio | Por qué |
|-------|----------|---------|
| Base de datos | **Neon** | Postgres serverless con free tier permanente. Sin tarjeta. |
| Backend (API Node) | **Render** | Despliegue de servicios Node con free tier (duerme tras 15 min de inactividad). Sin tarjeta. |
| Frontend (React) | **Vercel** | Estándar de la industria para static + SPA. Free tier muy generoso. Sin tarjeta. |

Hazlo en este orden: Neon → Render → Vercel. Cada uno depende del anterior.

---

## Paso 1 — Neon (base de datos)

### 1.1. Crear cuenta

1. Ve a https://neon.tech
2. Click en "Sign up" arriba a la derecha
3. Recomiendo entrar con **GitHub** (login social) para tener todo conectado a tu identidad de dev
4. Acepta términos y verifica email si te lo pide

### 1.2. Crear el proyecto

1. Una vez dentro, click **"Create a project"**
2. Configura:
   - **Project name:** `foodlovers`
   - **Postgres version:** la más reciente (17 o 16)
   - **Region:** `Europe (Frankfurt)` — más cerca de Finlandia que la default
3. Click **"Create project"**

### 1.3. Copiar la connection string

Cuando termine de crearse, Neon te muestra un panel con la connection string. Es algo así:

```
postgresql://foodlovers_owner:XXXXX@ep-xxxxx-pooler.eu-central-1.aws.neon.tech/foodlovers?sslmode=require
```

**Cópiala y guárdala** — la vas a pegar en Render en el paso siguiente. Si la pierdes, puedes regenerarla desde "Dashboard → Connection details".

> ⚠️ Esta string contiene credenciales. No la pegues en chats, capturas o repos públicos.

### 1.4. Listo

Neon ya tiene tu BD lista. No tienes que crear tablas a mano — Prisma lo hará por ti cuando despliegues el backend.

---

## Paso 2 — Render (backend)

### 2.1. Crear cuenta

1. Ve a https://render.com
2. Click en "Get Started" o "Sign Up"
3. Entra con **GitHub** (te va a pedir permisos para leer tus repos públicos, que es lo que necesitamos)
4. Confirma tu email

### 2.2. Antes de crear el servicio: sube el código a GitHub

Render despliega desde un repo de GitHub. Necesitas que el código esté allá primero. Si no lo has subido aún:

```bash
cd ~/Metropolia/foodlovers   # o donde lo tengas
git init
git add .
git commit -m "feat: initial scaffolding"

# Crea el repo vacío en https://github.com/new (nombre: foodlovers, público)
git branch -M main
git remote add origin https://github.com/Josenoelmarenco/foodlovers.git
git push -u origin main
```

### 2.3. Crear el Web Service en Render

1. En el dashboard de Render, click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"** → **"Next"**
3. Si es tu primera vez, conecta GitHub y autoriza el repo `foodlovers`
4. Selecciónalo y click **"Connect"**

### 2.4. Configurar el servicio

Llena el formulario así:

| Campo | Valor |
|-------|-------|
| **Name** | `foodlovers-api` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` |

### 2.5. Variables de entorno

Scroll abajo a la sección **"Environment Variables"** y añade:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | _La connection string de Neon que copiaste_ |
| `PORT` | `4000` |
| `CORS_ORIGIN` | _Lo dejaremos en blanco por ahora — se actualiza después de Vercel_ |
| `NODE_ENV` | `production` |

(Para `CORS_ORIGIN` pon `*` temporalmente y lo cambiamos al final.)

### 2.6. Deploy

1. Scroll hasta el final y click **"Create Web Service"**
2. Render empieza a buildear. Esto toma 5-10 minutos la primera vez (instala dependencias, corre migraciones de Prisma, compila TypeScript)
3. Sigue los logs en vivo. Si todo va bien verás:
   ```
   [foodlovers-api] listening on http://localhost:4000
   ```

### 2.7. Verificar

Render te da una URL tipo `https://foodlovers-api.onrender.com`. Pruébala:

```bash
curl https://foodlovers-api.onrender.com/api/health
# { "status": "ok", "service": "foodlovers-api", ... }
```

> La primera petición tras 15 min de inactividad tarda ~30s (cold start). Después es instantánea. Esto es normal en el free tier de Render.

**Copia esa URL** — la vas a poner en Vercel en el siguiente paso.

---

## Paso 3 — Vercel (frontend)

### 3.1. Crear cuenta

1. Ve a https://vercel.com
2. Click en "Sign Up"
3. Entra con **GitHub** (otra vez recomendado por consistencia)

### 3.2. Importar el proyecto

1. En el dashboard, click **"Add New..."** → **"Project"**
2. Vercel lista tus repos de GitHub. Busca `foodlovers` y click **"Import"**

### 3.3. Configurar

Vercel detectará que es un proyecto Vite. Pero tenemos un monorepo, así que necesitamos ajustar:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Vite` (detectado automáticamente) |
| **Root Directory** | Click "Edit" → selecciona `frontend` |
| **Build Command** | (default: `npm run build`) |
| **Output Directory** | (default: `dist`) |
| **Install Command** | (default: `npm install`) |

### 3.4. Variables de entorno

Antes de hacer click en "Deploy", expande **"Environment Variables"** y añade:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | _La URL de Render del paso anterior, ej. `https://foodlovers-api.onrender.com`_ |

### 3.5. Deploy

Click **"Deploy"**. Vercel buildea en ~1-2 minutos. Cuando termine, te da una URL tipo `https://foodlovers.vercel.app`.

Visítala. Deberías ver la página de FoodLovers funcionando, con el badge verde "API online" (el frontend está hablando con tu backend de Render).

---

## Paso 4 — Cerrar el círculo de CORS

Ahora que sabes la URL final del frontend, vuelve a Render para restringir CORS:

1. En Render, ve a tu servicio `foodlovers-api` → **Environment**
2. Edita la variable `CORS_ORIGIN`:
   - Valor: `https://foodlovers.vercel.app` (tu URL real de Vercel)
3. Click **"Save Changes"**
4. Render redeploya automáticamente. Espera 2-3 minutos.

Después de eso, el backend solo aceptará peticiones del frontend desplegado. Más seguro.

---

## Paso 5 — Probar end-to-end

1. Abre tu URL de Vercel en una pestaña anónima
2. Verifica:
   - Badge verde "API online"
   - La página carga sin errores en consola
   - El primer hit puede tardar 30s (cold start de Render) — espera con paciencia
3. Abre las DevTools → Network → ves la llamada a `https://foodlovers-api.onrender.com/api/health`

Si todo funciona: **enhorabuena, tienes una app fullstack desplegada en producción**. Eso es lo que un empleador quiere ver.

---

## Paso 6 — Actualizar el README

En tu README principal, reemplaza:

```
🚧 Coming soon. The deploy will live here:
```

Por:

```
**Live demo:** https://foodlovers.vercel.app
**API:** https://foodlovers-api.onrender.com
```

Y haz commit:

```bash
git add README.md
git commit -m "docs: add live demo links to README"
git push
```

---

## Mantenimiento posterior

### Cuando hagas cambios

- **Push a `main`** → Vercel y Render redeployan automáticamente.
- Si cambias el schema de Prisma, asegúrate de correr `npx prisma migrate dev` localmente y commitear las migraciones — Render las aplicará en el build con `prisma migrate deploy`.

### Cuando duerma el backend

Render free tier duerme después de 15 min inactivo. Soluciones:

1. **Aceptarlo** y poner una nota en el README ("First request may take ~30s while the backend wakes up"). Es honesto y profesional.
2. **Cron job externo** que pingee `/api/health` cada 10 minutos. Es legítimo pero ligeramente "trampa" — yo lo dejaría como está.

### Si necesitas más performance

Cuando consigas un trabajo y ya no necesites el free tier:

- Backend: Render Starter ($7/mo, sin cold starts) o Railway / Fly.io
- DB: Neon Pro o Supabase

---

## Checklist final

- [ ] Cuenta Neon creada, proyecto `foodlovers` con connection string copiada
- [ ] Código en GitHub público (`github.com/Josenoelmarenco/foodlovers`)
- [ ] Cuenta Render creada, web service `foodlovers-api` desplegado, `/api/health` responde
- [ ] Cuenta Vercel creada, proyecto desplegado, badge verde visible
- [ ] CORS_ORIGIN restringido a la URL de Vercel
- [ ] README actualizado con los enlaces de deploy
- [ ] Visitaste la URL desde otro dispositivo o pestaña anónima y todo funciona
