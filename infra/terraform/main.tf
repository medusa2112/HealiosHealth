data "azurerm_client_config" "current" {}
resource "random_string" "suffix" { length=6 upper=false special=false }
locals {
  suffix          = var.app_name_suffix != "" ? var.app_name_suffix : random_string.suffix.result
  name_prefix     = "${var.project}-${var.environment}-${local.suffix}"
  app_name        = "${var.project}-app-${local.suffix}"
  rg_name         = "${var.project}-rg-${var.environment}-${local.suffix}"
  kv_name         = replace("${var.project}-kv-${var.environment}-${local.suffix}", "-", "")
  sa_name         = replace("${var.project}sa${var.environment}${local.suffix}", "-", "")
  workspace_name  = "${var.project}-log-${var.environment}-${local.suffix}"
  ai_name         = "${var.project}-appi-${var.environment}-${local.suffix}"
  plan_name       = "${var.project}-plan-${var.environment}-${local.suffix}"
  redis_name      = "${var.project}-redis-${var.environment}-${local.suffix}"
  fd_profile_name = "${var.project}-fdp-${var.environment}-${local.suffix}"
  fd_endpoint     = "${var.project}-fde-${var.environment}-${local.suffix}"
  storage_container_name = "assets"
}
resource "azurerm_resource_group" "rg" { name=local.rg_name location=var.location tags=var.tags }
