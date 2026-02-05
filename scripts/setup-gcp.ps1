# ===================================================
# GCP Setup Script for BeZhas Web3
# ===================================================
# Run this script once to set up GCP resources
# ===================================================

# Configuration
$PROJECT_ID = "your-gcp-project-id"
$REGION = "us-central1"
$REPO_OWNER = "your-github-org"
$REPO_NAME = "bezhas-web3"

Write-Host "🚀 Setting up GCP resources for BeZhas..." -ForegroundColor Cyan

# Enable required APIs
Write-Host "`n📦 Enabling GCP APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com"
)

foreach ($api in $apis) {
    gcloud services enable $api --project=$PROJECT_ID
    Write-Host "  ✅ Enabled $api" -ForegroundColor Green
}

# Create Artifact Registry repository
Write-Host "`n🐳 Creating Artifact Registry..." -ForegroundColor Yellow
gcloud artifacts repositories create bezhas `
    --repository-format=docker `
    --location=$REGION `
    --project=$PROJECT_ID `
    --description="BeZhas Docker images"
Write-Host "  ✅ Created Artifact Registry" -ForegroundColor Green

# Create service account for Cloud Run
Write-Host "`n👤 Creating service accounts..." -ForegroundColor Yellow

# Backend service account
gcloud iam service-accounts create bezhas-backend-sa `
    --display-name="BeZhas Backend Service Account" `
    --project=$PROJECT_ID

# Frontend service account
gcloud iam service-accounts create bezhas-frontend-sa `
    --display-name="BeZhas Frontend Service Account" `
    --project=$PROJECT_ID

# CI/CD service account
gcloud iam service-accounts create bezhas-cicd-sa `
    --display-name="BeZhas CI/CD Service Account" `
    --project=$PROJECT_ID

Write-Host "  ✅ Created service accounts" -ForegroundColor Green

# Grant roles to CI/CD service account
Write-Host "`n🔐 Granting IAM roles..." -ForegroundColor Yellow

$roles = @(
    "roles/run.admin",
    "roles/storage.admin",
    "roles/artifactregistry.writer",
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser"
)

foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:bezhas-cicd-sa@$PROJECT_ID.iam.gserviceaccount.com" `
        --role="$role"
    Write-Host "  ✅ Granted $role" -ForegroundColor Green
}

# Create Workload Identity Pool for GitHub Actions
Write-Host "`n🔗 Setting up Workload Identity Federation..." -ForegroundColor Yellow

gcloud iam workload-identity-pools create "github-pool" `
    --location="global" `
    --display-name="GitHub Actions Pool" `
    --project=$PROJECT_ID

gcloud iam workload-identity-pools providers create-oidc "github-provider" `
    --location="global" `
    --workload-identity-pool="github-pool" `
    --display-name="GitHub Provider" `
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" `
    --issuer-uri="https://token.actions.githubusercontent.com" `
    --project=$PROJECT_ID

# Allow GitHub Actions to impersonate service account
gcloud iam service-accounts add-iam-policy-binding "bezhas-cicd-sa@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/iam.workloadIdentityUser" `
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool/attribute.repository/$REPO_OWNER/$REPO_NAME" `
    --project=$PROJECT_ID

Write-Host "  ✅ Workload Identity configured" -ForegroundColor Green

# Create secrets in Secret Manager
Write-Host "`n🔑 Creating secrets in Secret Manager..." -ForegroundColor Yellow

$secrets = @(
    "mongodb-uri",
    "redis-url",
    "jwt-secret",
    "stripe-secret-key",
    "stripe-webhook-secret",
    "polygon-rpc-url",
    "openai-api-key",
    "google-ai-api-key"
)

foreach ($secret in $secrets) {
    # Create empty secret (you'll need to add values manually)
    echo "placeholder" | gcloud secrets create $secret `
        --data-file=- `
        --replication-policy="automatic" `
        --project=$PROJECT_ID 2>$null
    Write-Host "  ✅ Created secret: $secret" -ForegroundColor Green
}

# Grant backend service account access to secrets
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:bezhas-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor"

Write-Host "`n✅ GCP Setup Complete!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update secret values in Secret Manager Console" -ForegroundColor White
Write-Host "2. Add the following GitHub repository secrets:" -ForegroundColor White
Write-Host "   - GCP_PROJECT_ID: $PROJECT_ID" -ForegroundColor Gray
Write-Host "   - GCP_WORKLOAD_IDENTITY_PROVIDER: projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool/providers/github-provider" -ForegroundColor Gray
Write-Host "   - GCP_SERVICE_ACCOUNT: bezhas-cicd-sa@$PROJECT_ID.iam.gserviceaccount.com" -ForegroundColor Gray
Write-Host "3. Push to main branch to trigger deployment" -ForegroundColor White
