#!/usr/bin/env python3
"""
Adams Team 6 — Script 2: Service Configuration and Health Check
Connects to RHEL machines via SSH and verifies that all critical services
are running. Automatically restarts any stopped services and logs the results.
Run on Kali: python3 service_check.py
"""

import sys
import datetime

try:
    import paramiko
except ImportError:
    print("[!] paramiko not installed. Run: pip3 install paramiko")
    sys.exit(1)

from config import (
    RHEL_DB_IP, RHEL_CLIENT_IP,
    SSH_USER, SSH_KEY_PATH
)

LOG_FILE = f"/home/kali/service_check_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

MACHINES = {
    'RHEL Database (192.168.20.10)': {
        'ip': RHEL_DB_IP,
        'services': ['mysqld', 'sshd', 'firewalld']
    },
    'RHEL Client (192.168.40.20)': {
        'ip': RHEL_CLIENT_IP,
        'services': ['sshd', 'firewalld', 'sssd']
    }
}

def ssh_connect(ip):
    try:
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        client.load_host_keys('/home/kali/.ssh/known_hosts')
        client.set_missing_host_key_policy(paramiko.RejectPolicy())
        client.connect(ip, username=SSH_USER, key_filename=SSH_KEY_PATH, timeout=10)
        return client
    except paramiko.ssh_exception.NoValidConnectionsError:
        print(f"  [!] Cannot reach {ip} — host unreachable")
        return None
    except paramiko.ssh_exception.SSHException as e:
        print(f"  [!] SSH error for {ip}: {e}")
        return None
    except Exception as e:
        print(f"  [!] SSH connection failed to {ip}: {e}")
        return None

def run_command(client, cmd):
    try:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        return out, err
    except Exception as e:
        return '', str(e)

def check_service(client, service):
    out, _ = run_command(client, f"sudo systemctl is-active {service}")
    return out.strip() == 'active'

def restart_service(client, service):
    out, err = run_command(client, f"sudo systemctl restart {service}")
    return err == ''

def get_system_info(client):
    hostname, _ = run_command(client, "hostname")
    uptime,   _ = run_command(client, "uptime -p")
    disk,     _ = run_command(client, "df -h / | tail -1 | awk '{print $5}'")
    memory,   _ = run_command(client, "free -m | awk 'NR==2{printf \"%s/%s MB\", $3,$2}'")
    return hostname, uptime, disk, memory

def check_machine(name, config):
    ip = config['ip']
    services = config['services']
    results = []
    results.append(f"\n{'=' * 60}")
    results.append(f"Machine: {name}")
    results.append(f"IP:      {ip}")

    client = ssh_connect(ip)
    if not client:
        results.append("STATUS:  UNREACHABLE")
        results.append('=' * 60)
        return "\n".join(results), False

    hostname, uptime, disk, memory = get_system_info(client)
    results.append(f"Host:    {hostname}")
    results.append(f"Uptime:  {uptime}")
    results.append(f"Disk:    {disk} used")
    results.append(f"Memory:  {memory}")
    results.append("")
    results.append("Services:")

    all_ok = True
    for service in services:
        is_running = check_service(client, service)
        if is_running:
            results.append(f"  [OK]      {service}")
        else:
            all_ok = False
            results.append(f"  [STOPPED] {service} — attempting restart...")
            restarted = restart_service(client, service)
            if restarted:
                results.append(f"  [OK]      {service} restarted successfully")
            else:
                results.append(f"  [FAILED]  {service} could not be restarted")

    results.append('=' * 60)
    client.close()
    return "\n".join(results), all_ok

def main():
    print("\n--- Adams Team 6: Service Health Check ---\n")
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_lines = [f"Adams Team 6 — Service Check Report", f"Run at: {timestamp}", ""]

    all_healthy = True
    for name, config in MACHINES.items():
        print(f"[*] Checking {name}...")
        result, ok = check_machine(name, config)
        print(result)
        log_lines.append(result)
        if not ok:
            all_healthy = False

    summary = "\nOVERALL STATUS: " + ("ALL SERVICES HEALTHY" if all_healthy else "SOME SERVICES NEED ATTENTION")
    print(summary)
    log_lines.append(summary)

    with open(LOG_FILE, 'w') as f:
        f.write("\n".join(log_lines))
    print(f"\n[+] Log saved to {LOG_FILE}")

if __name__ == '__main__':
    main()
