# Local setup — macOS (Apple Silicon)

> Guía paso a paso para levantar FoodLovers en tu Mac. Pensado para macOS M1+ con cero asunciones.

## 1. Requisitos previos

Necesitas estas herramientas instaladas:

| Herramienta | Cómo instalar | Verificar |
|-------------|---------------|-----------|
| **Node.js 20+** | Recomendado: [nvm](https://github.com/nvm-sh/nvm) (`brew install nvm`) → `nvm install 20` | `node -v` debe imprimir `v20.x` |
| **npm** | Viene con Node | `npm -v` |
| **Docker Desktop** | [Descargar para Mac](https://www.docker.com/products/docker-desktop/) → versión para Apple Silicon | `docker --version` y `docker compose version` |
| **Git** | Ya viene en macOS, o `brew install git` | `git --version` |

Si no tienes Homebrew, instálalo primero:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 2. Clonar el repositorio

```bash
cd ~/Metropolia          # o donde quieras
git clone https://github.com/Josenoelmarenco/foodlovers.git
cd foodlovers
```

> Mientras no hayas hecho push, omite este paso y trabaja directamente sobre la carpeta `foodlovers/` que ya está en tu workspace.

## 3. Arrancar PostgreSQL local con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Esto levanta PostgreSQL 16 en `localhost:5432` con:

- Usuario: `foodlovers`
- Password: `foodlovers`
- BD: `foodlovers`

Para verificar:

```bash
docker compose ps
# Deberías ver foodlovers-postgres en estado "healthy"
```

Para apagar (cuando termines de trabajar):

```bash
docker compose down
```

Para borrar los datos y empezar de cero:

```bash
docker compose down -v
```

## 4. Backend

En una terminal nueva:

```bash
cd backend
cp .env.example .env       # crea tu archivo de entorno
npm install                # instala dependencias
npm run prisma:generate    # genera el cliente de Prisma a partir del schema
npm run prisma:migrate     # aplica migraciones (Sprint 1 en adelante)
npm run seed               # carga mock data (Sprint 1 en adelante)
npm run dev                # arranca el servidor en http://localhost:4000
```

Si todo va bien, verás:

```
[foodlovers-api] listening on http://localhost:4000
[foodlovers-api] env: development
```

Pruebalo:

```bash
curl http://localhost:4000/api/health | jq
# {
#   "status": "ok",
#   "service": "foodlovers-api",
#   "timestamp": "2026-05-12T...",
#   "uptimeSeconds": 3
# }
```

## 5. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Verás:

```
VITE v5.x  ready in 320 ms
➜  Local:   http://localhost:5173/
```

Abre http://localhost:5173 en tu navegador. Deberías ver:

- La página principal de FoodLovers
- Un badge verde "API online" arriba a la derecha (porque el frontend está hablando con el backend a través del proxy)

## 6. Comandos útiles

| Acción | Comando |
|--------|---------|
| Lint backend | `cd backend && npm run lint` |
| Format backend | `cd backend && npm run format` |
| Test backend | `cd backend && npm test` |
| Lint frontend | `cd frontend && npm run lint` |
| Test frontend | `cd frontend && npm test` |
| Abrir Prisma Studio (UI de la BD) | `cd backend && npm run prisma:studio` |
| Build frontend para prod | `cd frontend && npm run build` |
| Preview del build | `cd frontend && npm run preview` |

## 7. Problemas comunes

**`Error: Cannot find module '@prisma/client'`**
→ Olvidaste `npm run prisma:generate` después de `npm install`.

**`Connection refused on port 5432`**
→ Postgres no está corriendo. Ejecuta `docker compose up -d` desde la raíz.

**`Port 4000 already in use`**
→ Otro proceso usa ese puerto. Cambia `PORT` en `backend/.env` o mátalo:
```bash
lsof -ti:4000 | xargs kill -9
```

**`fetch failed` o `API unreachable` en el frontend**
→ El backend no arrancó. Revisa la terminal del backend.

**El badge dice "API unreachable" pero `curl` al backend funciona**
→ Probablemente faltó reiniciar Vite después de cambiar configuración. Para Vite (`Ctrl+C` en su terminal) y vuelve a `npm run dev`.

## 8. Próximos pasos

Cuando tengas todo arriba y veas el badge verde, estás listo para que arranquemos **Sprint 1**.
