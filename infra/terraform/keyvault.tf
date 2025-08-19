resource "azurerm_key_vault" "kv" {
  name=local.kv_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name
  tenant_id=data.azurerm_client_config.current.tenant_id sku_name="standard"
  purge_protection_enabled=true soft_delete_retention_days=14 rbac_authorization_enabled=true public_network_access_enabled=true tags=var.tags
}
resource "azurerm_key_vault_secret" "session_secret" { name="session-secret" value=var.session_secret key_vault_id=azurerm_key_vault.kv.id }
resource "azurerm_key_vault_secret" "session_secret_customer" { name="session-secret-customer" value=var.session_secret_customer key_vault_id=azurerm_key_vault.kv.id }
resource "azurerm_key_vault_secret" "session_secret_admin" { name="session-secret-admin" value=var.session_secret_admin key_vault_id=azurerm_key_vault.kv.id }
resource "azurerm_key_vault_secret" "database_url" { name="database-url" value=var.database_url key_vault_id=azurerm_key_vault.kv.id }
