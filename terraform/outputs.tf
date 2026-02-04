output "cloud_run_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.app.status[0].url
}

output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.cloudrun_sa.email
}

output "bucket_name" {
  description = "Name of the storage bucket"
  value       = google_storage_bucket.app_bucket.name
}

output "secret_ids" {
  description = "IDs of created secrets"
  value = {
    mongodb_uri = google_secret_manager_secret.mongodb_uri.secret_id
    private_key = google_secret_manager_secret.private_key.secret_id
    jwt_secret  = google_secret_manager_secret.jwt_secret.secret_id
  }
}
