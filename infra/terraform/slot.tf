resource "azurerm_linux_web_app_slot" "staging" {
  name = "staging"
  app_service_id = azurerm_linux_web_app.app.id
  site_config {
    always_on = true
    ftps_state = "Disabled"
    health_check_path = "/health"
    application_stack { node_version = "20-lts" }
  }
  app_settings = { NODE_ENV = var.environment WEBSITES_PORT = "5000" PORT = "5000" SLOT_NAME = "staging" }
  tags = var.tags
}
