import urllib.request
import json
import urllib.error

data = json.dumps({'title': 'Test', 'description': 'Testing ticket', 'priority': 'Medium'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/tickets', method='POST', data=data, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer direct-login-token-123'})

try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.code)
    print("Body:", e.read().decode())
except Exception as e:
    print("Exception:", e)
