#!/bin/bash
# Setup script for GCP project configuration

set -e

echo "===================================================="
echo "BeZhas Web3 - GCP Setup Script"
echo "===================================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
read -p "Enter your GCP Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo "Error: Project ID cannot be empty"
    exit 1
fi

# Get region
read -p "Enter GCP region (default: us-central1): " REGION
REGION=${REGION:-us-central1}

echo ""
echo "Configuring GCP project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    compute.googleapis.com

# Create service account
echo ""
echo "Creating service account..."
SA_NAME="bezhas-web3-sa"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
    echo "Service account already exists: $SA_EMAIL"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="BeZhas Web3 Service Account" \
        --description="Service account for BeZhas Web3 application"
fi

# Grant necessary roles
echo ""
echo "Granting IAM roles..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.objectViewer"

# Create secrets
echo ""
echo "Creating Secret Manager secrets..."

# MongoDB URI
if gcloud secrets describe MONGODB_URI &> /dev/null; then
    echo "Secret MONGODB_URI already exists"
else
    echo "Creating MONGODB_URI secret..."
    read -sp "Enter MongoDB URI: " MONGODB_URI
    echo ""
    echo -n "$MONGODB_URI" | gcloud secrets create MONGODB_URI \
        --data-file=- \
        --replication-policy="automatic"
fi

# Private Key
if gcloud secrets describe PRIVATE_KEY &> /dev/null; then
    echo "Secret PRIVATE_KEY already exists"
else
    echo "Creating PRIVATE_KEY secret..."
    read -sp "Enter Private Key: " PRIVATE_KEY
    echo ""
    echo -n "$PRIVATE_KEY" | gcloud secrets create PRIVATE_KEY \
        --data-file=- \
        --replication-policy="automatic"
fi

# JWT Secret
if gcloud secrets describe JWT_SECRET &> /dev/null; then
    echo "Secret JWT_SECRET already exists"
else
    echo "Creating JWT_SECRET secret..."
    read -sp "Enter JWT Secret: " JWT_SECRET
    echo ""
    echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET \
        --data-file=- \
        --replication-policy="automatic"
fi

# Create service account key for GitHub Actions
echo ""
echo "Creating service account key for CI/CD..."
KEY_FILE="gcp-sa-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL

echo ""
echo "===================================================="
echo "Setup completed successfully!"
echo "===================================================="
echo ""
echo "Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo "   - GCP_SA_KEY: (content of $KEY_FILE)"
echo ""
echo "2. Store the service account key securely and delete the file:"
echo "   cat $KEY_FILE"
echo "   rm $KEY_FILE"
echo ""
echo "3. Update terraform/terraform.tfvars with your project ID"
echo "4. Run 'terraform init' and 'terraform apply' in the terraform directory"
echo "5. Push your code to trigger the GitHub Actions workflow"
echo ""
