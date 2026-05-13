# Replace with the exact name of the key pair you created in AWS
key_pair_name = "apexpos-key"

# Optional: Restrict access to your own IP address for security. 
# "0.0.0.0/0" means anyone can access the SSH and Kubernetes API ports.
# If your IP is 203.0.113.5, you would use "203.0.113.5/32"
admin_ip      = "0.0.0.0/0"
