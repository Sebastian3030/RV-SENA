# RV SENA · Pedidos en línea para restaurante

Aplicación web para pedir comida desde la mesa, para recoger o a domicilio. La cocina recibe los pedidos en un tablero en vivo y el cliente sigue cada paso de su pedido.

- **Frontend:** React 19 + Vite + Tailwind CSS 4 (`frontend/`)
- **Backend:** Laravel 12 + Sanctum, API REST propia en `/api/v1` (`backend/`)
- **Base de datos:** SQLite por defecto (sin instalar nada) o MySQL de XAMPP

## Requisitos

PHP 8.2+, Composer 2 y Node.js 20+.

## Puesta en marcha

**Terminal 1 · backend**

```bash
cd backend
composer install
copy .env.example .env        # en Git Bash / Linux: cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve             # http://localhost:8000
```

**Terminal 2 · frontend**

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Abre **http://localhost:5173**. Vite redirige `/api` y `/storage` a Laravel, así que no hay que configurar CORS.

### Usar MySQL (XAMPP) en vez de SQLite

En `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rv_sena
DB_USERNAME=root
DB_PASSWORD=
```

Crea la base `rv_sena` en phpMyAdmin y ejecuta `php artisan migrate:fresh --seed`.

### Usar PostgreSQL

1. Activa la extensión en tu `php.ini` quitando el `;` de `extension=pdo_pgsql` (en XAMPP: `C:\xampp\php\php.ini`). Compruébalo con `php -m`.
2. Crea la base `rv_sena` en pgAdmin.
3. En `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rv_sena
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
```

4. Ejecuta `php artisan migrate:fresh --seed`.

Las búsquedas usan `whereLike`, que no distingue mayúsculas en ningún motor (en PostgreSQL se traduce a `ILIKE`).

## Cuentas de prueba

Contraseña de todas: `rvsena123`

| Rol | Correo | Qué puede hacer |
| --- | --- | --- |
| Cliente | cliente@rvsena.com | Pedir, seguir pedidos, favoritos, calificar |
| Cocina | cocina@rvsena.com | Tablero de cocina |
| Administrador | admin@rvsena.com | Todo: panel, productos, categorías, cupones, usuarios |

Cupones: `SENA10` (10 % desde $ 20.000) y `BIENVENIDA` ($ 5.000 desde $ 25.000). `VENCIDO` sirve para probar el rechazo.

## Pruebas

```bash
cd backend
php artisan test
```

23 pruebas de la API: autenticación, menú, cálculo de totales en el servidor, cupones, permisos por rol, estados del pedido y reseñas.

## Estructura

```text
RV-SENA/
├── backend/          API Laravel (Enums, Controllers/Api/V1, Requests, Resources, Policies, Services)
├── frontend/         SPA React (api/, components/, context/, hooks/, pages/, routes/)
└── prototipo-html/   Prototipos HTML originales (referencia)
```

La documentación completa (requisitos, modelo de datos, endpoints, diseño y plan de fases) está en el documento del proyecto.
