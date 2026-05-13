#!/bin/bash
cd ansible
ANSIBLE_FORCE_COLOR=true ansible-playbook -i inventory/hosts.yml playbooks/setup-all.yml
