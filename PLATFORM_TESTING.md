# 🚀 Guía de Pruebas Multiplataforma - PathOut

Esta aplicación puede ejecutarse en **Web**, **Android**, **iOS** y **Escritorio** gracias a Expo y Electron.

## 📋 Requisitos Previos

### Para todas las plataformas:
```bash
npm install
```

### Para Android:
- **Android Studio** instalado
- **Emulador Android** configurado o dispositivo físico
- **Expo Go** app en el dispositivo (si usas dispositivo físico)

### Para iOS (solo Mac):
- **Xcode** instalado
- **Simulador iOS** o dispositivo físico

### Para Escritorio:
- **Node.js** y **npm** (ya instalados)

## 🖥️ 1. PRUEBA EN WEB (Navegador)

**La forma más fácil de probar:**

```bash
npm run web
# o
expo start --web
```

- Se abrirá automáticamente en `http://localhost:19006`
- Usa `dbService.web.ts` con localStorage para persistencia
- **No requiere configuración adicional**

## 📱 2. PRUEBA EN ANDROID

### Opción A: Con Emulador
```bash
# 1. Abrir Android Studio y crear/abrir un emulador
# 2. Ejecutar:
npm run android
# o
expo start --android
```

### Opción B: Con Dispositivo Físico
```bash
# 1. Instalar Expo Go desde Google Play Store
# 2. Ejecutar:
npm start
# 3. Escanear el código QR con Expo Go
```

## 🍎 3. PRUEBA EN iOS (solo Mac)

### Opción A: Con Simulador
```bash
npm run ios
# o
expo start --ios
```

### Opción B: Con Dispositivo Físico
```bash
# 1. Instalar Expo Go desde App Store
# 2. Ejecutar:
npm start
# 3. Escanear el código QR con Expo Go
```

## 💻 4. PRUEBA EN ESCRITORIO

### Instalar dependencias de Electron:
```bash
npm install electron electron-builder electron-is-dev --save-dev
```

### Ejecutar en modo desarrollo:
```bash
# Terminal 1: Iniciar servidor web
npm run web

# Terminal 2: En otra terminal, ejecutar Electron
npm run electron
```

### Crear aplicación ejecutable:
```bash
# Construir la aplicación web
expo build:web

# Crear ejecutable de escritorio
npm run build:desktop
```

Los ejecutables se crearán en la carpeta `dist/`:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` file
- **Linux**: `.AppImage` file

## 🔧 Configuración de Base de Datos

### Web y Escritorio:
- Usa `dbService.web.ts` con **localStorage**
- Los datos persisten en el navegador/aplicación

### Android e iOS:
- Usa `dbService.ts` con **SQLite**
- Los datos se almacenan localmente en el dispositivo

## 🐛 Solución de Problemas

### Error "Metro bundler not found":
```bash
npm install -g @expo/cli
```

### Error en Android:
- Verificar que Android Studio esté instalado
- Verificar que el emulador esté ejecutándose
- Verificar variables de entorno ANDROID_HOME

### Error en iOS:
- Verificar que Xcode esté instalado
- Ejecutar `sudo xcode-select --install`

### Error en Electron:
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Comparación de Plataformas

| Plataforma | Fácil de Probar | Base de Datos | Características |
|------------|----------------|---------------|-----------------|
| **Web** | ✅ Muy fácil | localStorage | Acceso inmediato |
| **Android** | ⚠️ Requiere setup | SQLite | Funciones nativas |
| **iOS** | ⚠️ Solo Mac | SQLite | Funciones nativas |
| **Escritorio** | ⚠️ Requiere Electron | localStorage | Aplicación nativa |

## 🎯 Recomendación para Pruebas

1. **Empezar con Web** (más fácil)
2. **Probar en Android** (si tienes setup)
3. **Probar en Escritorio** (para experiencia completa)
4. **Probar en iOS** (solo si tienes Mac)

¡Tu aplicación está lista para funcionar en todas las plataformas! 🎉 