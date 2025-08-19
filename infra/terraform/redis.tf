resource "azurerm_redis_cache" "redis" {
  name=local.redis_name location=azurerm_resource_group.rg.location resource_group_name=azurerm_resource_group.rg.name
  capacity=var.redis_capacity family="C" sku_name=var.redis_sku_name minimum_tls_version="1.2" non_ssl_port_enabled=false
  redis_configuration {} tags=var.tags
}
locals { redis_url = format("rediss://:%s@%s:6380", azurerm_redis_cache.redis.primary_access_key, azurerm_redis_cache.redis.hostname) }
resource "azurerm_key_vault_secret" "redis_url" { name="redis-url" value=local.redis_url key_vault_id=azurerm_key_vault.kv.id }
