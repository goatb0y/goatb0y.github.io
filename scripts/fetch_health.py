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
    if response.status_code != 200:
        print(f"Auth Error Body: {response.text}")
        response.raise_for_status()
    return response.json()["access_token"]

def fetch_data(access_token):
    # Get timestamps using modern timezone-aware objects
    now = datetime.datetime.now(datetime.UTC)
    start_of_today = datetime.datetime(now.year, now.month, now.day, tzinfo=datetime.UTC)
    start_7d = start_of_today - datetime.timedelta(days=7)
    start_24h = now - datetime.timedelta(hours=24)
    
    # Timestamps in milliseconds
    ts_now = int(now.timestamp() * 1000)
    ts_7d = int(start_7d.timestamp() * 1000)
    ts_24h = int(start_24h.timestamp() * 1000)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # 1. Fetch Daily Calories (Energy Output) for the last 7 days
    cal_payload = {
        "aggregateBy": [{"dataTypeName": "com.google.calories.expended"}],
        "bucketByTime": { "durationMillis": 86400000 }, # 1 day buckets
        "startTimeMillis": ts_7d,
        "endTimeMillis": ts_now
    }
    cal_res = requests.post(FIT_API_URL, headers=headers, json=cal_payload)
    cal_data = cal_res.json()
    
    history_cal = []
    if "bucket" in cal_data:
        for bucket in cal_data["bucket"]:
            val = 0
            if bucket["dataset"][0]["point"]:
                val = int(bucket["dataset"][0]["point"][0]["value"][0]["fpVal"])
            history_cal.append(val)
    
    latest_cal = history_cal[-1] if history_cal else 0

    # 2. Fetch Heart Rate for the last 24 hours (Hourly buckets)
    hr_payload = {
        "aggregateBy": [{"dataTypeName": "com.google.heart_rate.bpm"}],
        "bucketByTime": { "durationMillis": 3600000 }, # 1 hour buckets
        "startTimeMillis": ts_24h,
        "endTimeMillis": ts_now
    }
    hr_res = requests.post(FIT_API_URL, headers=headers, json=hr_payload)
    hr_data = hr_res.json()
    
    hr_history = []
    current_hr = 0
    if "bucket" in hr_data:
        for bucket in hr_data["bucket"]:
            avg_hr = 0
            if bucket["dataset"][0]["point"]:
                avg_hr = int(bucket["dataset"][0]["point"][0]["value"][0]["fpVal"])
            hr_history.append(avg_hr)
    
    # Try alternate: Fetch most recent single point for "live" feel
    if current_hr == 0:
        raw_hr_url = "https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/"
        dataset_id = f"{ts_24h}000000-{ts_now}000000" # nanos
        raw_hr_res = requests.get(raw_hr_url + dataset_id, headers=headers)
        raw_hr_data = raw_hr_res.json()
        if "point" in raw_hr_data and raw_hr_data["point"]:
            current_hr = int(raw_hr_data["point"][-1]["value"][0]["fpVal"])

    # 3. Fetch Sleep for last night
    sleep_payload = {
        "aggregateBy": [{"dataTypeName": "com.google.sleep.segment"}],
        "startTimeMillis": ts_24h,
        "endTimeMillis": ts_now
    }
    sleep_res = requests.post(FIT_API_URL, headers=headers, json=sleep_payload)
    sleep_json = sleep_res.json()
    
    total_sleep_minutes = 0
    if "bucket" in sleep_json:
        for bucket in sleep_json["bucket"]:
            for point in bucket["dataset"][0]["point"]:
                start_ns = int(point["startTimeNanos"])
                end_ns = int(point["endTimeNanos"])
                total_sleep_minutes += (end_ns - start_ns) / (1e9 * 60)

    # 4. Fetch HRV (System Recovery)
    hrv_payload = {
        "aggregateBy": [{"dataTypeName": "com.google.heart_rate.variability"}],
        "startTimeMillis": ts_7d,
        "endTimeMillis": ts_now
    }
    hrv_res = requests.post(FIT_API_URL, headers=headers, json=hrv_payload)
    hrv_json = hrv_res.json()
    
    latest_hrv = 0
    if "bucket" in hrv_json:
        for bucket in reversed(hrv_json["bucket"]):
            if bucket["dataset"][0]["point"]:
                latest_hrv = int(bucket["dataset"][0]["point"][0]["value"][0]["fpVal"])
                break

    return {
        "metrics": {
            "system_recovery": latest_hrv or 62,
            "neural_sync": round(total_sleep_minutes / 60, 1) or 7.2,
            "metabolic_output": latest_cal or 2100,
            "current_heart_rate": current_hr or 70
        },
        "trends": {
            "calories_7d": history_cal or [1800, 2200, 2100, 2400, 1900, 2300, 2100],
            "heart_rate_24h": hr_history or [70, 72, 68, 65, 62, 60, 64, 68, 75, 80, 85, 82, 78, 75, 72, 70, 74, 78, 82, 80, 76, 74, 72, 70]
        },
        "last_updated": now.isoformat()
    }

def main():
    try:
        token = get_access_token()
        data = fetch_data(token)
        
        os.makedirs("data", exist_ok=True)
        with open("data/biometrics.json", "w") as f:
            json.dump(data, f, indent=2)
        print(f"Successfully updated biometrics.json at {data['last_updated']}")
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
