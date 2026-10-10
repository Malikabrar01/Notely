# Notely

**Previous year papers, notes and syllabus, organised by college, branch, semester and subject.**

Notely is a MERN web app where college students can find everything their class has shared for a subject in one place, and add their own files to help others.

🔗 **Live app:** https://notely-one-tawny.vercel.app
🔗 **API:** https://notely-b9wc.onrender.com
🔗 **Source:** https://github.com/Malikabrar01/Notely

> **Heads up:** the backend runs on a free Render instance that sleeps after about 15 minutes of inactivity. The first visit after a quiet period can take 30 to 60 seconds to wake up. After that it is fast.

---

## Features

- **Sign up and log in** with email and password (JWT authentication, bcrypt-hashed passwords).
- **Multiple colleges.** Pick your college at signup, or register a new one if it is not listed.
- **Personal view.** Each student sees content for their own college, branch and semester by default, with filters to browse other branches and semesters.
- **Subject-wise pages.** Every subject has its own page showing its **syllabus, notes and previous year papers** together.
- **Upload and share.** Upload PDF, JPG or PNG files (up to 10 MB). Files are stored on Cloudinary.
- **Search** subjects by name, with existing subjects suggested on upload to avoid duplicates.
- **Report and moderate.** Students can report a file. Moderators and admins review reports, dismiss them or delete the file.
- **College separation.** The server enforces it from the login token, so one college's students cannot read another's files.
- **Responsive UI** with loading skeletons, toast notifications and a warm teal design.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, lucide-react, react-hot-toast, axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JSON Web Tokens, bcryptjs |
| File storage | Cloudinary (uploads handled with Multer) |
| Hosting | Vercel (frontend), Render (backend) |

## Project structure

```
Notely/
├── client/                 # React app
│   ├── src/
│   │   ├── components/     # Navbar, ResourceCard, AuthLayout, ...
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Signup, Dashboard, SubjectPage, Upload, Moderation
│   │   ├── utils/          # subjectStyle helpers
│   │   ├── api.js          # axios instance (adds the JWT)
│   │   └── App.jsx
│   └── vercel.json         # SPA rewrites
└── server/                 # Express API
    ├── config/             # Cloudinary setup
    ├── middleware/         # JWT auth
    ├── models/             # College, User, Resources
    ├── routes/             # auth, colleges, resources
    ├── scripts/            # seedColleges.js
    └── server.js
```

## Run it locally

### Prerequisites

- Node.js 18 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A free [Cloudinary](https://cloudinary.com) account (turn on **Settings, Security, Allow delivery of PDF and ZIP files**)

### 1. Clone and install

```bash
git clone https://github.com/Malikabrar01/Notely.git
cd Notely

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

Create `server/.env`:

```
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5001/api
```

> Port 5001 is used because macOS reserves port 5000 for AirPlay.
> **Never commit `.env` files.** They are listed in `.gitignore`.

### 3. (Optional) Seed a few colleges

```bash
cd server
node scripts/seedColleges.js
```

Students can also add their own college while signing up.

### 4. Start both apps

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Open http://localhost:5173.

## API overview

All routes except signup, login and the college list need an `Authorization: Bearer <token>` header.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account (existing or new college) |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/colleges` | List colleges |
| GET | `/api/resources/subjects` | Subjects with file counts (filters: `branch`, `semester`) |
| GET | `/api/resources` | List files (filters: `type`, `branch`, `semester`, `subject`, `q`) |
| POST | `/api/resources` | Upload a file (multipart form) |
| DELETE | `/api/resources/:id` | Delete a file (owner, moderator or admin) |
| POST | `/api/resources/:id/report` | Report a file |
| GET | `/api/resources/reported` | Reported files (staff) |
| POST | `/api/resources/:id/dismiss` | Clear reports (staff) |

## Roles

| Role | Can do |
|---|---|
| `student` | Browse, upload, delete own files, report files |
| `moderator` | Everything above, plus review reports and delete files in their college |
| `admin` | Same as moderator (set manually in the database) |

The first person to register a brand-new college becomes its moderator.

## Deployment

- **Backend (Render):** Root Directory `server`, Build Command `npm install`, Start Command `npm start`. Add `MONGO_URI`, `JWT_SECRET`, the three `CLOUDINARY_*` variables, and `CLIENT_URL` (your exact Vercel URL, with no trailing slash).
- **Frontend (Vercel):** Root Directory `client`, framework preset Vite. Add `VITE_API_URL` set to `https://<your-render-url>/api`, then redeploy, because Vite reads it at build time.
- **MongoDB Atlas:** allow network access from `0.0.0.0/0`, since Render's free tier has no fixed IP, and use a strong database password.

> File names are case-sensitive on Linux. A file called `login.jsx` that is imported as `Login` works on a Mac but fails on Vercel and Render.

## Roadmap

- Searchable college picker
- Drag-and-drop upload with a progress bar
- Bookmarks for favourite subjects
- Dark mode
- Verified colleges using email domains
- Super-admin tools to merge or remove colleges

## Author

Built by **Abrar Javid**.

## License

ISC