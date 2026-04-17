variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "prefix"              { type = string }
variable "tags"                { type = map(string) }

resource "azurerm_container_registry" "acr" {
  name                = "${replace(var.prefix, "-", "")}acr"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Standard"
  admin_enabled       = false
  tags                = var.tags
}

output "id"           { value = azurerm_container_registry.acr.id }
output "login_server" { value = azurerm_container_registry.acr.login_server }
output "name"         { value = azurerm_container_registry.acr.name }
