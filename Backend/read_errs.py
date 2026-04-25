import os
with open('tsc_errors.txt', 'rb') as f:
    content = f.read()
    print(content[:5000].decode('utf-16le', errors='ignore'))
