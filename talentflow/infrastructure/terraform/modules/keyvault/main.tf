variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "prefix"              { type = string }
variable "aks_principal_id"   { type = string }
variable "tags"                { type = map(string) }

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                        = "${replace(var.prefix, "-", "")}kv"
  location                    = var.location
  resource_group_name         = var.resource_group_name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  enable_rbac_authorization   = true
  tags                        = var.tags
}

# Allow AKS kubelet to read secrets (for External Secrets Operator)
resource "azurerm_role_assignment" "aks_kv_reader" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = var.aks_principal_id
}

# Allow Terraform runner to manage secrets
resource "azurerm_role_assignment" "terraform_kv_admin" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

output "key_vault_name" {
  value = azurerm_key_vault.kv.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.kv.vault_uri
}
