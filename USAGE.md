# PT Solutions Netlify Usage

This repository is prepared to deploy from GitHub to Netlify.

## Required Netlify settings

Netlify normally reads these values from `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

## Required environment variables

Set these in Netlify under Site configuration > Environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_JWT_SECRET`

The project includes demo fallback credentials for first preview only. Change them before showing the website to a client.

## Admin URL

After deploy, open:

`https://your-site-name.netlify.app/admin`

Login, edit website content, then click `Publish Live`.
