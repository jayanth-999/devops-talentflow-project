variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US 2"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "talentflow-rg"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aks_node_count" {
  description = "AKS default node count"
  type        = number
  default     = 2
}

variable "aks_node_vm_size" {
  description = "AKS node VM size"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "postgres_sku" {
  description = "PostgreSQL SKU"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default = {
    project     = "talentflow"
    managed_by  = "terraform"
  }
}
