# Guía de Contribución

¡Gracias por tu interés en contribuir a BeZhas Web3! 🎉

Este documento proporciona pautas para contribuir al proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Proceso de Desarrollo](#proceso-de-desarrollo)
4. [Estándares de Código](#estándares-de-código)
5. [Proceso de Pull Request](#proceso-de-pull-request)
6. [Reportar Bugs](#reportar-bugs)
7. [Sugerir Mejoras](#sugerir-mejoras)

---

## Código de Conducta

Este proyecto y todos los participantes están gobernados por nuestro Código de Conducta. Al participar, se espera que mantengas este código.

### Nuestros Estándares

**Comportamientos Aceptables:**
- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Respetar puntos de vista y experiencias diferentes
- ✅ Aceptar críticas constructivas con gracia
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

**Comportamientos Inaceptables:**
- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Otras conductas que se consideren inapropiadas

---

## Cómo Contribuir

### Tipos de Contribuciones

Aceptamos diferentes tipos de contribuciones:

1. **🐛 Reportar Bugs**: Identifica y reporta problemas
2. **✨ Nuevas Características**: Propón o implementa nuevas features
3. **📝 Documentación**: Mejora o amplía la documentación
4. **🔒 Seguridad**: Identifica y reporta vulnerabilidades
5. **🧪 Tests**: Agrega o mejora tests
6. **🎨 Diseño**: Mejora la UX/UI
7. **🌐 Traducciones**: Ayuda a traducir la documentación

### Antes de Empezar

1. **Busca Issues Existentes**: Verifica si ya existe un issue relacionado
2. **Lee la Documentación**: Familiarízate con el proyecto
3. **Verifica tu Setup**: Ejecuta `./scripts/verify-setup.sh`

---

## Proceso de Desarrollo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU_USUARIO/BeZhas_web3.git
cd BeZhas_web3

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/Angelqg01/BeZhas_web3.git
```

### 2. Crear una Rama

```bash
# Actualiza tu main
git checkout main
git pull upstream main

# Crea una rama para tu feature/fix
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 3. Realizar Cambios

```bash
# Copia y configura .env
cp .env.example .env
# Edita .env con tus valores de desarrollo

# Inicia el entorno de desarrollo
./scripts/local-dev.sh

# Realiza tus cambios
# Prueba tus cambios localmente
```

### 4. Commits

Usa mensajes de commit descriptivos siguiendo el formato:

```
tipo(scope): descripción corta

Descripción más detallada si es necesario.

Fixes #123
```

**Tipos de Commit:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactoring (no es fix ni feature)
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, CI, etc.
- `security`: Cambios relacionados con seguridad

**Ejemplos:**
```bash
git commit -m "feat(docker): add health check to Dockerfile"
git commit -m "fix(api): correct MongoDB connection string format"
git commit -m "docs(readme): update installation instructions"
git commit -m "security(env): protect sensitive environment variables"
```

### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Crea un Pull Request en GitHub
# Usa la plantilla de PR proporcionada
```

---

## Estándares de Código

### JavaScript/Node.js

```javascript
// Usa const/let en lugar de var
const API_URL = 'https://api.example.com';
let counter = 0;

// Nombres descriptivos
function getUserById(userId) { /* ... */ }

// Async/await para promesas
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Comentarios útiles donde sea necesario
// Calculate the total including tax (15%)
const total = subtotal * 1.15;
```

### Docker

```dockerfile
# Usa imágenes específicas, no :latest
FROM node:18-alpine

# Ejecuta como usuario no-root
USER nodejs

# Etiquetas útiles
LABEL maintainer="team@bezhas.com"
LABEL version="1.0.0"
```

### Terraform

```hcl
# Nombres descriptivos de recursos
resource "google_cloud_run_service" "app" {
  name     = "bezhas-web3"
  location = var.region
  
  # Comentarios para configuraciones complejas
  template {
    # This configuration allows auto-scaling based on CPU
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
}
```

### Seguridad

- ✅ NUNCA commitees secretos o credenciales
- ✅ Usa variables de entorno para configuración
- ✅ Valida todos los inputs del usuario
- ✅ Escapa outputs correctamente
- ✅ Usa HTTPS siempre que sea posible
- ✅ Implementa rate limiting en APIs

---

## Proceso de Pull Request

### Checklist del PR

Antes de enviar tu PR, verifica:

- [ ] El código sigue los estándares del proyecto
- [ ] He actualizado la documentación relevante
- [ ] He agregado tests si es necesario
- [ ] Todos los tests pasan localmente
- [ ] No hay archivos sensibles en el commit
- [ ] He probado los cambios localmente
- [ ] El commit message es descriptivo
- [ ] He incluido referencias a issues relacionados

### Proceso de Revisión

1. **Envío del PR**: Usa la plantilla de PR
2. **Revisión Automática**: CI/CD ejecuta checks
3. **Revisión por Pares**: Miembros del equipo revisan
4. **Cambios Solicitados**: Realiza los cambios sugeridos
5. **Aprobación**: Cuando todo esté bien
6. **Merge**: El maintainer hace merge

### Qué Esperar

- **Primera Respuesta**: Dentro de 24-48 horas
- **Revisión Completa**: 3-5 días hábiles
- **Feedback Constructivo**: Siempre respetuoso
- **Iteraciones**: Es normal que haya varias rondas de revisión

---

## Reportar Bugs

### Antes de Reportar

1. **Verifica que es realmente un bug**: No es solo una configuración incorrecta
2. **Busca duplicados**: Revisa issues existentes
3. **Prueba con la última versión**: Asegúrate de estar actualizado
4. **Recopila información**: Logs, versiones, pasos para reproducir

### Cómo Reportar

1. Ve a [Issues](https://github.com/Angelqg01/BeZhas_web3/issues/new/choose)
2. Selecciona "Bug Report"
3. Completa toda la información solicitada
4. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Logs relevantes (sin información sensible)
   - Información del entorno

### Severidad de Bugs

- **🔴 Crítico**: Sistema no funciona, pérdida de datos, brecha de seguridad
- **🟠 Alto**: Funcionalidad principal afectada
- **🟡 Medio**: Funcionalidad secundaria afectada
- **🟢 Bajo**: Problema menor, workaround disponible

---

## Sugerir Mejoras

### Process

1. **Busca sugerencias similares**: Revisa issues existentes
2. **Define el problema**: ¿Qué necesidad o dolor resuelve?
3. **Propón una solución**: Cómo debería funcionar
4. **Considera alternativas**: Otras formas de resolverlo
5. **Crea el issue**: Usa la plantilla de Feature Request

### Criterios de Aceptación

Las features se consideran basándose en:

- **Utilidad**: ¿Beneficia a muchos usuarios?
- **Alcance**: ¿Está dentro del scope del proyecto?
- **Complejidad**: ¿Esfuerzo vs beneficio?
- **Mantenibilidad**: ¿Fácil de mantener a largo plazo?
- **Seguridad**: ¿Introduce riesgos?

---

## Estructura de Branches

```
main
  ├── feature/nueva-caracteristica
  ├── fix/correccion-bug
  ├── docs/actualizar-readme
  └── security/parche-vulnerabilidad
```

- **main**: Rama principal, siempre deployable
- **feature/\***: Nuevas características
- **fix/\***: Correcciones de bugs
- **docs/\***: Cambios en documentación
- **security/\***: Parches de seguridad (prioritarios)

---

## Testing

### Ejecutar Tests Localmente

```bash
# Tests unitarios
npm test

# Tests con Docker
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Linting
npm run lint
```

### Escribir Tests

```javascript
// Ejemplo de test con Jest
describe('API Endpoints', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});
```

---

## Deployment Testing

Antes de hacer merge, prueba en un entorno similar a producción:

```bash
# Build local de producción
docker build -t bezhas-web3:test .
docker run -p 3000:3000 --env-file .env bezhas-web3:test

# O despliega a un entorno de staging en GCP
gcloud run deploy bezhas-web3-staging --source .
```

---

## Preguntas Frecuentes

### ¿Puedo trabajar en un issue que ya tiene asignado a alguien?

No, espera a que esté disponible o pregunta si necesitan ayuda.

### ¿Cuánto tiempo toma que se acepte mi PR?

Típicamente 3-5 días hábiles para la primera revisión.

### ¿Qué hago si mi PR tiene conflictos?

```bash
# Actualiza tu rama con main
git checkout main
git pull upstream main
git checkout feature/tu-rama
git merge main
# Resuelve conflictos
git push origin feature/tu-rama
```

### ¿Puedo trabajar en múltiples issues a la vez?

Sí, pero usa ramas separadas para cada uno.

### Mi PR fue rechazado, ¿qué hago?

Lee el feedback, haz los cambios sugeridos, y vuelve a enviar. No te desanimes, es parte del proceso.

---

## Recursos Adicionales

- [Documentación del Proyecto](README.md)
- [Guía de Despliegue](DEPLOYMENT.md)
- [Guía de Seguridad](SECURITY.md)
- [Inicio Rápido](QUICKSTART.md)

---

## Reconocimiento de Contribuidores

Todos los contribuidores serán reconocidos en:
- README.md (sección de Contributors)
- Releases notes
- CHANGELOG.md

---

## Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la licencia MIT del proyecto.

---

## ¿Necesitas Ayuda?

- 💬 Abre un [Discussion](https://github.com/Angelqg01/BeZhas_web3/discussions)
- 📧 Contacta al equipo
- 📚 Lee la [documentación](DEPLOYMENT.md)

---

**¡Gracias por contribuir a BeZhas Web3!** 🙏

Cada contribución, sin importar cuán pequeña, es valiosa y apreciada.
