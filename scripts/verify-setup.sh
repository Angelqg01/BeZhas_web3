#!/bin/bash
# Script to verify that the setup is correct before deployment

set -e

echo "===================================================="
echo "BeZhas Web3 - Setup Verification Script"
echo "===================================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo "Verificando requisitos del sistema..."
echo ""

# Check if required tools are installed
if command -v docker &> /dev/null; then
    print_success "Docker está instalado ($(docker --version))"
else
    print_error "Docker no está instalado"
fi

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose está instalado ($(docker-compose --version))"
elif docker compose version &> /dev/null; then
    print_success "Docker Compose está instalado ($(docker compose version))"
else
    print_error "Docker Compose no está instalado"
fi

if command -v git &> /dev/null; then
    print_success "Git está instalado ($(git --version))"
else
    print_error "Git no está instalado"
fi

if command -v node &> /dev/null; then
    print_success "Node.js está instalado ($(node --version))"
else
    print_warning "Node.js no está instalado (opcional para desarrollo)"
fi

if command -v gcloud &> /dev/null; then
    print_success "Google Cloud SDK está instalado ($(gcloud --version | head -n 1))"
else
    print_warning "Google Cloud SDK no está instalado (requerido para GCP)"
fi

if command -v terraform &> /dev/null; then
    print_success "Terraform está instalado ($(terraform --version | head -n 1))"
else
    print_warning "Terraform no está instalado (opcional, solo si usas IaC)"
fi

echo ""
echo "Verificando archivos de configuración..."
echo ""

# Check if important files exist
if [ -f ".env" ]; then
    print_success "Archivo .env existe"
else
    print_warning "Archivo .env no existe (copia .env.example a .env)"
fi

if [ -f ".gitignore" ]; then
    print_success "Archivo .gitignore existe"
else
    print_error "Archivo .gitignore no existe"
fi

if [ -f "Dockerfile" ]; then
    print_success "Dockerfile existe"
else
    print_error "Dockerfile no existe"
fi

if [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml existe"
else
    print_error "docker-compose.yml no existe"
fi

if [ -f "package.json" ]; then
    print_success "package.json existe"
else
    print_error "package.json no existe"
fi

echo ""
echo "Verificando protección de archivos sensibles..."
echo ""

# Check if sensitive files are NOT in git
if git ls-files | grep -q "^\.env$"; then
    print_error "¡PELIGRO! .env está en Git. Elimínalo con: git rm --cached .env"
else
    print_success "Archivo .env NO está en Git (correcto)"
fi

if git ls-files | grep -q "\.key$\|\.pem$\|credentials\.json$"; then
    print_error "¡PELIGRO! Se encontraron archivos de claves en Git"
else
    print_success "No se encontraron archivos de claves en Git (correcto)"
fi

echo ""
echo "Verificando variables de entorno..."
echo ""

if [ -f ".env" ]; then
    # Check if required variables are set in .env
    required_vars=("MONGODB_URI" "WEB3_PROVIDER_URL" "JWT_SECRET")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=your_" .env && ! grep -q "^$var=$" .env; then
            print_success "Variable $var está configurada"
        else
            print_warning "Variable $var no está configurada o usa valor por defecto"
        fi
    done
else
    print_warning "No se puede verificar variables (archivo .env no existe)"
fi

echo ""
echo "Verificando permisos de scripts..."
echo ""

if [ -x "scripts/setup-gcp.sh" ]; then
    print_success "scripts/setup-gcp.sh tiene permisos de ejecución"
else
    print_warning "scripts/setup-gcp.sh no es ejecutable (ejecuta: chmod +x scripts/setup-gcp.sh)"
fi

if [ -x "scripts/local-dev.sh" ]; then
    print_success "scripts/local-dev.sh tiene permisos de ejecución"
else
    print_warning "scripts/local-dev.sh no es ejecutable (ejecuta: chmod +x scripts/local-dev.sh)"
fi

echo ""
echo "Verificando configuración de Git..."
echo ""

if git remote -v | grep -q "origin"; then
    print_success "Repositorio remoto configurado"
    git remote -v | head -n 2
else
    print_warning "No hay repositorio remoto configurado"
fi

if git branch --show-current &> /dev/null; then
    print_success "Rama actual: $(git branch --show-current)"
else
    print_warning "No se pudo determinar la rama actual"
fi

echo ""
echo "===================================================="
echo "Resumen de Verificación"
echo "===================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todo está perfecto!${NC}"
    echo "Tu setup está listo para desarrollo y despliegue."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup completo con advertencias${NC}"
    echo "Errores: 0"
    echo "Advertencias: $WARNINGS"
    echo ""
    echo "Puedes continuar, pero revisa las advertencias arriba."
else
    echo -e "${RED}✗ Se encontraron problemas${NC}"
    echo "Errores: $ERRORS"
    echo "Advertencias: $WARNINGS"
    echo ""
    echo "Por favor corrige los errores antes de continuar."
    exit 1
fi

echo ""
echo "Próximos pasos:"
echo "  1. Si no tienes .env, crea uno: cp .env.example .env"
echo "  2. Edita .env con tus valores reales"
echo "  3. Para desarrollo local: ./scripts/local-dev.sh"
echo "  4. Para configurar GCP: ./scripts/setup-gcp.sh"
echo "  5. Para desplegar: git push origin main (si tienes CI/CD configurado)"
echo ""
