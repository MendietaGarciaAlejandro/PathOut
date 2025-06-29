# PathOut - Guía de Ciudades

Una aplicación móvil y web para gestionar puntos de interés en mapas con interfaz centralizada.

## Características

- 🗺️ **Mapa como pantalla principal**: Interfaz centrada en el mapa con lista de POIs integrada
- 📍 **Agregar puntos de interés**: Toca en el mapa para agregar nuevos lugares
- 📋 **Lista lateral**: Panel deslizable con todos tus puntos de interés
- ❤️ **Sistema de favoritos**: Marca tus lugares favoritos directamente desde la lista
- 🗑️ **Gestión completa**: Agregar, eliminar y gestionar favoritos desde una sola pantalla
- 💾 **Persistencia real**: Los datos se guardan localmente y persisten entre sesiones
- 📱 **Multiplataforma**: Funciona en iOS, Android y Web con la misma funcionalidad

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

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 