locals {
  prefix = "talentflow-${var.environment}"
  tags   = merge(var.tags, { environment = var.environment })
}

# ─── Resource Group ──────────────────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

# ─── Networking ───────────────────────────────────────────────────────────────
module "networking" {
  source              = "./modules/networking"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  prefix              = local.prefix
  tags                = local.tags
}

# ─── Azure Container Registry ─────────────────────────────────────────────────
module "acr" {
  source              = "./modules/acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  prefix              = local.prefix
  tags                = local.tags
}

# ─── AKS Cluster ─────────────────────────────────────────────────────────────
module "aks" {
  source              = "./modules/aks"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  prefix              = local.prefix
  node_count          = var.aks_node_count
  vm_size             = var.aks_node_vm_size
  vnet_subnet_id      = module.networking.aks_subnet_id
  acr_id              = module.acr.id
  tags                = local.tags
}

# ─── PostgreSQL Flexible Server ───────────────────────────────────────────────
module "postgresql" {
  source              = "./modules/postgresql"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  prefix              = local.prefix
  sku_name            = var.postgres_sku
  subnet_id           = module.networking.db_subnet_id
  tags                = local.tags
}

# ─── Azure Key Vault ─────────────────────────────────────────────────────────
module "keyvault" {
  source              = "./modules/keyvault"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  prefix              = local.prefix
  aks_principal_id    = module.aks.kubelet_identity_object_id
  tags                = local.tags
}
