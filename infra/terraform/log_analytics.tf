resource "azurerm_log_analytics_workspace" "law" {
  name=local.workspace_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name
  sku="PerGB2018" retention_in_days=30 tags=var.tags
}
resource "azurerm_application_insights" "appi" {
  name=local.ai_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name
  application_type="web" workspace_id=azurerm_log_analytics_workspace.law.id tags=var.tags
}
