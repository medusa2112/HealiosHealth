variable "project" { description="Project short name."; type=string; default="healios" }
variable "environment" { description="Environment"; type=string; default="prod" }
variable "location" { description="Region"; type=string; default="westeurope" }
variable "tags" { type=map(string) default={ owner="healios" purpose="wellness-ecommerce" } }
variable "app_service_plan_sku_name" { type=string default="P1v3" }
variable "redis_sku_name" { type=string default="Standard" }
variable "redis_capacity" { type=number default=1 }
variable "frontdoor_enabled" { type=bool default=true }
variable "allowed_origins" { type=list(string) default=[] }
variable "admin_2fa_enabled" { type=bool default=true }
variable "database_url" { type=string sensitive=true }
variable "session_secret" { type=string sensitive=true }
variable "session_secret_customer" { type=string sensitive=true }
variable "session_secret_admin" { type=string sensitive=true }
variable "app_name_suffix" { type=string default="" }
