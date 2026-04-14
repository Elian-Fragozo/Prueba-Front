# Prueba Frontend Mobile - Ionic Angular Cordova

Aplicacion To-Do List hibrida con Ionic + Angular + Cordova.

## Funcionalidades implementadas

- Crear tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Crear, editar y eliminar categorias.
- Asignar categoria a cada tarea.
- Filtrar tareas por categoria y por texto.
- Persistencia local (Ionic Storage).
- Feature flag con Firebase Remote Config para habilitar/deshabilitar categorias.

## Stack tecnico

- Ionic 8 + Angular 20
- Cordova (android + ios)
- Firebase Remote Config (SDK Web)
- Ionic Storage (persistencia local)

## Estructura

- `src/app/core/models`: modelos de dominio (`TodoTask`, `Category`)
- `src/app/core/services`:
  - `task-store.service.ts`: logica de tareas y categorias
  - `local-storage.service.ts`: persistencia local
  - `feature-flags.service.ts`: feature flag de Remote Config
- `src/app/home`: UI principal
- `src/environments`: configuracion de Firebase y defaults de feature flags

## Configuracion Firebase Remote Config

1. Crear proyecto en Firebase.
2. En `src/environments/environment.ts` y `environment.prod.ts`, completar:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`
3. En Remote Config crear parametro booleano:
   - `enableCategories`
4. Publicar cambios en Remote Config.

Si Firebase no esta configurado, la app usa el valor por defecto:

- `featureFlags.enableCategories` (true por defecto).

## Desarrollo local

```bash
npm install
npm start
```

## Build web

```bash
npm run build
```

## Cordova - Android e iOS

Plataformas ya configuradas en el proyecto:

- android
- ios

Preparar assets web para Cordova:

```bash
npm run cordova:prepare
```

Build Android:

```bash
npm run cordova:build:android
```

Build Android release:

```bash
npm run cordova:build:android:release
```

Ruta esperada APK:

- `platforms/android/app/build/outputs/apk`

Build iOS (solo macOS con Xcode):

```bash
npm run cordova:build:ios
```

Ruta esperada IPA (tras export en Xcode):

- `platforms/ios/build/device/*.ipa`

## Optimizaciones de rendimiento aplicadas

- `ChangeDetectionStrategy.OnPush` en componente principal.
- `trackBy` para listas de tareas y categorias.
- Filtros reactivos con `combineLatest` para evitar calculos imperativos repetitivos.
- Inicializacion centralizada de almacenamiento y feature flags.
- Limpieza de subscripciones con `takeUntil`.

## Evidencias funcionales

Ver carpeta:

- `docs/evidence`

## Respuestas tecnicas

Ver archivo:

- `docs/interview-answers.md`

