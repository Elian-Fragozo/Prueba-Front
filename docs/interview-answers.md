# Respuestas tecnicas - Prueba Front Ionic

## 1) ¿Cuales fueron los principales desafios?

- Integrar Cordova en un proyecto Ionic moderno manteniendo comandos claros para Android e iOS.
- Mantener una arquitectura simple pero escalable para tareas y categorias sin sobreingenieria.
- Implementar feature flag con Remote Config de forma segura cuando Firebase no esta disponible.
- Conservar buen rendimiento de UI al filtrar tareas y actualizar estado en tiempo real.

## 2) ¿Que tecnicas de optimizacion aplicaste y por que?

- `OnPush` para reducir ciclos de deteccion de cambios innecesarios.
- `trackBy` en listas para minimizar re-renderizado de items.
- Pipeline reactivo (`combineLatest`) para filtros, evitando recomputacion manual.
- Persistencia encapsulada en servicio dedicado para evitar lecturas/escrituras duplicadas.
- Limpieza de suscripciones con `takeUntil` para prevenir fugas de memoria.

## 3) ¿Como aseguraste calidad y mantenibilidad?

- Separacion por capas ligeras:
  - modelos
  - servicios de negocio
  - UI
- Tipado fuerte con interfaces (`TodoTask`, `Category`).
- Manejo centralizado de estado de tareas/categorias en `TaskStoreService`.
- Manejo de errores y fallback en feature flags cuando Firebase no responde.
- Documentacion de setup, build y despliegue en README.

