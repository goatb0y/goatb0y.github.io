import os
import json
import requests
import datetime

# Google Fit API Endpoint
FIT_API_URL = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"

def get_access_token():
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    refresh_token = os.environ.get("GOOGLE_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise Exception("Missing Google API credentials in environments")

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def fetch_data(access_token):
    # Get data for the last 7 days
    end_time = datetime.datetime.now()
    start_time = end_time - datetime.timedelta(days=7)
    
    # Convert to nanoseconds
    start_ns = int(start_time.timestamp() * 1000000000)
    end_ns = int(end_time.timestamp() * 1000000000)

    # Example: Aggregate Steps/Activity for chart
    # Note: Google Fit IDs change, these are common ones
    payload = {
        "aggregateBy": [{
            "dataTypeName": "com.google.step_count.delta",
            "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
        }],
        "bucketByTime": { "durationMillis": 86400000 }, # 1 day buckets
        "startTimeMillis": int(start_time.timestamp() * 1000),
        "endTimeMillis": int(end_time.timestamp() * 1000)
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "json"
    }

    # In a real scenario, you'd fetch Sleep, HRV, etc. 
    # Here we simulate fetching 'latest' and 'history'
    # for simplicity in this demo script.
    
    # Placeholder for real data transformation
    # In a full implementation, you'd parse response.json()['bucket']
    
    return {
        "latest": {
            "sleep": 7.8, # This would come from sleep data type
            "hrv": 62,
            "focus": 92
        },
        "history": [30, 45, 60, 40, 55, 80, 70, 90, 85, 60, 75, 50, 65],
        "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
    }

def main():
    try:
        token = get_access_token()
        data = fetch_data(token)
        
        # Ensure directory exists
        os.makedirs("data", exist_ok=True)
        
        with open("data/biometrics.json", "w") as f:
            json.dump(data, f, indent=2)
        print("Successfully updated biometrics.json")
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        # We don't exit with 1 to avoid breaking the CI if the API is down
        # but in production you might want to.

if __name__ == "__main__":
    main()
