variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "prefix"              { type = string }
variable "sku_name"            { type = string }
variable "subnet_id"           { type = string }
variable "tags"                { type = map(string) }

resource "random_password" "postgres_admin" {
  length  = 24
  special = true
}

resource "azurerm_postgresql_flexible_server" "postgres" {
  name                = "${var.prefix}-pg"
  resource_group_name = var.resource_group_name
  location            = var.location
  version             = "16"
  sku_name            = var.sku_name
  storage_mb          = 32768

  administrator_login    = "pgadmin"
  administrator_password = random_password.postgres_admin.result

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  zone                         = "1"

  tags = var.tags
}

# Databases for each service
resource "azurerm_postgresql_flexible_server_database" "userdb" {
  name      = "userdb"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_database" "jobdb" {
  name      = "jobdb"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

output "server_fqdn" {
  value = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "admin_password" {
  value     = random_password.postgres_admin.result
  sensitive = true
}
