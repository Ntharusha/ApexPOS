output "server_public_ip" {
  description = "Public IP of the ApexPOS server"
  value       = aws_eip.server.public_ip
}

output "jenkins_url" {
  description = "Jenkins Web UI URL"
  value       = "http://${aws_eip.server.public_ip}:8080"
}

output "backend_api_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.server.public_ip}:5000"
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i ${var.key_pair_name}.pem ubuntu@${aws_eip.server.public_ip}"
}
