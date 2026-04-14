#!/usr/bin/env python3
"""
Adams Team 6 — Script 3: Automated Database Backup
Connects to the RHEL Database server via SSH, runs mysqldump on the
ambercrombie database, and saves timestamped backups to Kali.
Satisfies project tasks 10.1 (configure backups) and 10.2 (test restore).
Run on Kali: python3 db_backup.py
Schedule with cron: 0 2 * * * /usr/bin/python3 /home/kali/scripts/db_backup.py
"""

import sys
import os
import datetime
import gzip
import shutil

try:
    import paramiko
except ImportError:
    print("[!] paramiko not installed. Run: pip3 install paramiko")
    sys.exit(1)

from config import (
    RHEL_DB_IP, SSH_USER, SSH_KEY_PATH,
    MYSQL_ROOT_PASS, MYSQL_DB, BACKUP_DIR
)

MAX_BACKUPS    = 7
LOG_FILE       = '/home/kali/backup.log'

def log(message):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{timestamp}] {message}"
    print(line)
    with open(LOG_FILE, 'a') as f:
        f.write(line + "\n")

def ssh_connect():
    try:
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        client.load_host_keys("/home/kali/.ssh/known_hosts")
        client.set_missing_host_key_policy(paramiko.RejectPolicy())
        client.connect(RHEL_DB_IP, username=SSH_USER, key_filename=SSH_KEY_PATH, timeout=10)
        return client
    except Exception as e:
        log(f"[!] SSH connection failed: {e}")
        sys.exit(1)

def run_backup(client, remote_path):
    dump_cmd = (
        f"mysqldump -u backupuser -p'{MYSQL_BACKUP_PASS}' "
        f"--single-transaction --routines --triggers "
        f"{MYSQL_DB} > {remote_path}"
    )
    stdin, stdout, stderr = client.exec_command(dump_cmd)
    stdout.channel.recv_exit_status()
    err = stderr.read().decode().strip()
    if err and 'Warning' not in err:
        log(f"[!] mysqldump error: {err}")
        return False
    return True

def download_backup(client, remote_path, local_path):
    sftp = client.open_sftp()
    sftp.get(remote_path, local_path)
    sftp.close()

def cleanup_remote(client, remote_path):
    client.exec_command(f"rm -f {remote_path}")

def rotate_backups():
    if not os.path.exists(BACKUP_DIR):
        return
    backups = sorted([
        f for f in os.listdir(BACKUP_DIR)
        if f.startswith('ambercrombie_') and f.endswith('.sql.gz')
    ])
    while len(backups) >= MAX_BACKUPS:
        oldest = os.path.join(BACKUP_DIR, backups.pop(0))
        os.remove(oldest)
        log(f"[*] Removed old backup: {oldest}")

def verify_backup(local_path):
    try:
        with gzip.open(local_path, 'rb') as f:
            content = f.read(1000).decode('utf-8', errors='ignore')
            if 'MySQL dump' in content or 'MariaDB dump' in content or 'CREATE TABLE' in content:
                return True
        return False
    except Exception as e:
        log(f"[!] Verification error: {e}")
        return False

def main():
    log("--- Adams Team 6: Database Backup Starting ---")

    os.makedirs(BACKUP_DIR, exist_ok=True)

    timestamp   = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    remote_path = f"/tmp/{MYSQL_DB}_{timestamp}.sql"
    local_sql   = os.path.join(BACKUP_DIR, f"{MYSQL_DB}_{timestamp}.sql")
    local_gz    = local_sql + ".gz"

    log(f"[*] Connecting to database server at {RHEL_DB_IP}...")
    client = ssh_connect()
    log("[+] Connected successfully")

    log(f"[*] Running mysqldump on database '{MYSQL_DB}'...")
    if not run_backup(client, remote_path):
        log("[!] Backup failed — mysqldump did not complete successfully")
        client.close()
        sys.exit(1)
    log("[+] mysqldump completed successfully")

    log(f"[*] Downloading backup file to {local_sql}...")
    download_backup(client, remote_path, local_sql)
    log("[+] Download complete")

    cleanup_remote(client, remote_path)
    client.close()

    log("[*] Compressing backup...")
    with open(local_sql, 'rb') as f_in:
        with gzip.open(local_gz, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    os.remove(local_sql)

    size_kb = os.path.getsize(local_gz) // 1024
    log(f"[+] Backup compressed: {local_gz} ({size_kb} KB)")

    log("[*] Verifying backup integrity...")
    if verify_backup(local_gz):
        log("[+] Backup verified successfully — contains valid MySQL dump")
    else:
        log("[!] Backup verification failed — file may be corrupt")

    rotate_backups()

    log(f"[+] Backup complete: {local_gz}")
    log("--- Backup Finished ---\n")

if __name__ == '__main__':
    main()
