# PT Solutions — Premium Technologies Solutions

Final VIP client-ready website package for **PT Solutions / Premium Technologies Solutions**.

This build is designed as a premium global technology company website with modern glassmorphism visuals, photo assets, bilingual English/Arabic content, full-stack service positioning, backend/admin functionality, lead capture, media upload, and a polished VIP client portal presentation.

## Included in this final version

- Premium international tech company homepage
- English first + Arabic language switcher
- Modern glassmorphism UI system
- High-end photo asset usage throughout the website
- Full responsive desktop and mobile experience
- Pages:
  - Home
  - About
  - Services
  - Brands
  - Technology
  - VIP Client Portal
  - Vision
  - Global Standards / Partners inspiration
  - Contact
  - Coming Soon / Under Construction
- Services covering:
  - Full-stack development
  - UI/UX design
  - Frontend interfaces
  - Backend architecture
  - Admin panels / CMS
  - VIP client portals
  - SaaS platforms
  - AI automation
  - Fintech ecosystems
  - Commerce and media systems
  - Cloud, security, and performance
  - Technology consulting
- Brand showcase with original logos displayed inside premium circular frames
- Global standards page with clear disclaimer that listed institutions are inspiration/benchmark references, not claimed formal partnerships
- Functional `/admin` panel
- Live content publishing through Netlify Functions + Netlify Blobs
- Lead capture form with admin lead inbox
- CSV lead export
- Media upload through Netlify Functions
- Full JSON control for advanced client-side content management

## Admin login

The package includes demo credentials for preview:

- Email: `admin@ptsolutions.global`
- Password: `PTSolutions@2026`

Before giving live production access to a real client, set these Netlify environment variables:

```bash
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-password
ADMIN_JWT_SECRET=your-long-random-secret
```

## Deploy to Netlify through GitHub

1. Create a new GitHub repository.
2. Upload the contents of this folder as the repository root.
3. In Netlify, click **Add new project** → **Import an existing project** → **GitHub**.
4. Select the repository.
5. Netlify should read `netlify.toml` automatically.
6. Confirm these settings:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
7. Add the environment variables listed above.
8. Deploy.

## Local development

```bash
npm install
npx netlify dev
```

Open the local Netlify URL, usually:

```bash
http://localhost:8888
```

## Important notes

- Do not redesign or redraw the original brand logos. They are displayed inside premium circular presentation frames.
- The VIP Client Portal page is a polished presentation and access-request experience. A production private portal can be expanded later with client accounts, document storage, project permissions, and authenticated project workspaces.
- The admin panel is functional for live content, leads, media, and JSON publishing.
- The website defaults to the upgraded VIP content package. If an older Netlify Blob content file exists, the content function serves the new default content until the upgraded content is published again from the admin panel.

## Contact information used

- Email: `primetechnologiessolutions@outlook.com`
- Phone / WhatsApp: `+961 81 450 719`
- Instagram / Telegram / Facebook: `@premium_technologies_solutions`
