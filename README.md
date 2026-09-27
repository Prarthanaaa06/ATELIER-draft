# ATELIER-draft — Poetry Archive & Revision Atelier

A minimalist manuscript archive, revision history atelier, and reader crafted for poets and writers. Features multi-version draft timelines, side-by-side stanza diffing, collections, editable titles, custom themes (Dark, Light, Warm Brown, Pastel), and real-time cloud synchronization with **Google Sign-In** & **Cloud Firestore**.

---

## Features

- **Google Sign-In & Cloud Sync**: Seamlessly synchronize manuscript drafts, collections, and revision history across devices via Firebase Authentication & Cloud Firestore.
- **Offline-First & Local Cache**: Full offline editing with automatic sync and debounce when reconnected.
- **Draft Versioning & Timeline**: Immutable draft snapshots, change notes, and version branching.
- **Side-by-Side Diff Viewer**: Granular line-level comparison between any two draft revisions.
- **Zen & Focus Reading**: Typography modes (Garamond / Newsreader serif), warm paper and ink dark mode palettes.
- **Zero-Server Architecture**: 100% serverless, zero maintenance, deployable to Vercel, Netlify, or Firebase Hosting.

---

## 1. Google Account & Firebase Setup (Free Tier)

To enable live Google Sign-In and cloud sync:

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project** (name it `poetry-archive` or similar).

2. **Enable Google Authentication**:
   - In the left sidebar, navigate to **Build > Authentication**.
   - Click **Get started**, then under **Sign-in method**, choose **Google**.
   - Toggle **Enable**, select your project support email, and click **Save**.

3. **Enable Cloud Firestore**:
   - In the left sidebar, navigate to **Build > Firestore Database**.
   - Click **Create database**.
   - Select a location close to you and choose **Start in test mode** (or configure security rules below).
   - Click **Enable**.

4. **Get Web App Credentials**:
   - In Project Settings (gear icon in the top left), scroll to **Your apps** and click the **Web (`</>`)** icon.
   - Register app nickname (e.g. `poetry-web`).
   - Copy the values inside the `firebaseConfig` object into your local `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

> **Note**: Even without configuring keys right away, the app includes a **Demo Mode** button in the Google sign-in dialog so you can test all features immediately!

### Recommended Firestore Security Rules
Under **Firestore Database > Rules**, paste the following to ensure each user can only read and write their own poetry archive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 2. Moving to Git & GitHub

Your `.gitignore` is already configured to keep your secrets (`.env`) safe.

Run the following commands in your terminal to commit and push your repository to GitHub:

```bash
# 1. Stage all project files
git add .

# 2. Create your first commit
git commit -m "feat: poetry archive with google sign-in, firestore cloud sync, and deployment setup"

# 3. Rename branch to main
git branch -M main

# 4. Create a new repository on GitHub (https://github.com/new), then link it:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to GitHub
git push -u origin main
```

---

## 3. Deploying to the Web

### Option A: Deploy to Vercel (Recommended — 1 Click)

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add your 6 Firebase variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Click **Deploy**. Vercel will build and deploy your site in ~30 seconds!

### Option B: Deploy to Netlify

1. Push your code to GitHub.
2. Go to [Netlify](https://app.netlify.com/) and click **Add new site > Import an existing project**.
3. Select your GitHub repository.
4. Build command: `npm run build`, Publish directory: `dist`.
5. Add the same 6 `VITE_FIREBASE_*` environment variables under **Site configuration > Environment variables**.
6. Click **Deploy Site**.

---

## 4. Crucial Post-Deployment Step: Authorize Your Domain

Once your app is deployed (e.g. `your-poetry-app.vercel.app` or `your-site.netlify.app`):

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Go to **Authentication > Settings > Authorized domains**.
3. Click **Add domain**.
4. Paste your Vercel or Netlify domain (e.g. `your-poetry-app.vercel.app`).

*Now users and yourself can log in with Google directly from your production website!*

---

## Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
