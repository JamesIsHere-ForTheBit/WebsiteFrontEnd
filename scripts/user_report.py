#!/usr/bin/env python3
"""
Adams Team 6 — Script 1: User Account Management
Connects to Active Directory via LDAP and generates a report of all users,
their OUs, group memberships, and account status.
Run on Kali: python3 user_report.py
"""

import sys
import datetime

try:
    from ldap3 import Server, Connection, ALL, SUBTREE
except ImportError:
    print("[!] ldap3 not installed. Run: pip3 install ldap3")
    sys.exit(1)

from config import AD_SERVER_IP, AD_BASE_DN, AD_BIND_USER, AD_BIND_PASS, AD_DOMAIN

REPORT_FILE = f"/home/kali/user_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

def connect_ad():
    print(f"[*] Connecting to Active Directory at {AD_SERVER_IP}...")
    try:
        server = Server(AD_SERVER_IP, get_info=ALL)
        conn = Connection(server, user=AD_BIND_USER, password=AD_BIND_PASS, auto_bind=True)
        print(f"[+] Connected successfully as {AD_BIND_USER}")
        return conn
    except Exception as e:
        print(f"[!] Failed to connect to AD: {e}")
        sys.exit(1)

def get_users(conn):
    print("[*] Querying all user accounts...")
    conn.search(
        search_base=AD_BASE_DN,
        search_filter='(objectClass=user)',
        search_scope=SUBTREE,
        attributes=[
            'sAMAccountName', 'displayName', 'mail',
            'distinguishedName', 'memberOf',
            'userAccountControl', 'whenCreated', 'lastLogon'
        ]
    )
    return conn.entries

def is_enabled(uac):
    try:
        return not (int(uac) & 2)
    except:
        return True

def get_ou(dn):
    parts = str(dn).split(',')
    for part in parts:
        if part.strip().startswith('OU='):
            return part.strip()[3:]
    return 'Default'

def get_groups(member_of):
    if not member_of:
        return 'None'
    groups = []
    for dn in member_of:
        parts = str(dn).split(',')
        if parts:
            groups.append(parts[0].replace('CN=', ''))
    return ', '.join(groups)

def generate_report(users):
    lines = []
    lines.append("=" * 70)
    lines.append("ADAMS TEAM 6 — ACTIVE DIRECTORY USER REPORT")
    lines.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"Domain: {AD_DOMAIN}")
    lines.append("=" * 70)
    lines.append("")

    enabled_count  = 0
    disabled_count = 0

    for user in users:
        sam  = str(user.sAMAccountName) if user.sAMAccountName else 'N/A'
        name = str(user.displayName)    if user.displayName    else sam
        dn   = str(user.distinguishedName)
        uac  = user.userAccountControl
        ou   = get_ou(dn)
        grps = get_groups(user.memberOf)
        enabled = is_enabled(uac)

        if enabled:
            enabled_count += 1
        else:
            disabled_count += 1

        status = "ENABLED" if enabled else "DISABLED"
        lines.append(f"User:        {name} ({sam})")
        lines.append(f"Status:      {status}")
        lines.append(f"OU:          {ou}")
        lines.append(f"Groups:      {grps}")
        lines.append(f"Created:     {user.whenCreated}")
        lines.append("-" * 40)

    lines.append("")
    lines.append("SUMMARY")
    lines.append(f"Total users:    {len(users)}")
    lines.append(f"Enabled:        {enabled_count}")
    lines.append(f"Disabled:       {disabled_count}")
    lines.append("=" * 70)

    return "\n".join(lines)

def main():
    print("\n--- Adams Team 6: User Account Report ---\n")
    conn   = connect_ad()
    users  = get_users(conn)
    print(f"[+] Found {len(users)} user accounts")
    report = generate_report(users)
    print("\n" + report)

    with open(REPORT_FILE, 'w') as f:
        f.write(report)
    print(f"\n[+] Report saved to {REPORT_FILE}")
    conn.unbind()

if __name__ == '__main__':
    main()
