import requests
import time

# URL of your Express server hosted on Render
server_url = 'https://peakformexpressserver.onrender.com/'

def ping_server():
    try:
        response = requests.get(server_url)
        if response.status_code == 200:
            print(f"Server is up! Status code: {response.status_code}")
        else:
            print(f"Server responded with status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error pinging the server: {e}")

if __name__ == '__main__':
    while True:
        ping_server()  # Ping the server
        time.sleep(9 * 60)  # Wait for 9 minutes (9 * 60 seconds)
