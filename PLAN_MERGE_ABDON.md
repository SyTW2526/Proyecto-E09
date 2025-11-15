# 📋 Plan: Mezclar dev-abdon → dev

## 🔍 Cambios en dev-abdon (que no están en dev)

```
7 commits nuevos en dev-abdon:
├─ c8a4deb: Toques finales para probar dark y idioma
├─ cb74881: Agregar estilos dark mode a componentes
├─ 82ca597: feat: Agregar i18n a componentes principales
├─ 14cf813: fix: Corregir rutas de dist en package.json
├─ ad3dbf4: feat: Agregar i18n a componentes de header
├─ ddea051: fix: Agregar tailwind config y mejorar dark mode
└─ 5bda4a6: feat: Add notification bell, language selector, dark mode toggle
```

## ✨ Lo que trae dev-abdon

1. **Dark Mode** 🌙 - Tema oscuro en toda la app
2. **i18n (Internacionalización)** 🌍 - Soporte para múltiples idiomas
3. **Language Selector** 🗣️ - Selector de idioma en Header
4. **Notification Bell** 🔔 - Icono de notificaciones
5. **Tailwind Config** ⚙️ - Configuración mejorada
6. **Bug Fixes** 🐛 - Correcciones varias

---

## 🚀 Pasos para Mezclar (Ya te los hago yo)

### 1️⃣ Traer cambios de dev-abdon (sin sobrescribir lo actual)
```bash
git merge origin/dev-abdon --no-ff -m "Merge: Traer dark mode e i18n desde dev-abdon"
```

### 2️⃣ Si hay conflictos, resolverlos manualmente

### 3️⃣ Pushear a origin/dev

### 4️⃣ Pushear a origin/main (opcional, cuando todo funcione)

---

## ⚠️ Posibles Conflictos

Probables conflictos en:
- `package.json` - dependencias nuevas para i18n
- `tsconfig.json` - configuración
- Componentes de Header (modificados en ambas ramas)
- Tailwind config

---

Voy a hacerlo ahora mismo 🚀
