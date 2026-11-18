# One Stock Academy enquiry backend

Node.js 20+ / Express / MongoDB / Google Sheets / Resend.

## Local setup
```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```
Set `VITE_API_URL` in `Real-estate/.env`.

## Environment variables
`NODE_ENV`, `PORT`, `MONGODB_URI`, `ALLOWED_ORIGINS`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `RESEND_API_KEY`, `MAIL_FROM`, and `MAIL_REPLY_TO`.

## MongoDB Atlas
Create a cluster and database user, allow the hosting provider IP range (or temporary development access), and put the connection string in `MONGODB_URI`.

## Google Sheets
Create a Google Cloud project, enable Google Sheets API, create a service account, and generate a key. Share the spreadsheet with the service-account email as **Editor**. Set `GOOGLE_SHEET_ID`; optionally set `GOOGLE_SHEET_TAB`.

## Resend
Add and verify the sending domain in Resend. Add its SPF and DKIM DNS records. If the root domain already handles email, verify a subdomain such as `mail.onestock.com`. Set `MAIL_FROM` to an address on the verified domain. Free limits are 3,000/month and 100/day.

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
