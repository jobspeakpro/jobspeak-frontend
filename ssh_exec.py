#!/usr/bin/env python3
import sys
import paramiko

def ssh_exec(host, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password, timeout=10)
        stdin, stdout, stderr = client.exec_command(command)
        
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        exit_code = stdout.channel.recv_exit_status()
        
        print(output, end='')
        if error:
            print(error, end='', file=sys.stderr)
        
        return exit_code
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ssh_exec.py <command>")
        sys.exit(1)
    
    command = sys.argv[1]
    exit_code = ssh_exec("72.62.171.225", "root", "Word@Word+1234", command)
    sys.exit(exit_code)
