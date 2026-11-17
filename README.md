# KalaKart – Full-Stack Next.js 14 Application

KalaKart is an authentic Indian Handcrafted Treasures Marketplace built as a **Single Unified Full-Stack Next.js 14** application.

## 🚀 Key Highlights
- **Single Full-Stack App:** Both Frontend (React UI, Tailwind CSS) and Backend (Next.js REST APIs, Mongoose) in one single project.
- **Zero CORS Issues:** Everything runs on the same domain/origin (`/api` relative endpoints).
- **Single Deployment:** Deployable to Vercel in 1 click without needing separate frontend/backend setups.
- **Local MongoDB Default:** Configured with local MongoDB by default.

## 🛠️ How to Run Locally

### 1. Start MongoDB (if not running)
```bash
mongod --dbpath /opt/homebrew/var/mongodb --bind_ip 127.0.0.1 --port 27017
```

### 2. Seed Database (Optional)
```bash
npm run seed
npm run create-admin
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
