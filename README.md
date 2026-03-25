# ZombieFronted

Frontend de la aplicación **Zombie Defense** construido con Angular 19.

## Repositorios del proyecto

| Repositorio | Descripción | URL |
|---|---|---|
| **ZombieFronted** | Frontend Angular 19 | https://github.com/Sebastian2759/ZombieFronted- |
| **ZombieBacked** | Backend .NET 10 | https://github.com/Sebastian2759/ZombieBacked |
| **ZombieRecursos** | Scripts SQL | https://github.com/Sebastian2759/ZombieRecursos |

## Ambientes

### Local (Development)
| Recurso | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend | https://localhost:7777 |
| API | https://localhost:7777/api/v1 |

### Producción (Azure)
| Recurso | URL |
|---|---|
| Frontend | https://calm-island-054064a0f.1.azurestaticapps.net |
| Backend | https://zombie-defense-win-api.azurewebsites.net |
| API | https://zombie-defense-win-api.azurewebsites.net/api/v1 |

## Stack

- Angular 19
- TypeScript 5.7
- SCSS
- Azure Static Web Apps

## Instalación local

```bash
# Instalar dependencias
npm install

# Correr en local
npm start

# Compilar para producción
npm run build
```

## Estructura

```
src/
  app/
  environments/
    environment.ts          # Development (localhost:7777)
    environment.prod.ts     # Producción (Azure)
```

## Deploy a producción

```bash
npm run build
npx @azure/static-web-apps-cli deploy dist/zombie-defense/browser --deployment-token <TOKEN> --env production
```
