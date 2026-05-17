# Card 1 - Arquitectura público vs privado

## Rutas públicas

- `/`
- `/about`
- `/info`
- `/login`

## Rutas privadas

- `/dashboard`
- `/tasks/*`
- `/stats`

## Flujo de navegación

1. Un usuario sin sesión puede entrar en rutas públicas.
2. Si intenta abrir una ruta privada, el middleware redirige a `/login?next=<ruta>`.
3. En login exitoso:
   - si `next` es válido, redirige a esa ruta;
   - si no hay `next`, redirige a `/dashboard`.
4. Si el usuario ya tiene sesión y abre `/login`, se redirige a `/dashboard`.
