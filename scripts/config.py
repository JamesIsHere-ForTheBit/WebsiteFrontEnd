# Adams Team 6 — Automation Suite Configuration
# KEEP THIS FILE SECURE — chmod 600 config.py after deploying to Kali
# Do not share or commit this file

# Network
RHEL_DB_IP     = '192.168.20.10'
RHEL_CLIENT_IP = '192.168.40.20'
AD_SERVER_IP   = '192.168.40.10'
WEB_SERVER_IP  = '192.168.20.20'
KALI_IP        = '192.168.10.10'

# SSH
SSH_USER       = 'playerone'
SSH_KEY_PATH   = '/home/kali/.ssh/id_ed25519'

# Active Directory / LDAP
AD_DOMAIN      = 'adams6.local'
AD_BASE_DN     = 'DC=adams6,DC=local'
AD_BIND_USER   = 'CN=itadmin,CN=Users,DC=adams6,DC=local'
AD_BIND_PASS   = '9gDd7j9=Y&7Z'

# MySQL
MYSQL_ROOT_PASS   = 'Str0ng!Passw0rd123'
MYSQL_BACKUP_PASS = 'BackupUser2026!'
MYSQL_DB        = 'ambercrombie'

# Backup
BACKUP_DIR      = '/home/kali/backups'
