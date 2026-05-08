# Card 1 - Arquitectura publico vs privado

## Rutas publicas

- `/`
- `/about`
- `/info`
- `/login`

## Rutas privadas

- `/dashboard`
- `/tasks/*`
- `/stats`

## Flujo de navegacion

1. Un usuario sin sesion puede entrar en rutas publicas.
2. Si intenta abrir una ruta privada, el middleware redirige a `/login?next=<ruta>`.
3. En login exitoso:
   - si `next` es valido, redirige a esa ruta;
   - si no hay `next`, redirige a `/dashboard`.
4. Si el usuario ya tiene sesion y abre `/login`, se redirige a `/dashboard`.
