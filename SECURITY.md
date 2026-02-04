# Guía de Seguridad - BeZhas Web3

## 🔒 Protección de Archivos Sensibles

### Archivos que NUNCA deben commitirse

- ✅ `.env` - Variables de entorno con secretos
- ✅ `gcp-credentials.json` - Credenciales de GCP
- ✅ `service-account-key.json` - Claves de cuentas de servicio
- ✅ `*.pem`, `*.key` - Claves privadas
- ✅ `terraform.tfvars` - Variables de Terraform con valores reales
- ✅ Cualquier archivo en el directorio `secrets/`

### Verificación de Seguridad

```bash
# Verificar que los archivos sensibles NO están trackeados
git ls-files | grep -E '\.env$|\.key$|\.pem$|credentials\.json'

# Si encuentras alguno, elimínalo del tracking
git rm --cached archivo-sensible
git commit -m "Remove sensitive file"
```

## 🔐 Gestión de Secretos

### 1. Desarrollo Local
- Usa `.env` para desarrollo local
- Nunca compartas tu `.env` real
- Usa `.env.example` como plantilla

### 2. Producción en GCP
- Usa **Secret Manager** para todos los secretos
- NUNCA uses variables de entorno en texto plano
- Rota secretos regularmente (cada 90 días)

### 3. CI/CD (GitHub Actions)
- Usa GitHub Secrets para credenciales
- Limita el acceso a secretos por rama
- Usa secretos de entorno cuando sea posible

## 🛡️ Mejores Prácticas de Seguridad

### Docker

1. **Usa imágenes base oficiales y específicas**
   ```dockerfile
   FROM node:18-alpine  # ✅ Bueno - versión específica
   # FROM node:latest   # ❌ Malo - puede cambiar
   ```

2. **Ejecuta como usuario no-root**
   ```dockerfile
   USER nodejs  # ✅ Incluido en el Dockerfile
   ```

3. **No incluyas secretos en la imagen**
   ```dockerfile
   # ❌ MAL
   ENV PRIVATE_KEY=0x123...
   
   # ✅ BIEN - usa variables de entorno en runtime
   ENV NODE_ENV=production
   ```

4. **Usa .dockerignore**
   ```
   .env
   .git
   node_modules
   ```

### MongoDB

1. **Siempre usa autenticación**
   ```bash
   MONGODB_URI=mongodb://user:password@host:27017/db
   ```

2. **Encripta datos sensibles en la base de datos**
3. **Usa conexiones TLS/SSL en producción**
4. **Restringe acceso de red** (firewall, VPC)

### Web3 / Blockchain

1. **NUNCA expongas claves privadas**
2. **Usa HD Wallets cuando sea posible**
3. **Implementa rate limiting en APIs**
4. **Valida todas las transacciones antes de firmar**

### GCP

1. **Principio de mínimo privilegio**
   - Cada servicio solo debe tener los permisos necesarios
   
2. **Habilita auditoría**
   ```bash
   gcloud logging read "resource.type=secretmanager.googleapis.com"
   ```

3. **Usa VPC cuando sea posible**
4. **Habilita Cloud Armor para protección DDoS**

## 🚨 Auditoría de Seguridad

### Escaneo de Dependencias

```bash
# Node.js
npm audit
npm audit fix

# Actualizar dependencias
npm update
npm outdated
```

### Escaneo de Imágenes Docker

```bash
# Usando Docker Scout
docker scout cves gcr.io/PROJECT_ID/bezhas-web3:latest

# Usando Trivy
trivy image gcr.io/PROJECT_ID/bezhas-web3:latest
```

### Verificación de Secretos en Git

```bash
# Instalar gitleaks
brew install gitleaks

# Escanear repositorio
gitleaks detect --source . --verbose

# Escanear historial completo
gitleaks detect --source . --log-opts="--all"
```

## 🔄 Rotación de Secretos

### Procedimiento Recomendado

1. Crear nuevo secreto en Secret Manager
2. Desplegar aplicación con nuevo secreto
3. Verificar que funciona correctamente
4. Desactivar secreto antiguo
5. Después de 30 días, eliminar secreto antiguo

```bash
# Crear nueva versión
echo -n "new_value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Actualizar Cloud Run
gcloud run services update bezhas-web3 \
    --region us-central1 \
    --update-secrets MONGODB_URI=MONGODB_URI:latest

# Desactivar versión antigua
gcloud secrets versions disable OLD_VERSION --secret=SECRET_NAME
```

## 📝 Checklist de Seguridad Pre-Despliegue

- [ ] Todos los secretos están en Secret Manager
- [ ] `.gitignore` incluye todos los archivos sensibles
- [ ] No hay secretos hardcodeados en el código
- [ ] Docker corre como usuario no-root
- [ ] MongoDB usa autenticación
- [ ] Dependencias están actualizadas (`npm audit`)
- [ ] Imágenes Docker escaneadas por vulnerabilidades
- [ ] HTTPS habilitado en producción
- [ ] Logs no contienen información sensible
- [ ] Backups configurados para MongoDB
- [ ] Monitoreo y alertas configuradas

## 🆘 Qué Hacer si un Secreto se Compromete

1. **Inmediatamente:**
   - Rota el secreto comprometido
   - Revoca acceso si es posible (API keys, tokens)
   - Elimina el secreto del historial de Git si fue commiteado

2. **Eliminar de Git (si fue commiteado):**
   ```bash
   # Usar BFG Repo-Cleaner
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

3. **Notificar:**
   - Equipo de desarrollo
   - Usuarios afectados (si aplica)
   - Servicios de terceros (si sus credenciales fueron expuestas)

4. **Investigar:**
   - Revisar logs de acceso
   - Identificar el alcance del compromiso
   - Documentar el incidente

5. **Prevenir:**
   - Implementar pre-commit hooks
   - Capacitar al equipo
   - Mejorar procesos

## 🔗 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

**Recuerda: La seguridad es un proceso continuo, no un estado.** 🔒
