output "resource_group_name" { value=azurerm_resource_group.rg.name }
output "app_service_default_hostname" { value=azurerm_linux_web_app.app.default_hostname }
output "key_vault_uri" { value=azurerm_key_vault.kv.vault_uri }
output "redis_hostname" { value=azurerm_redis_cache.redis.hostname }
output "frontdoor_endpoint_hostname" { value=try(azurerm_cdn_frontdoor_endpoint.fde[0].host_name, null) }
