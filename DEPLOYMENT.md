# Guía de Despliegue en GCP - BeZhas Web3

Esta guía te llevará paso a paso a través del proceso de configuración y despliegue de tu aplicación Web3 en Google Cloud Platform (GCP).

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial de Git y GitHub](#configuración-inicial-de-git-y-github)
3. [Configuración de GCP](#configuración-de-gcp)
4. [Protección de Archivos Sensibles](#protección-de-archivos-sensibles)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Despliegue con Docker Local](#despliegue-con-docker-local)
7. [Despliegue en GCP](#despliegue-en-gcp)
8. [CI/CD con GitHub Actions](#cicd-con-github-actions)
9. [Administración de Secretos](#administración-de-secretos)
10. [Monitoreo y Logs](#monitoreo-y-logs)
11. [Solución de Problemas](#solución-de-problemas)

---

## Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Git**: `git --version` (v2.x o superior)
- **Docker**: `docker --version` (v20.x o superior)
- **Docker Compose**: `docker-compose --version` (v2.x o superior)
- **Node.js**: `node --version` (v18.x o superior)
- **Google Cloud SDK**: `gcloud --version`
- **Terraform** (opcional): `terraform --version` (v1.x o superior)

### Instalación de Google Cloud SDK

```bash
# macOS
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Descargar desde: https://cloud.google.com/sdk/docs/install
```

---

## Configuración Inicial de Git y GitHub

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `BeZhas_web3`
3. Descripción: "Web3 Application for GCP"
4. Visibilidad: Privado (recomendado para proyectos con secretos)
5. No inicialices con README (ya existe)

### 2. Conectar Repositorio Local con GitHub

```bash
# Navega al directorio del proyecto
cd /path/to/BeZhas_web3

# Verifica el estado de Git
git status

# Agrega todos los archivos (excepto los de .gitignore)
git add .

# Realiza el primer commit
git commit -m "Initial commit: Setup GCP infrastructure"

# Conecta con el repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/Angelqg01/BeZhas_web3.git

# Verifica la conexión
git remote -v

# Sube los cambios
git push -u origin main
```

### 3. Configurar Protección de Ramas

En GitHub:
1. Ve a **Settings** → **Branches**
2. Agrega regla de protección para `main`:
   - ☑️ Require pull request reviews before merging
   - ☑️ Require status checks to pass before merging
   - ☑️ Require branches to be up to date before merging

---

## Configuración de GCP

### 1. Crear Proyecto en GCP

```bash
# Listar proyectos existentes
gcloud projects list

# Crear nuevo proyecto
gcloud projects create bezhas-web3-prod --name="BeZhas Web3 Production"

# Configurar proyecto por defecto
gcloud config set project bezhas-web3-prod

# Habilitar facturación (requerido para Cloud Run)
# Visita: https://console.cloud.google.com/billing
```

### 2. Ejecutar Script de Configuración Automática

```bash
# Dar permisos de ejecución
chmod +x scripts/setup-gcp.sh

# Ejecutar el script
./scripts/setup-gcp.sh
```

El script te solicitará:
- **Project ID**: Tu ID de proyecto GCP
- **Region**: Región preferida (por defecto: us-central1)
- **MongoDB URI**: Cadena de conexión a MongoDB
- **Private Key**: Tu clave privada de Web3
- **JWT Secret**: Secreto para tokens JWT

### 3. Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

```bash
# Establecer variables
export PROJECT_ID="bezhas-web3-prod"
export REGION="us-central1"

# Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Crear cuenta de servicio
gcloud iam service-accounts create bezhas-web3-sa \
    --display-name="BeZhas Web3 Service Account"

# Otorgar permisos
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:bezhas-web3-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

---

## Protección de Archivos Sensibles

### Archivos Protegidos Automáticamente

El archivo `.gitignore` ya protege:

- ✅ `.env` y todos sus variantes
- ✅ `gcp-credentials.json`
- ✅ `service-account-key.json`
- ✅ Claves privadas (*.pem, *.key)
- ✅ Directorio `secrets/`
- ✅ `docker-compose.override.yml`
- ✅ Datos de MongoDB (`mongo-data/`, `mongodb-data/`)
- ✅ `node_modules/`
- ✅ Archivos de estado de Terraform

### Verificar que los Archivos Sensibles NO están en Git

```bash
# Listar archivos trackeados por Git
git ls-files

# Si accidentalmente agregaste un archivo sensible:
git rm --cached archivo-sensible.env
git commit -m "Remove sensitive file"
git push
```

### Usar .env.example como Plantilla

```bash
# Crear tu archivo .env desde la plantilla
cp .env.example .env

# Editar con tus valores reales
nano .env  # o usa tu editor favorito
```

**⚠️ IMPORTANTE**: NUNCA compartas el archivo `.env` real. Solo comparte `.env.example`.

---

## Configuración de Variables de Entorno

### 1. Variables Locales (.env)

Edita el archivo `.env`:

```bash
# Aplicación
NODE_ENV=development
PORT=3000
APP_NAME=BeZhas_web3

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/bezhas_web3
MONGODB_USER=admin
MONGODB_PASSWORD=your_secure_password_here
MONGODB_DATABASE=bezhas_web3

# Web3
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...

# Seguridad
JWT_SECRET=your_jwt_secret_minimum_32_characters
API_KEY=your_api_key_here
SESSION_SECRET=your_session_secret_here
```

### 2. Variables en GCP Secret Manager

```bash
# Crear secretos
echo -n "mongodb://user:pass@host:27017/db" | \
    gcloud secrets create MONGODB_URI --data-file=-

echo -n "0x..." | \
    gcloud secrets create PRIVATE_KEY --data-file=-

echo -n "jwt_secret_here" | \
    gcloud secrets create JWT_SECRET --data-file=-

# Verificar secretos
gcloud secrets list

# Ver versiones de un secreto
gcloud secrets versions list MONGODB_URI
```

### 3. Variables en GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Agrega los siguientes secretos:

| Nombre | Valor |
|--------|-------|
| `GCP_PROJECT_ID` | Tu ID de proyecto GCP |
| `GCP_SA_KEY` | Contenido del archivo JSON de la cuenta de servicio |
| `MONGODB_URI` | URI de MongoDB (si usas MongoDB Atlas) |

---

## Despliegue con Docker Local

### 1. Desarrollo Local con Docker Compose

```bash
# Usar el script de desarrollo
./scripts/local-dev.sh

# O manualmente:
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 2. Verificar que los Servicios Funcionan

```bash
# Verificar estado
docker-compose ps

# Probar la aplicación
curl http://localhost:3000/health

# Conectar a MongoDB
docker-compose exec mongodb mongosh -u admin -p
```

### 3. Reconstruir Contenedores después de Cambios

```bash
# Reconstruir y reiniciar
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f app
```

---

## Despliegue en GCP

### Opción 1: Cloud Run (Recomendado)

Cloud Run es serverless, escala automáticamente y solo pagas por el uso.

```bash
# Construir la imagen
docker build -t gcr.io/$PROJECT_ID/bezhas-web3:latest .

# Autenticar Docker con GCR
gcloud auth configure-docker

# Subir la imagen
docker push gcr.io/$PROJECT_ID/bezhas-web3:latest

# Desplegar en Cloud Run
gcloud run deploy bezhas-web3 \
    --image gcr.io/$PROJECT_ID/bezhas-web3:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production \
    --set-secrets MONGODB_URI=MONGODB_URI:latest,PRIVATE_KEY=PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest

# Obtener URL del servicio
gcloud run services describe bezhas-web3 \
    --region us-central1 \
    --format 'value(status.url)'
```

### Opción 2: Google Kubernetes Engine (GKE)

Para aplicaciones más complejas que requieren Kubernetes:

```bash
# Crear cluster GKE
gcloud container clusters create bezhas-cluster \
    --region us-central1 \
    --num-nodes 2 \
    --machine-type e2-medium

# Obtener credenciales
gcloud container clusters get-credentials bezhas-cluster \
    --region us-central1

# Aplicar manifiestos
kubectl apply -f k8s/

# Ver estado
kubectl get pods
kubectl get services
```

### Opción 3: App Engine

```bash
# Desplegar en App Engine
gcloud app deploy app.yaml --project=$PROJECT_ID

# Ver logs
gcloud app logs tail -s default

# Abrir en navegador
gcloud app browse
```

### Opción 4: Terraform (Infraestructura como Código)

```bash
# Navegar al directorio de Terraform
cd terraform

# Copiar y editar variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Inicializar Terraform
terraform init

# Planear cambios
terraform plan

# Aplicar infraestructura
terraform apply

# Ver outputs
terraform output
```

---

## CI/CD con GitHub Actions

### 1. Configurar GitHub Secrets

Ya configurado en la sección anterior. Verifica que tienes:
- `GCP_PROJECT_ID`
- `GCP_SA_KEY`

### 2. Workflow Automático

El workflow `.github/workflows/deploy-gcp.yml` se activará automáticamente cuando:
- Hagas push a `main` o `production`
- Manualmente desde la pestaña Actions

### 3. Probar el Workflow

```bash
# Hacer un cambio
echo "# Test" >> README.md

# Commit y push
git add README.md
git commit -m "Test CI/CD workflow"
git push origin main

# Monitorear en GitHub
# Ve a: https://github.com/Angelqg01/BeZhas_web3/actions
```

### 4. Despliegue Manual desde GitHub Actions

1. Ve a tu repositorio en GitHub
2. **Actions** → **Deploy to GCP**
3. Click en **Run workflow**
4. Selecciona la rama
5. Click en **Run workflow**

---

## Administración de Secretos

### Mejores Prácticas

1. **NUNCA** commits secretos en Git
2. Usa Secret Manager para producción
3. Rota secretos regularmente
4. Usa diferentes secretos para cada entorno
5. Limita el acceso con IAM

### Rotación de Secretos

```bash
# Crear nueva versión de un secreto
echo -n "new_secret_value" | \
    gcloud secrets versions add SECRET_NAME --data-file=-

# Desactivar versión antigua
gcloud secrets versions disable VERSION_ID --secret=SECRET_NAME

# Eliminar versión antigua (después de verificar)
gcloud secrets versions destroy VERSION_ID --secret=SECRET_NAME
```

### Auditoría de Acceso

```bash
# Ver quién accedió a los secretos
gcloud logging read "resource.type=secretmanager.googleapis.com" \
    --limit 50 \
    --format json
```

---

## Monitoreo y Logs

### Cloud Run Logs

```bash
# Ver logs en tiempo real
gcloud run services logs tail bezhas-web3 --region us-central1

# Buscar errores
gcloud run services logs read bezhas-web3 \
    --region us-central1 \
    --filter="severity=ERROR"
```

### Métricas en Cloud Console

1. Ve a https://console.cloud.google.com/run
2. Click en tu servicio `bezhas-web3`
3. Pestaña **METRICS**:
   - Solicitudes por segundo
   - Latencia
   - Uso de memoria
   - Errores

### Configurar Alertas

```bash
# Crear alerta para errores
gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="BeZhas Web3 - High Error Rate" \
    --condition-display-name="Error rate > 5%" \
    --condition-threshold-value=0.05
```

---

## Solución de Problemas

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Revisar variables de entorno
docker-compose exec app env

# Entrar al contenedor
docker-compose exec app sh
```

### Problema: No puede conectar a MongoDB

```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongodb

# Probar conexión desde el contenedor de la app
docker-compose exec app nc -zv mongodb 27017

# Ver logs de MongoDB
docker-compose logs mongodb
```

### Problema: Secretos no disponibles en Cloud Run

```bash
# Verificar que los secretos existen
gcloud secrets list

# Verificar permisos de la cuenta de servicio
gcloud secrets get-iam-policy SECRET_NAME

# Otorgar acceso
gcloud secrets add-iam-policy-binding SECRET_NAME \
    --member="serviceAccount:SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor"
```

### Problema: GitHub Actions falla

1. Verifica que los secretos están configurados correctamente
2. Revisa los logs en la pestaña Actions
3. Verifica que la cuenta de servicio tiene permisos suficientes

```bash
# Listar roles de la cuenta de servicio
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:bezhas-web3-sa"
```

### Problema: "Permission Denied" al desplegar

```bash
# Otorgar rol de admin de Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:SA_EMAIL" \
    --role="roles/run.admin"

# Otorgar rol para uso de cuentas de servicio
gcloud iam service-accounts add-iam-policy-binding SA_EMAIL \
    --member="serviceAccount:SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"
```

---

## Comandos Útiles de Referencia

```bash
# GCP
gcloud projects list
gcloud config list
gcloud services list --enabled
gcloud run services list
gcloud secrets list

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose ps
docker-compose restart

# Git
git status
git add .
git commit -m "message"
git push
git pull

# Terraform
terraform init
terraform plan
terraform apply
terraform destroy
terraform output
```

---

## Recursos Adicionales

- [Documentación de Google Cloud Run](https://cloud.google.com/run/docs)
- [Documentación de Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Mejores Prácticas de Docker](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

---

## Soporte

Para preguntas o problemas:
1. Revisa la [sección de Solución de Problemas](#solución-de-problemas)
2. Consulta los logs de tu servicio
3. Abre un issue en el repositorio de GitHub

---

**¡Felicidades! Tu aplicación Web3 ahora está lista para GCP.** 🚀
