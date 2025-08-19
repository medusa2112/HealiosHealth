resource "azurerm_service_plan" "plan" {
  name=local.plan_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name os_type="Linux"
  sku_name=var.app_service_plan_sku_name tags=var.tags
}
resource "azurerm_linux_web_app" "app" {
  name=local.app_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name service_plan_id=azurerm_service_plan.plan.id
  https_only=true
  identity { type="SystemAssigned" }
  site_config {
    always_on=true ftps_state="Disabled" health_check_path="/health"
    application_stack { node_version="20-lts" }
    cors { allowed_origins=var.allowed_origins }
  }
  app_settings = {
    NODE_ENV=var.environment WEBSITES_PORT="5000" PORT="5000" WEBSITE_RUN_FROM_PACKAGE="0"
    SESSION_SECRET="@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.session_secret.id})"
    SESSION_SECRET_CUSTOMER="@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.session_secret_customer.id})"
    SESSION_SECRET_ADMIN="@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.session_secret_admin.id})"
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.database_url.id})"
    REDIS_URL="@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.redis_url.id})"
    ADMIN_2FA_ENABLED=tostring(var.admin_2fa_enabled)
    APPLICATIONINSIGHTS_CONNECTION_STRING=azurerm_application_insights.appi.connection_string
  }
  tags=var.tags
  lifecycle { ignore_changes=[ app_settings["WEBSITE_RUN_FROM_PACKAGE"] ] }
}
resource "azurerm_role_assignment" "kv_secrets_user" {
  scope=azurerm_key_vault.kv.id role_definition_name="Key Vault Secrets User" principal_id=azurerm_linux_web_app.app.identity[0].principal_id
}
