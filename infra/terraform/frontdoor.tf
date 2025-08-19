resource "azurerm_cdn_frontdoor_profile" "fdp" {
  count=var.frontdoor_enabled ? 1 : 0
  name=local.fd_profile_name resource_group_name=azurerm_resource_group.rg.name sku_name="Standard_AzureFrontDoor" tags=var.tags
}
resource "azurerm_cdn_frontdoor_endpoint" "fde" {
  count=var.frontdoor_enabled ? 1 : 0
  name=local.fd_endpoint profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name tags=var.tags
}
resource "azurerm_cdn_frontdoor_origin_group" "fdog" {
  count=var.frontdoor_enabled ? 1 : 0
  name="origin-group" profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name
  health_probe { interval_in_seconds=30 path="/health" protocol="Https" request_type="GET" }
  load_balancing { sample_size=4 successful_samples_required=3 }
}
resource "azurerm_cdn_frontdoor_origin" "fdo" {
  count=var.frontdoor_enabled ? 1 : 0
  name="app-origin" profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name origin_group_name=azurerm_cdn_frontdoor_origin_group.fdog[0].name
  host_name=azurerm_linux_web_app.app.default_hostname origin_host_header=azurerm_linux_web_app.app.default_hostname http_port=80 https_port=443 priority=1 weight=1000 enabled=true
}
resource "azurerm_cdn_frontdoor_rule_set" "rs" {
  count=var.frontdoor_enabled ? 1 : 0
  name="security-headers" profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name
}
resource "azurerm_cdn_frontdoor_rule" "rs_headers" {
  count=var.frontdoor_enabled ? 1 : 0
  name="add-sec-headers" profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name rule_set_name=azurerm_cdn_frontdoor_rule_set.rs[0].name order=1
  actions {
    response_header_action { header_action="Overwrite" header_name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" }
    response_header_action { header_action="Overwrite" header_name="X-Content-Type-Options" value="nosniff" }
    response_header_action { header_action="Overwrite" header_name="X-Frame-Options" value="DENY" }
    response_header_action { header_action="Overwrite" header_name="Referrer-Policy" value="no-referrer" }
  }
  conditions {}
}
resource "azurerm_cdn_frontdoor_firewall_policy" "waf" {
  count=var.frontdoor_enabled ? 1 : 0
  name="${local.name_prefix}-waf" resource_group_name=azurerm_resource_group.rg.name sku_name="Standard_AzureFrontDoor" enabled=true mode="Prevention"
  managed_rule { type="DefaultRuleSet" version="1.0" }
  custom_block_response_status_code=403
}
resource "azurerm_cdn_frontdoor_route" "route" {
  count=var.frontdoor_enabled ? 1 : 0
  name="https-route" profile_name=azurerm_cdn_frontdoor_profile.fdp[0].name resource_group_name=azurerm_resource_group.rg.name endpoint_name=azurerm_cdn_frontdoor_endpoint.fde[0].name
  origin_group_name=azurerm_cdn_frontdoor_origin_group.fdog[0].name supported_protocols=["Https"] patterns_to_match=["/*"] forwarding_protocol="HttpsOnly" https_redirect_enabled=true
  link_to_default_domain=true rule_set_ids=[azurerm_cdn_frontdoor_rule_set.rs[0].id]
  web_application_firewall_policy_link_id=azurerm_cdn_frontdoor_firewall_policy.waf[0].id origin_path="" cache_enabled=false
}
