#!/usr/bin/env python3
import socket
import sys

# Test if port 8002 is free
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex(('127.0.0.1', 8002))
sock.close()

if result == 0:
    print("Port 8002 is in use")
    sys.exit(1)
else:
    print("Port 8002 is free")
    sys.exit(0)
