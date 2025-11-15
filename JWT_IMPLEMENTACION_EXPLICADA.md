# 🔐 Implementación de JWT (JSON Web Token) - Guía Completa

## 📋 Resumen de Cambios

Vamos a implementar JWT para mantener sesiones seguras de los usuarios. Esto es **esencial** para:
- ✅ Mantener sesiones autenticadas sin perder datos al refrescar la página
- ✅ Validar solicitudes entre cliente y servidor
- ✅ Usar Socket.io de forma segura (el TradePage ya lo espera)
- ✅ Proteger rutas que requieren autenticación

---

## 🎯 Cambios que Realizaré

### 1. **Backend - Generar y Validar JWT**

**Archivo:** `src/server/routers/users.ts`

**Cambios:**
- ✅ Instalar `jsonwebtoken` y tipos
- ✅ En `POST /users/login`: generar JWT firmado
- ✅ Devolver el token junto con los datos del usuario
- ✅ Crear middleware para validar tokens

**Antes (Sin JWT):**
```typescript
res.status(200).send({
  message: 'Sesión iniciada correctamente',
  user: { id, username, email }
  // ❌ Sin token - sesión vulnerable
});
```

**Después (Con JWT):**
```typescript
const token = jwt.sign(
  { userId: user._id, username: user.username },
  process.env.JWT_SECRET || 'tu-clave-secreta',
  { expiresIn: '7d' }
);

res.status(200).send({
  message: 'Sesión iniciada correctamente',
  user: { id, username, email },
  token  // ✅ JWT firmado que expira en 7 días
});
```

### 2. **Middleware de Autenticación**

**Archivo:** `src/server/middleware/authMiddleware.ts` (NUEVO)

**Qué hace:**
- Verifica que el token es válido
- Extrae la información del usuario
- Protege rutas que requieren autenticación
- Se usa en Socket.io y en rutas de negocio (trades, etc)

**Uso:**
```typescript
userRouter.get('/users/profile', authMiddleware, (req, res) => {
  // Solo usuarios autenticados pueden ver su perfil
});
```

### 3. **Frontend - Guardar y Usar JWT**

**Archivo:** `src/client/services/authService.ts`

**Cambios:**
- ✅ En `login()`: guardar el token en localStorage
- ✅ Nuevo método: `getToken()` para obtener el token
- ✅ Nuevo método: `setAuthHeader()` para incluir en peticiones HTTP
- ✅ Actualizar método `logout()` para limpiar el token

**Antes (Sin JWT):**
```typescript
// Solo guardábamos datos del usuario
localStorage.setItem("user", JSON.stringify(user));
```

**Después (Con JWT):**
```typescript
// Guardamos usuario Y token
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("token", token);  // ✅ JWT

// Helpers para usar el token
getToken(): string | null {
  return localStorage.getItem("token");
}

setAuthHeader() {
  const token = this.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

### 4. **Frontend - SignInForm Actualizado**

**Archivo:** `src/client/components/SignInForm.tsx`

**Cambios:**
- La respuesta del login ahora incluye `token`
- Se guarda automáticamente en localStorage
- Ya está preparado para Socket.io

```typescript
const response = await authService.login(formData);
authService.saveUser(response.user);
authService.saveToken(response.token);  // ✅ Nuevo
```

### 5. **Frontend - TradePage Actualizado**

**Archivo:** `src/client/pages/TradePage.tsx`

**Cambios:**
- Se obtiene el token del localStorage
- Se envía al servidor en Socket.io
- El servidor valida que sea correcto

```typescript
// Ya está hecho en TradePage.tsx línea ~47:
const token = localStorage.getItem("token") || "";
const s = io("http://localhost:3000", { 
  auth: { token },  // ✅ Envía el JWT
  transports: ["websocket"] 
});
```

### 6. **Variable de Entorno**

**Archivo:** `config/dev.env`

**Agregar:**
```
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
JWT_EXPIRY=7d
```

---

## 🔄 Flujo Completo con JWT

### Registro (Sin cambios significativos)
```
1. Usuario llena formulario de signup
2. Se envía POST /users/register
3. Servidor crea usuario en BD
4. Servidor devuelve datos del usuario
5. Frontend redirige a /login
```

### Login (CON JWT)
```
1. Usuario ingresa username y password
2. Se envía POST /users/login
3. Servidor valida credenciales
4. ✅ Servidor genera JWT firmado
5. ✅ Servidor devuelve user + token
6. ✅ Frontend guarda token en localStorage
7. Frontend redirige a /home
```

### Accediendo a Ruta Protegida (Con JWT)
```
1. Frontend quiere acceder a /profile
2. Frontend incluye header: Authorization: Bearer <token>
3. Middleware valida el token
4. Si es válido: permite acceso ✅
5. Si es inválido/expirado: rechaza (401) ❌
```

### Socket.io (Con JWT)
```
1. TradePage se conecta a Socket.io
2. Envía token en auth: { token }
3. Servidor valida token en connection listener
4. Si es válido: permite conectar ✅
5. Si es inválido: rechaza conexión ❌
```

---

## 📦 Dependencias a Instalar

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

---

## 🛡️ Seguridad

### ¿Por qué JWT es mejor que localStorage simple?

| Aspecto | Sin JWT | Con JWT |
|--------|---------|---------|
| **Validación** | Solo verifica si existe en localStorage | Servidor verifica firma + expiracion |
| **Suplantación** | Fácil: copiar datos del localStorage | Difícil: necesitas la clave secreta |
| **Expiración** | No hay (usuario siempre "logueado") | Configurable (7 días, 1 hora, etc) |
| **Socket.io** | ❌ No soporta bien | ✅ Soporta nativamente |
| **Tradeos** | ❌ Vulnerable a hijacking | ✅ Cada petición se valida |

---

## 📝 Archivos que se Modificarán

```
✅ src/server/routers/users.ts
   - Agregar generación de JWT en login
   - Exportar middleware de autenticación

✨ src/server/middleware/authMiddleware.ts (NUEVO)
   - Validar JWT en peticiones

✅ src/client/services/authService.ts
   - Guardar token en login
   - Métodos helper para usar token

✅ src/client/components/SignInForm.tsx
   - Ya está preparado (sin cambios necesarios)

✅ src/client/pages/TradePage.tsx
   - Ya usa token (sin cambios necesarios)

✅ config/dev.env
   - Agregar JWT_SECRET

✅ package.json
   - Ya tiene todas las dependencias
```

---

## ✨ Próximos Beneficios

Una vez implementado JWT, podremos:

1. **Proteger rutas del backend** que requieran autenticación
2. **Validar usuarios en Socket.io** antes de permitir chat/trades
3. **Enviar notificaciones** solo a usuarios autenticados
4. **Crear sistema de trades seguro** donde se valida identidad
5. **Logout automático** cuando expire el token (7 días)
6. **Refresh token** (opcional): permitir renovar sesión sin reloguear

---

