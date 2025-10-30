# Proyecto-E09

Proyecto desarrollado con Node.js, Express, TypeScript y MongoDB.

## Descripción

API REST desarrollada con Express y MongoDB/Mongoose, escrita en TypeScript.

## Tecnologías

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **TypeScript** - Lenguaje de programación
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Validator** - Validación de datos

## Instalación

Clonar el repositorio
git clone https://github.com/SyTW2526/Proyecto-E09.git

Entrar al directorio
cd Proyecto-E09

Instalar dependencias
npm install

## Configuración

Crea un archivo de configuración en `config/dev.env` con las variables de entorno necesarias:

PORT=3000
MONGODB_URL=mongodb://localhost:27017/basededatos

### Desarrollo

```bash
npm run dev
```
Este comando ejecuta TypeScript en modo watch y reinicia automáticamente el servidor cuando detecta cambios.

### Compilar

```bash
npm run build
```

Compila el código TypeScript a JavaScript en la carpeta `dist/`.

### Producción

```bash
npm start
```

Ejecuta la aplicación compilada desde la carpeta `dist/`.

## Estructura del Proyecto actualmente

```
Proyecto-E09/
├── config/          # Archivos de configuración de entorno
├── src/             # Código fuente TypeScript
│   ├── db/         # Configuración de base de datos
│   ├── models/     # Modelos de Mongoose
│   ├── routers/    # Rutas de la API
│   ├── api.ts      # Configuración de Express
│   └── index.ts    # Punto de entrada
├── dist/           # Código compilado (generado)
└── package.json    # Dependencias y scripts
```

## Autores

Proyecto del grupo E09
Marta rosa cordero 
Abdon senen melendez diaz
Iker diaz cabrera
