# RMS Blog Frontend (Next.js + Bootstrap)

## Setup

1. Install dependencies
```
npm install
```

2. Configure backend base URL (optional)
- Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_BACKEND_BASE_URL`

3. Run dev server
```
npm run dev
```

## Pages
- `/` Blog list, filter, search, pagination, toggle status
- `/create-blog` Create blog form

## Components
- `Navbar` navigation bar
- `BlogList` grid of blog cards
- `BlogCard` single blog card with status toggle
- `LoadingSpinner` spinner

## API Service
- See `lib/api.js` for GET, POST, DELETE, PATCH calls to backend
