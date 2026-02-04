# 🚀 Comenzando con BeZhas Web3 en GCP

> **Guía completa para configurar y desplegar tu aplicación Web3 en Google Cloud Platform**

¡Bienvenido! Este documento te guiará a través de todo el proceso, desde la configuración inicial hasta el despliegue en producción.

---

## 📚 Índice de Documentación

| Documento | Descripción | Cuándo Usarlo |
|-----------|-------------|---------------|
| **[README.md](README.md)** | Visión general del proyecto | Primer documento a leer |
| **[QUICKSTART.md](QUICKSTART.md)** | Inicio rápido (5-10 min) | Para probar la aplicación rápidamente |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guía completa de despliegue | Para desplegar en GCP paso a paso |
| **[SECURITY.md](SECURITY.md)** | Mejores prácticas de seguridad | Antes de ir a producción |
| **Este archivo** | Roadmap y guía de inicio | Para entender el proyecto completo |

---

## 🎯 ¿Qué Contiene Este Repositorio?

Este repositorio incluye **TODO** lo necesario para desplegar una aplicación Web3 en GCP:

### ✅ Infraestructura como Código
- **Terraform**: Definición completa de recursos GCP
- **Kubernetes**: Manifiestos para GKE
- **Docker**: Contenedores optimizados para producción

### ✅ Automatización CI/CD
- **GitHub Actions**: Despliegue automático al hacer push
- **Cloud Build**: Construcción y despliegue en GCP
- **Scripts Bash**: Automatización de tareas comunes

### ✅ Configuración de Desarrollo
- **Docker Compose**: Entorno local completo
- **MongoDB**: Base de datos containerizada
- **Variables de Entorno**: Plantillas para todos los entornos

### ✅ Seguridad
- **Secret Manager**: Gestión segura de credenciales
- **IAM**: Configuración de permisos
- **Protección de archivos sensibles**: .gitignore completo

### ✅ Documentación
- Guías en español
- Paso a paso detallado
- Solución de problemas
- Mejores prácticas

---

## 🗺️ Roadmap de Implementación

Sigue estos pasos en orden para una implementación exitosa:

### Fase 1: Preparación Local (30 minutos)

#### ✅ Paso 1: Clonar y Configurar
```bash
git clone https://github.com/Angelqg01/BeZhas_web3.git
cd BeZhas_web3
cp .env.example .env
nano .env  # Edita con tus valores
```

#### ✅ Paso 2: Probar Localmente
```bash
./scripts/local-dev.sh
# Verifica: http://localhost:3000/health
```

📖 **Documentación**: [QUICKSTART.md](QUICKSTART.md)

---

### Fase 2: Configuración de Git y GitHub (15 minutos)

#### ✅ Paso 3: Crear Repositorio en GitHub
1. Ve a https://github.com/new
2. Crea repositorio `BeZhas_web3`
3. Mantén privado (recomendado)

#### ✅ Paso 4: Conectar con GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/BeZhas_web3.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

#### ✅ Paso 5: Configurar Protección de Ramas
- Settings → Branches → Add rule
- Proteger rama `main`
- Requerir revisiones antes de merge

