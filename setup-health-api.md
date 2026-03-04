# Setting Up the Google Fit Bridge

To connect your Samsung Health data to your website, follow these steps:

## 1. Phone Setup (Samsung Health $\rightarrow$ Google Fit)
Samsung Health doesn't have a public API for personal use. We use **Google Fit** as the bridge.
1. Install [Health Sync](https://play.google.com/store/apps/details?id=nl.appyhapps.healthsync) (paid/trial) or [Google Fit](https://play.google.com/store/apps/details?id=com.google.android.apps.fitness) on your phone.
2. In Health Sync, set **Samsung Health** as the source and **Google Fit** as the destination.
3. Choose the data you want to sync (Sleep, Steps, HRV).

## 2. Google Cloud Setup (The "API Key" part)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named "Personal Website Health".
3. Search for "**Fitness API**" and click **Enable**.
4. Go to **APIs & Services > OAuth consent screen**.
   - Choose **External**.
   - Fill in the minimum details (App name, Email).
   - Add the scope: `https://www.googleapis.com/auth/fitness.activity.read` and `https://www.googleapis.com/auth/fitness.sleep.read`.
5. Go to **Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - Select **Web application** (or Desktop app for easier token generation).
   - You will get a `Client ID` and `Client Secret`.

## 3. Generate Refresh Token
Since this is a background process, you need a "Refresh Token".
- The easiest way is to use the [Google OAuth Playground](https://developers.google.com/oauthplayground/).
- Under "Step 1", select **Fitness API v1** and the scopes you enabled.
- Click **Authorize API** and login/approve.
- Under "Step 2", click **Exchange authorization code for tokens**.
- Copy the `refresh_token`.

## 4. GitHub Setup
Go to your GitHub Repository Settings > **Secrets and variables > Actions**.
Add the following Repository Secrets:
- `GOOGLE_CLIENT_ID`: (Your Client ID)
- `GOOGLE_CLIENT_SECRET`: (Your Client Secret)
- `GOOGLE_REFRESH_TOKEN`: (The Refresh Token you just got)

---
Once these are set, the GitHub Action will run every 6 hours and update your site automatically!
