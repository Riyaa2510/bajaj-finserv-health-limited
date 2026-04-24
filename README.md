# BFHL — SRM Full Stack Challenge

## Project Structure
```
bfhl-project/
├── backend/         ← Express.js REST API
│   ├── index.js
│   └── package.json
└── frontend/        ← Single-page HTML app
    └── index.html
```

---

## Step 1 — Edit Your Personal Details

Open `backend/index.js` and update lines 8-10:

```js
const USER_ID       = "yourname_ddmmyyyy";         // e.g. "johndoe_17091999"
const EMAIL_ID      = "your.email@srmist.edu.in";  // your college email
const COLLEGE_ROLL  = "RA2311003010001";            // your college roll number
```

---

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new PUBLIC repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bfhl-project.git
git push -u origin main
```

---

## Step 3 — Deploy Backend on Render (free)

1. Go to https://render.com → Sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo → select it
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment**: Node
5. Click **Deploy**
6. Your backend URL will be: `https://yourname-bfhl.onrender.com`
7. Test: open `https://yourname-bfhl.onrender.com` — should say "BFHL API is running"

---

## Step 4 — Update Frontend API URL

Open `frontend/index.html`, find line:
```html
<input ... value="http://localhost:3000" ...>
```
Change it to your Render URL:
```html
<input ... value="https://yourname-bfhl.onrender.com" ...>
```

---

## Step 5 — Deploy Frontend on Netlify (free)

1. Go to https://netlify.com → Sign up
2. Drag and drop the `frontend/` folder onto Netlify's dashboard
3. Netlify gives you a URL like: `https://bfhl-xyz.netlify.app`

OR via GitHub:
1. Push the full project to GitHub
2. Netlify → New Site → Import from GitHub
3. Base directory: `frontend`, Publish directory: `frontend`

---

## Step 6 — Fill Submission Form

| Field | What to put |
|---|---|
| GitHub Repository URL | `https://github.com/YOUR_USERNAME/bfhl-project` |
| Frontend URL | `https://bfhl-xyz.netlify.app` |
| Backend API Base URL | `https://yourname-bfhl.onrender.com` ← NO /bfhl at end! |

---

## Local Testing

```bash
cd backend
npm install
node index.js
# Server starts at http://localhost:3000
```

Test with curl:
```bash
curl -X POST http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D","hello","1->2","A->B"]}'
```

Then open `frontend/index.html` in your browser (double-click it).
