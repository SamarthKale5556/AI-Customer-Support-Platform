import urllib.request
import json
import urllib.error

data = json.dumps({'name': 'User', 'email': 'newtest5@gmail.com', 'password': 'pass', 'role': 'Customer'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/register', method='POST', data=data, headers={'Content-Type': 'application/json'})

try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.code)
    print("Body:", e.read().decode())
except Exception as e:
    print("Exception:", e)