📖 **Documentación**: [DEPLOYMENT.md - Configuración de Git](DEPLOYMENT.md#configuración-inicial-de-git-y-github)

---

### Fase 3: Configuración de GCP (30 minutos)

#### ✅ Paso 6: Crear Proyecto en GCP
```bash
# Instalar gcloud CLI si no lo tienes
# macOS: brew install --cask google-cloud-sdk
# Linux: curl https://sdk.cloud.google.com | bash

gcloud projects create bezhas-web3-prod --name="BeZhas Web3"
gcloud config set project bezhas-web3-prod
```

#### ✅ Paso 7: Ejecutar Setup Automático
```bash
chmod +x scripts/setup-gcp.sh
./scripts/setup-gcp.sh
```

El script configurará:
- ✅ APIs necesarias de GCP
- ✅ Cuentas de servicio
- ✅ Secret Manager
- ✅ Permisos IAM
- ✅ Credenciales para CI/CD

📖 **Documentación**: [DEPLOYMENT.md - Configuración de GCP](DEPLOYMENT.md#configuración-de-gcp)

---

### Fase 4: Configuración de Secretos (20 minutos)

#### ✅ Paso 8: Configurar GitHub Secrets
En GitHub: Settings → Secrets and variables → Actions

Agregar:
- `GCP_PROJECT_ID`: Tu ID de proyecto
- `GCP_SA_KEY`: Contenido del archivo JSON de la cuenta de servicio

#### ✅ Paso 9: Configurar GCP Secret Manager
```bash
# MongoDB URI
echo -n "mongodb://..." | gcloud secrets create MONGODB_URI --data-file=-

# Private Key (Web3)
echo -n "0x..." | gcloud secrets create PRIVATE_KEY --data-file=-

# JWT Secret
echo -n "tu_secreto_jwt" | gcloud secrets create JWT_SECRET --data-file=-
```

📖 **Documentación**: [DEPLOYMENT.md - Administración de Secretos](DEPLOYMENT.md#administración-de-secretos)

---

### Fase 5: Despliegue en GCP (15 minutos)

#### ✅ Paso 10: Elegir Método de Despliegue

**Opción A: Cloud Run (Recomendado para empezar)**
```bash
gcloud run deploy bezhas-web3 --source .
```

**Opción B: GitHub Actions (CI/CD Automático)**
```bash
git push origin main  # Se despliega automáticamente
```

**Opción C: Terraform (Infraestructura como Código)**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edita con tus valores
terraform init
terraform apply
```

**Opción D: Kubernetes (Para apps complejas)**
```bash
gcloud container clusters create bezhas-cluster
kubectl apply -f k8s/
```

📖 **Documentación**: [DEPLOYMENT.md - Despliegue en GCP](DEPLOYMENT.md#despliegue-en-gcp)

---

### Fase 6: Verificación y Monitoreo (10 minutos)

#### ✅ Paso 11: Verificar Despliegue
```bash
# Obtener URL del servicio
gcloud run services describe bezhas-web3 \
    --region us-central1 \
    --format 'value(status.url)'

# Probar endpoints
curl https://tu-url.run.app/health
curl https://tu-url.run.app/db-status
```

#### ✅ Paso 12: Configurar Monitoreo
```bash
# Ver logs en tiempo real
gcloud run services logs tail bezhas-web3

# Ver métricas en GCP Console
# https://console.cloud.google.com/run
```

📖 **Documentación**: [DEPLOYMENT.md - Monitoreo y Logs](DEPLOYMENT.md#monitoreo-y-logs)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         DESARROLLO LOCAL                        │
├─────────────────────────────────────────────────────────────────┤
│  Docker Compose                                                  │
│  ├── App Container (Node.js)                                     │
│  └── MongoDB Container                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                   │
├─────────────────────────────────────────────────────────────────┤
│  GitHub Actions Workflow                                         │
│  ├── Build Docker Image                                          │
│  ├── Push to GCR                                                 │
│  └── Deploy to Cloud Run                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ deploy
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE CLOUD PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Run (Aplicación)                                          │
│  ├── Autoscaling (1-10 instancias)                               │
│  ├── HTTPS automático                                            │
│  └── Variables desde Secret Manager                              │
│                                                                   │
│  Secret Manager (Secretos)                                       │
│  ├── MONGODB_URI                                                 │
│  ├── PRIVATE_KEY                                                 │
│  └── JWT_SECRET                                                  │
│                                                                   │
│  Container Registry (Imágenes Docker)                            │
│  Cloud Monitoring (Logs y Métricas)                              │
│  IAM (Permisos y Seguridad)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ connect
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICIOS EXTERNOS                             │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas (Base de Datos)                                   │
│  Infura/Alchemy (Web3 Provider)                                  │
│  Ethereum Network (Blockchain)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad: Checklist Completo

Antes de desplegar en producción, verifica:

### Archivos y Secretos
- [ ] `.env` NO está en Git (verificar con `git ls-files`)
- [ ] Todos los secretos están en Secret Manager
- [ ] No hay claves hardcodeadas en el código
- [ ] `.gitignore` incluye todos los archivos sensibles

### Docker y Contenedores
- [ ] Contenedor corre como usuario no-root
- [ ] Imagen base es específica (no `:latest`)
- [ ] `.dockerignore` excluye archivos innecesarios
- [ ] Imagen escaneada por vulnerabilidades

### MongoDB
- [ ] Autenticación habilitada
- [ ] Usuario con permisos mínimos
- [ ] Conexión con TLS/SSL en producción
- [ ] Backups configurados

### GCP
- [ ] Permisos IAM siguiendo principio de mínimo privilegio
- [ ] Secret Manager para todos los secretos
- [ ] Cloud Monitoring configurado
- [ ] Alertas configuradas para errores

### Web3
- [ ] Claves privadas NUNCA expuestas
- [ ] Rate limiting implementado
- [ ] Validación de transacciones antes de firmar

📖 **Documentación Completa**: [SECURITY.md](SECURITY.md)

---

## 📁 Estructura de Archivos Explicada

```
BeZhas_web3/
├── 📄 README.md              # Visión general del proyecto
├── 📄 QUICKSTART.md          # Inicio rápido (5-10 min)
├── 📄 DEPLOYMENT.md          # Guía completa de despliegue
├── 📄 SECURITY.md            # Mejores prácticas de seguridad
├── 📄 GETTING_STARTED.md     # Este archivo (roadmap completo)
│
├── 🐳 Docker Files
│   ├── Dockerfile            # Imagen de producción
│   ├── docker-compose.yml    # Desarrollo local
│   └── .dockerignore         # Archivos excluidos de imagen
│
├── ⚙️ GCP Configuration
│   ├── app.yaml              # App Engine config
│   ├── cloudbuild.yaml       # Cloud Build CI/CD
│   └── .gcloudignore         # Archivos excluidos de despliegue
│
├── 🔧 GitHub Actions
│   └── .github/workflows/
│       └── deploy-gcp.yml    # CI/CD workflow
│
├── ☸️ Kubernetes
│   └── k8s/
│       └── deployment.yaml   # Manifiestos de K8s
│
├── 🏗️ Terraform (IaC)
│   └── terraform/
│       ├── main.tf           # Recursos principales
│       ├── variables.tf      # Variables
│       ├── outputs.tf        # Outputs
│       └── terraform.tfvars.example
│
├── 🗄️ MongoDB
│   └── mongo-init/
│       └── init-mongo.js     # Script de inicialización
│
├── 🔨 Scripts
│   ├── scripts/setup-gcp.sh # Setup automático de GCP
│   └── scripts/local-dev.sh # Desarrollo local
│
├── 🔒 Security
│   ├── .env.example          # Plantilla de variables
│   └── .gitignore            # Archivos protegidos
│
└── 💻 Application
    ├── index.js              # Aplicación principal
    ├── package.json          # Dependencias Node.js
    └── LICENSE               # MIT License
```

---

## �� Recursos de Aprendizaje

### Documentación Oficial
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

### Tutoriales Recomendados
- [Containerizing a Node.js Application](https://docs.docker.com/language/nodejs/containerize/)
- [Deploying to Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)
- [Managing Secrets with Secret Manager](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets)

---

## 🆘 Obtener Ayuda

### ¿Tienes un Problema?

1. **Revisa la documentación**:
   - [Solución de Problemas](DEPLOYMENT.md#solución-de-problemas)
   - [Guía de Seguridad](SECURITY.md)

2. **Verifica los logs**:
   ```bash
   # Local
   docker-compose logs -f
   
   # GCP
   gcloud run services logs tail bezhas-web3
   ```

3. **Busca en GitHub Issues**:
   - Revisa si alguien ya reportó el mismo problema

4. **Crea un nuevo issue**:
   - Describe el problema
   - Incluye logs relevantes
   - Menciona tu configuración

---

## ✅ Checklist de Finalización

¿Listo para producción? Verifica:

### Desarrollo
- [ ] Aplicación funciona localmente
- [ ] Tests pasan (si los hay)
- [ ] Código versionado en Git
- [ ] README actualizado

### Seguridad
- [ ] Todos los items del [checklist de seguridad](#🔐-seguridad-checklist-completo)
- [ ] Secretos en Secret Manager
- [ ] Permisos IAM configurados
- [ ] Logs no contienen información sensible

### Despliegue
- [ ] GitHub Secrets configurados
- [ ] CI/CD funcionando
- [ ] Aplicación accesible en Cloud Run
- [ ] Endpoints responden correctamente

### Monitoreo
- [ ] Cloud Monitoring configurado
- [ ] Alertas configuradas
- [ ] Logs centralizados
- [ ] Health checks funcionando

### Documentación
- [ ] Variables de entorno documentadas
- [ ] Proceso de despliegue documentado
- [ ] Procedimientos de emergencia definidos

---

## 🚀 Próximos Pasos

Una vez que tu aplicación esté desplegada:

1. **Implementa Features**
   - Agrega endpoints de tu lógica de negocio
   - Conecta con contratos inteligentes
   - Implementa autenticación

2. **Optimiza**
   - Configura CDN si sirves assets estáticos
   - Implementa caching
   - Optimiza consultas a la base de datos

3. **Escala**
   - Ajusta autoscaling según necesidades
   - Considera usar Cloud CDN
   - Implementa load balancing si es necesario

4. **Monitorea**
   - Revisa métricas regularmente
   - Configura alertas proactivas
   - Analiza logs de errores

5. **Mantén**
   - Actualiza dependencias regularmente
   - Rota secretos cada 90 días
   - Revisa y optimiza costos de GCP

---

## 🎉 ¡Felicidades!

Has configurado un entorno completo de desarrollo y producción para una aplicación Web3 en GCP con:

- ✅ Despliegue automatizado
- ✅ Gestión segura de secretos
- ✅ Infraestructura escalable
- ✅ Monitoreo integrado
- ✅ CI/CD funcional

**¡Ahora puedes concentrarte en construir tu aplicación!** 🚀

---

## 📞 Soporte y Contacto

- 📖 [Documentación](DEPLOYMENT.md)
- 🐛 [Reportar Bug](https://github.com/Angelqg01/BeZhas_web3/issues/new?template=bug_report.md)
- 💡 [Solicitar Feature](https://github.com/Angelqg01/BeZhas_web3/issues/new?template=feature_request.md)
- 📧 Contacto: [Abrir issue en GitHub]

---

**Desarrollado con ❤️ para facilitar el despliegue de aplicaciones Web3 en GCP**
