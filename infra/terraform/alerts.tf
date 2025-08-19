resource "azurerm_monitor_metric_alert" "app_http5xx" {
  name = "${local.name_prefix}-http5xx-alert"
  resource_group_name = azurerm_resource_group.rg.name
  scopes = [azurerm_linux_web_app.app.id]
  description = "5xx responses exceed threshold"
  severity = 2 frequency = "PT5M" window_size = "PT5M" auto_mitigate = true
  criteria { metric_namespace = "Microsoft.Web/sites" metric_name = "Http5xx" aggregation = "Total" operator = "GreaterThan" threshold = 20 }
  tags = var.tags
}
resource "azurerm_monitor_metric_alert" "app_latency" {
  name = "${local.name_prefix}-latency-alert"
  resource_group_name = azurerm_resource_group.rg.name
  scopes = [azurerm_linux_web_app.app.id]
  description = "Average response time high"
  severity = 3 frequency = "PT5M" window_size = "PT5M" auto_mitigate = true
  criteria { metric_namespace = "Microsoft.Web/sites" metric_name = "AverageResponseTime" aggregation = "Average" operator = "GreaterThan" threshold = 1500 }
  tags = var.tags
}
