# One Stock Academy enquiry backend

Node.js 20.12+ / Express / MongoDB / Google Sheets / Sender.net.

## Local setup
```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```
Set `VITE_API_URL` in `Real-estate/.env`.
The backend loads `backend/.env` when present; MongoDB must be reachable at `MONGODB_URI`.

## Environment variables
`NODE_ENV`, `PORT`, `LOG_LEVEL`, `MONGODB_URI`, `ALLOWED_ORIGINS`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SENDER_API_KEY`, `MAIL_FROM`, and `MAIL_REPLY_TO`.

## Logging
The backend writes structured JSON logs to stdout for collection by the hosting provider. Set `LOG_LEVEL` to `fatal`, `error`, `warn`, `info` (default), `debug`, `trace`, or `silent`. Logs include a service/environment label, request ID, route, response status and duration, startup/shutdown events, and delivery/retry outcomes. Each HTTP response includes an `X-Request-Id` header for support correlation. Request bodies, contact details, authorization headers, and common credentials are not logged; do not add personal or secret values to log fields.

## MongoDB Atlas
Create a cluster and database user, allow the hosting provider IP range (or temporary development access), and put the connection string in `MONGODB_URI`.

## Google Sheets
Create a Google Cloud project, enable Google Sheets API, create a service account, and generate a key. Share the spreadsheet with the service-account email as **Editor**. Set `GOOGLE_SHEET_ID`; optionally set `GOOGLE_SHEET_TAB`.

## Sender.net
Enable transactional emails in Sender.net, create an API access token under **Account settings → API access tokens**, and verify the sending domain/address. Set `SENDER_API_KEY` to the token and `MAIL_FROM` to the verified sender, for example `One Stock Academy <enquiries@onestock.com>`. The backend sends transactional messages through Sender.net's REST API.
Confirmation emails use the current app's `/logo-brand.png` from the first HTTPS origin in `ALLOWED_ORIGINS`; keep that asset publicly accessible.

## Tests and curl
```powershell
npm test
npm run lint
npm start
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/enquiries -H "Content-Type: application/json" -d "{\"name\":\"Alex Morgan\",\"countryCode\":\"+91\",\"phone\":\"9876543210\",\"email\":\"alex@example.com\",\"pathway\":\"AI for Real Estate Professional\",\"preferredTime\":\"Morning (9 AM – 12 PM)\",\"source\":\"lead-popup\"}"
```

## Retry schedule
```powershell
npm run retry-failed
```
Run every 10–30 minutes with Render Cron Jobs or a Railway scheduled task. Retries stop at five attempts per delivery and do not resend sent emails or append a second sheet row.

## Deployment
Deploy to Render or Railway over HTTPS. Set all environment variables in the dashboard and set `ALLOWED_ORIGINS` to the production frontend origin. Start with `npm start`.
