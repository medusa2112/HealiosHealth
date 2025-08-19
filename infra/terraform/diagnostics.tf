resource "azurerm_monitor_diagnostic_setting" "app_diag" {
  name="app-to-law" target_resource_id=azurerm_linux_web_app.app.id log_analytics_workspace_id=azurerm_log_analytics_workspace.law.id
  enabled_log { category="AppServiceHTTPLogs" }
  enabled_log { category="AppServiceConsoleLogs" }
  enabled_log { category="AppServiceAppLogs" }
  metric { category="AllMetrics" enabled=true }
}
