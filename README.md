# PathOut - Guía de Ciudades

Una aplicación móvil, web y de escritorio para gestionar puntos de interés en mapas con interfaz centralizada.

## Características

- 🗺️ **Mapa como pantalla principal**: Interfaz centrada en el mapa con lista de POIs integrada
- 📍 **Agregar puntos de interés**: Toca en el mapa para agregar nuevos lugares
- 📋 **Lista lateral**: Panel deslizable con todos tus puntos de interés
- ❤️ **Sistema de favoritos**: Marca tus lugares favoritos directamente desde la lista
- 🗑️ **Gestión completa**: Agregar, eliminar y gestionar favoritos desde una sola pantalla
- 💾 **Persistencia real**: Los datos se guardan localmente y persisten entre sesiones
- 📱 **Multiplataforma**: Funciona en iOS, Android, Web y Desktop con la misma funcionalidad
- 🖥️ **Aplicación de escritorio**: Versión nativa para Windows, macOS y Linux usando Tauri

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd PathOut
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia la aplicación:
```bash
# Para desarrollo
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web

# Para Desktop (Windows/macOS/Linux)
npm run desktop:dev
```

## Uso

### Interfaz Principal

La aplicación ahora tiene una interfaz centralizada donde el mapa es la pantalla principal:

1. **Mapa**: Ocupa la mayor parte de la pantalla
2. **Lista lateral**: Panel deslizable a la izquierda con todos los POIs
3. **Botón de menú**: Para mostrar/ocultar la lista lateral

### Agregar un punto de interés

1. **Toca en cualquier lugar del mapa** donde quieras agregar un punto
2. **Completa el formulario**:
   - Nombre (obligatorio)
   - Descripción (opcional)
   - Categoría (opcional)
3. **Presiona "Guardar"**
4. **El punto aparecerá inmediatamente** en el mapa y en la lista

### Gestionar puntos de interés

Desde la lista lateral puedes:
- **Ver todos los POIs**: Lista completa con tarjetas informativas
- **Marcar como favorito**: Botón de corazón para cada POI
- **Eliminar POI**: Botón de papelera para eliminar permanentemente
- **Seleccionar POI**: Toca en un POI para centrarlo en el mapa

### Ajustes

En la pestaña de Ajustes puedes:
- **Exportar datos**: Descargar todos los POIs como archivo JSON
- **Eliminar todos los datos**: Limpiar completamente la base de datos

## Plataformas Soportadas

### 📱 Móvil (iOS/Android)
- **React Native** con Expo
- **SQLite** para persistencia local
- **React Native Maps** para mapas nativos

### 🌐 Web
- **React Native Web** con Expo
- **localStorage** para persistencia
- **Leaflet** para mapas web

### 🖥️ Desktop (Windows/macOS/Linux)
- **Tauri** para aplicación nativa
- **Build web de Expo** empaquetado
- **Tamaño reducido** (~10MB vs ~100MB de Electron)

## Mejoras Implementadas

### Nueva Interfaz Centralizada

- ✅ **Mapa como pantalla principal**: Interfaz centrada en el mapa
- ✅ **Lista lateral integrada**: Panel deslizable con todos los POIs
- ✅ **Navegación simplificada**: Solo 2 pestañas (Mapa y Ajustes)
- ✅ **Gestión completa**: Agregar, eliminar y favoritos desde una pantalla
- ✅ **Responsive design**: Se adapta a diferentes tamaños de pantalla

### Persistencia de Datos

- ✅ **Persistencia real en web**: Usando localStorage en lugar de mock
- ✅ **Persistencia en móvil**: SQLite nativo para almacenamiento local
- ✅ **Sincronización automática**: Los datos se actualizan en tiempo real
- ✅ **Manejo de errores**: Validación y recuperación de errores

### Aplicación de Escritorio

- ✅ **Tauri nativo**: Aplicación de escritorio moderna y ligera
- ✅ **Multiplataforma**: Windows, macOS y Linux
- ✅ **Rendimiento optimizado**: Mejor que Electron
- ✅ **Tamaño reducido**: ~90% más pequeño que Electron

### Funcionalidades Mejoradas

