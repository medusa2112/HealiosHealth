resource "azurerm_storage_account" "sa" {
  name=local.sa_name resource_group_name=azurerm_resource_group.rg.name location=azurerm_resource_group.rg.location
  account_tier="Standard" account_replication_type="LRS" min_tls_version="TLS1_2"
  allow_nested_items_to_be_public=false allow_blob_public_access=false tags=var.tags
}
resource "azurerm_storage_container" "assets" {
  name=local.storage_container_name storage_account_name=azurerm_storage_account.sa.name container_access_type="private"
}
