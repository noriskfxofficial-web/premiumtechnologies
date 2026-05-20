# PT Solutions — Premium Technologies Solutions

Ultra-premium bilingual company website prepared for Netlify deployment.

## What is included

- Premium public website for PT Solutions / Premium Technologies Solutions
- English and Arabic versions with language switcher
- Responsive mobile-first design
- Pages: Home, About, Brands, What We Build, Technology, Partners, Insights, Careers, Contact
- Full live admin panel at `/admin`
- Admin control for company identity, SEO, hero, pages, services, brands, insights, contact, footer, and full JSON
- Lead capture form with admin lead inbox
- CSV lead export
- Media upload through Netlify Functions + Netlify Blobs
- Live publishing through Netlify Blobs so edits appear immediately after clicking `Publish Live`
- Netlify redirects for SPA routes

## Important admin login

For demo preview, the project includes fallback credentials:

- Email: `admin@ptsolutions.global`
- Password: `PTSolutions@2026`

Before giving this to a real client or making the site public, set these environment variables in Netlify:

```bash
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-password
ADMIN_JWT_SECRET=your-long-random-secret
```

## Deploy to Netlify

### Option 1 — Drag and drop / manual upload

1. Upload this folder to a GitHub repository or open it in Netlify.
2. In Netlify, create a new site from the repository.
3. Netlify will read `netlify.toml` automatically.
4. Build command: `npm run build`
5. Publish directory: `public`
6. Functions directory: `netlify/functions`
7. Add the environment variables above.
8. Deploy.

### Option 2 — Netlify CLI

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --build
npx netlify deploy --prod --build
```

## Local development

```bash
npm install
npx netlify dev
```

Open the local Netlify URL, usually `http://localhost:8888`.

## How the admin works

The public website fetches its content from:

```bash
/.netlify/functions/content
```

The admin panel saves content through:

```bash
/.netlify/functions/publish
```

The content is stored in Netlify Blobs, not inside a static file, which means the site can show published changes immediately without waiting for a rebuild.

## Editing content

Go to `/admin`, login, edit sections, then click `Publish Live`.

For maximum control, use the `Full JSON Control` tab. It exposes the full content structure for every page and language.

## Notes

- The uploaded PT Solutions logo is included at `public/images/pt-solutions-logo.webp`.
- The website uses CSS-generated premium visuals instead of copyrighted Google images, so it is safer for selling and publishing.
- Replace default email, WhatsApp, and brand URLs inside the admin panel before final client delivery.
- If you use external images later, only use properly licensed or owned images.


## GitHub -> Netlify recommended flow

This package is intended to be uploaded to GitHub first, then imported into Netlify.

1. Create a new GitHub repository.
2. Upload the contents of this folder as the repository root.
3. In Netlify, choose **Add new project** -> **Import an existing project** -> **GitHub**.
4. Netlify should read `netlify.toml` automatically.
5. Confirm these settings:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. Add environment variables for admin security.
7. Deploy.

Do not drag the full source project into Netlify Drop if you want the admin/functions to work. Drag-and-drop deploys do not run the build setup. For this project, GitHub-based deployment is the correct flow.

For Arabic step-by-step instructions, see `GITHUB_NETLIFY_DEPLOY_AR.md`.


## Ultra-light GitHub package
All website and admin features remain included. Images were optimized to `.webp` to make GitHub web upload easier. Logos were not redesigned; only file compression/resizing was applied.
