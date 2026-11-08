output "resource_group_name" {
  description = "Nazwa grupy zasobów."
  value       = azurerm_resource_group.main.name
}

output "virtual_network_name" {
  description = "Nazwa sieci wirtualnej."
  value       = azurerm_virtual_network.main.name
}

output "subnet_names" {
  description = "Nazwy podsieci architektury trójwarstwowej."
  value = [
    azurerm_subnet.web.name,
    azurerm_subnet.app.name,
    azurerm_subnet.db.name
  ]
}

output "network_security_group_names" {
  description = "Nazwy sieciowych grup zabezpieczeń."
  value = [
    azurerm_network_security_group.web.name,
    azurerm_network_security_group.app.name,
    azurerm_network_security_group.db.name
  ]
}

output "route_table_name" {
  description = "Nazwa tabeli tras prywatnych podsieci."
  value       = azurerm_route_table.private.name
}
