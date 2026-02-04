# BeZhas_web3

> Aplicación Web3 lista para desplegar en Google Cloud Platform (GCP)

[![Deploy to GCP](https://img.shields.io/badge/Deploy-GCP-4285F4?logo=google-cloud)](https://cloud.google.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Características

- ✅ **Arquitectura lista para producción** con Docker y Docker Compose
- ✅ **Despliegue automático en GCP** con Cloud Run, App Engine o GKE
- ✅ **CI/CD con GitHub Actions** - despliegue automático al hacer push
- ✅ **Gestión segura de secretos** con GCP Secret Manager
- ✅ **MongoDB containerizado** para desarrollo local
- ✅ **Infraestructura como código** con Terraform
- ✅ **Configuración de seguridad** completa con `.gitignore` y mejores prácticas
- ✅ **Scripts automatizados** para configuración y despliegue

## 📋 Prerequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker](https://www.docker.com/get-started) y Docker Compose
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Git](https://git-scm.com/)
- Cuenta de [Google Cloud Platform](https://cloud.google.com)
- Cuenta de [GitHub](https://github.com)

## 🏗️ Estructura del Proyecto

```
BeZhas_web3/
├── .github/
│   └── workflows/
│       └── deploy-gcp.yml      # GitHub Actions CI/CD
├── k8s/
│   └── deployment.yaml         # Manifiestos de Kubernetes
├── mongo-init/
│   └── init-mongo.js           # Script de inicialización de MongoDB
├── scripts/
│   ├── setup-gcp.sh            # Script de configuración de GCP
│   └── local-dev.sh            # Script de desarrollo local
├── terraform/
│   ├── main.tf                 # Configuración principal de Terraform
│   ├── variables.tf            # Variables de Terraform
│   ├── outputs.tf              # Outputs de Terraform
│   └── terraform.tfvars.example
├── .dockerignore               # Archivos ignorados por Docker
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Archivos ignorados por Git
├── app.yaml                    # Configuración de App Engine
├── cloudbuild.yaml             # Configuración de Cloud Build
├── docker-compose.yml          # Orquestación de contenedores
├── Dockerfile                  # Imagen de Docker de la aplicación
├── DEPLOYMENT.md               # Guía completa de despliegue
├── SECURITY.md                 # Guía de seguridad
├── index.js                    # Punto de entrada de la aplicación
├── package.json                # Dependencias de Node.js
└── README.md                   # Este archivo
```

## 🚦 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Angelqg01/BeZhas_web3.git
cd BeZhas_web3
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus valores
nano .env
```

### 3. Desarrollo Local con Docker

```bash
# Opción 1: Usar el script automatizado
./scripts/local-dev.sh

# Opción 2: Manualmente
docker-compose up -d
```

La aplicación estará disponible en: http://localhost:3000

### 4. Configurar GCP

```bash
# Ejecutar el script de configuración
./scripts/setup-gcp.sh
```

Este script:
- ✅ Habilita las APIs necesarias de GCP
- ✅ Crea cuentas de servicio
- ✅ Configura Secret Manager
- ✅ Genera credenciales para CI/CD

### 5. Desplegar en GCP

```bash
# Usando gcloud CLI
gcloud run deploy bezhas-web3 --source .

# O usando npm scripts
npm run gcp:deploy
```

## 📚 Documentación Detallada

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue paso a paso
- **[SECURITY.md](SECURITY.md)** - Mejores prácticas de seguridad

## 🔒 Seguridad

Este proyecto implementa las siguientes medidas de seguridad:

- **Protección de secretos**: Archivos `.env` nunca se commitean
- **Secret Manager**: Todos los secretos en producción usan GCP Secret Manager
- **Contenedores seguros**: Imágenes minimalistas y ejecución como usuario no-root
- **Autenticación MongoDB**: Siempre con usuario y contraseña
- **HTTPS**: Habilitado por defecto en Cloud Run
- **IAM**: Principio de mínimo privilegio

⚠️ **Importante**: Lee [SECURITY.md](SECURITY.md) antes de desplegar en producción.

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start                  # Iniciar aplicación
npm run dev               # Modo desarrollo con nodemon
npm test                  # Ejecutar tests

# Docker
npm run docker:build      # Construir imagen Docker
npm run docker:run        # Iniciar contenedores
npm run docker:stop       # Detener contenedores
npm run docker:logs       # Ver logs

# GCP
npm run gcp:setup         # Configurar GCP
npm run gcp:deploy        # Desplegar a Cloud Run
npm run local:dev         # Entorno de desarrollo local
```

## 🌐 Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Información de la API |
| `/health` | GET | Health check del servicio |
| `/db-status` | GET | Estado de conexión con MongoDB |
| `/web3-info` | GET | Información de configuración Web3 |

## 🚀 Opciones de Despliegue en GCP

### Opción 1: Cloud Run (Recomendado)
- **Serverless** - No te preocupes por servidores
- **Escalado automático** - De 0 a N instancias
- **Pay-per-use** - Solo pagas por lo que usas

```bash
gcloud run deploy bezhas-web3 --source .
```

### Opción 2: App Engine
- **PaaS completo** - Gestión simplificada
- **Escalado automático**
- **Múltiples versiones**

```bash
gcloud app deploy
```

### Opción 3: Google Kubernetes Engine (GKE)
- **Kubernetes completo** - Máximo control
- **Para aplicaciones complejas**
- **Alta disponibilidad**

```bash
kubectl apply -f k8s/
```

### Opción 4: Terraform
- **Infraestructura como código**
- **Reproducible y versionado**

```bash
cd terraform
terraform init
terraform apply
```

## 🔄 CI/CD con GitHub Actions

El workflow está configurado para:

1. **Trigger automático** al hacer push a `main`
2. **Build** de la imagen Docker
3. **Push** a Google Container Registry
4. **Deploy** automático a Cloud Run
5. **Notificación** de URL de despliegue

Para configurar:
1. Agrega `GCP_PROJECT_ID` y `GCP_SA_KEY` a GitHub Secrets
2. Haz push a la rama `main`
3. El despliegue se ejecutará automáticamente

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Health check
curl http://localhost:3000/health

# Test MongoDB connection
curl http://localhost:3000/db-status
```

## 📊 Monitoreo

Accede a las métricas en GCP Console:

- **Logs**: Cloud Logging
- **Métricas**: Cloud Monitoring
- **Errores**: Error Reporting
- **Trazas**: Cloud Trace

```bash
# Ver logs en tiempo real
gcloud run services logs tail bezhas-web3 --region us-central1
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Variables de Entorno

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `NODE_ENV` | Entorno de ejecución | No | `development` |
| `PORT` | Puerto del servidor | No | `3000` |
| `MONGODB_URI` | URI de conexión a MongoDB | Sí | - |
| `WEB3_PROVIDER_URL` | URL del proveedor Web3 | Sí | - |
| `PRIVATE_KEY` | Clave privada para transacciones | Sí | - |
| `JWT_SECRET` | Secreto para tokens JWT | Sí | - |

Ver `.env.example` para la lista completa.

## 🐛 Solución de Problemas

### Contenedor no inicia
```bash
docker-compose logs app
```

### No conecta a MongoDB
```bash
docker-compose ps mongodb
docker-compose logs mongodb
```

### Errores en GCP
```bash
gcloud run services logs read bezhas-web3
```

Ver más en [DEPLOYMENT.md - Solución de Problemas](DEPLOYMENT.md#solución-de-problemas)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- 📖 [Documentación Completa](DEPLOYMENT.md)
- 🔒 [Guía de Seguridad](SECURITY.md)
- 🐛 [Reportar un Bug](https://github.com/Angelqg01/BeZhas_web3/issues)
- 💡 [Solicitar Feature](https://github.com/Angelqg01/BeZhas_web3/issues)

## 🌟 Agradecimientos

- Google Cloud Platform
- Docker Community
- Node.js Community
- Web3.js Team

---

**Desarrollado con ❤️ para despliegue en GCP** 🚀

Para más información, consulta la [Guía Completa de Despliegue](DEPLOYMENT.md).
