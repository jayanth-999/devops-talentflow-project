output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = module.aks.cluster_name
}

output "acr_login_server" {
  description = "ACR login server URL"
  value       = module.acr.login_server
}

output "postgres_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = module.postgresql.server_fqdn
}

output "key_vault_name" {
  description = "Key Vault name"
  value       = module.keyvault.key_vault_name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = module.keyvault.key_vault_uri
}
