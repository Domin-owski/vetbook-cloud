variable "subscription_id" {
  description = "Identyfikator subskrypcji Azure. Nie jest przechowywany w repozytorium."
  type        = string
  sensitive   = true
}

variable "resource_group_name" {
  description = "Nazwa grupy zasobów projektu."
  type        = string
  default     = "rg-vetbook-cloud"
}

variable "resource_group_location" {
  description = "Region przechowywania metadanych grupy zasobów."
  type        = string
  default     = "polandcentral"
}

variable "network_location" {
  description = "Region zasobów sieciowych projektu."
  type        = string
  default     = "norwayeast"
}