- ✅ **Eliminación de POIs**: Confirmación antes de eliminar
- ✅ **Exportación de datos**: Descargar POIs como JSON
- ✅ **Gestión de favoritos**: Desde la lista lateral
- ✅ **Interfaz intuitiva**: Botones claros y feedback visual

## Estructura del Proyecto

```
src/
├── api/                 # Servicios de API externa
├── components/          # Componentes reutilizables
├── navigation/          # Configuración de navegación
├── redux/              # Estado global (Redux)
├── screens/            # Pantallas de la aplicación
│   ├── MainMapScreen.tsx  # Pantalla principal con mapa y lista
│   └── SettingsScreen.tsx # Pantalla de ajustes
├── services/           # Servicios de base de datos
│   ├── dbService.ts       # SQLite para móvil
│   └── dbService.web.ts   # localStorage para web
└── types/              # Definiciones de tipos TypeScript

src-tauri/              # Código Rust de Tauri (Desktop)
├── src/
│   └── main.rs         # Punto de entrada
├── Cargo.toml          # Dependencias Rust
└── tauri.conf.json     # Configuración de Tauri
```

## Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **Redux Toolkit** - Gestión de estado
- **SQLite** - Base de datos local (móvil)
- **localStorage** - Almacenamiento local (web)
- **React Navigation** - Navegación
- **React Native Maps** - Mapas en móvil
- **Leaflet** - Mapas en web
- **TypeScript** - Tipado estático
- **Tauri** - Aplicación de escritorio nativa
- **Rust** - Backend de Tauri

## Comandos de Desarrollo

```bash
# Desarrollo móvil
npm start              # Iniciar Expo
npm run android        # Android
npm run ios           # iOS

# Desarrollo web
npm run web           # Navegador

# Desarrollo desktop
npm run desktop:dev   # Tauri en desarrollo
npm run desktop:build # Build de producción
npm run desktop:clean # Limpiar archivos temporales

# Build web
npm run export        # Generar build web para Tauri
```

## Solución de Problemas

### Los POIs no se guardan
- ✅ **Solucionado**: Ahora hay persistencia real en web usando localStorage
- ✅ **Solucionado**: SQLite funciona correctamente en móvil
- Verifica que la aplicación tenga permisos de almacenamiento

### Problemas de interfaz
- ✅ **Solucionado**: Interfaz centralizada en el mapa
- ✅ **Solucionado**: Lista lateral integrada
- ✅ **Solucionado**: Navegación simplificada

### Problemas en Web
- ✅ **Solucionado**: Persistencia real con localStorage
- Asegúrate de que el navegador soporte localStorage
- Verifica que no haya bloqueadores de contenido activos

### Problemas en Desktop
- **Rust no encontrado**: Instala Rust desde https://rustup.rs/
- **Build falla**: Ejecuta `npm run desktop:clean` y vuelve a intentar
- **Ventana en blanco**: Verifica que el build web se genere correctamente

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 

## ¿Qué hacer ahora?

### Opción 1: Usar el build estático (más simple y recomendado)
Como ya generaste el build web con `npm run export`, puedes indicarle a Tauri que use directamente los archivos estáticos en `dist/` en vez de esperar el servidor de desarrollo.

#### 1. Edita el archivo `src-tauri/tauri.conf.json`:
Asegúrate de que la sección `build` tenga esto:
```json
"build": {
  "frontendDist": "../dist",
  "devPath": "../dist",
  "beforeDevCommand": "npm run export",
  "beforeBuildCommand": "npm run export"
}
```
Así Tauri abrirá directamente el build estático y no esperará el servidor de Expo.

#### 2. Guarda y ejecuta:
```powershell
tauri dev
```
o para un build final:
```powershell
tauri build
```

---

### Opción 2: Levantar el servidor de Expo manualmente
Si prefieres probar con hot reload, abre otra terminal y ejecuta:
```powershell
npm run web
```
y espera a que diga que está corriendo en `http://localhost:19006`.  
Luego vuelve a correr `tauri dev`.

---

## Recomendación
Para probar la app de escritorio como la verá el usuario final, usa la **Opción 1** (build estático).

¿Quieres que actualice la configuración automáticamente para que Tauri use el build estático? 