import os
import requests

url = "http://localhost:5000/classify"

files = { "file": open(os.path.abspath("smiley.png"), "rb")}

try:
    response = requests.post(url, files=files)
    print(response.json())

except requests.exceptions.HTTPError as err:
    print(err.response.text)