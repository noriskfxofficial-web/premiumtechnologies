# Usage Notes — PT Solutions Final VIP Website

## Public website

Open `/` for the public website. Navigation includes Home, About, Services, Brands, Technology, VIP Portal, Vision, Global Standards, and Contact.

## Admin panel

Open `/admin` and log in using the demo credentials from `README.md`.

Inside admin you can:

- Edit company identity and SEO
- Update homepage, about, technology, vision, contact, and footer copy
- Manage services
- Manage brands and logo paths
- Manage VIP portal and global standards content
- View leads
- Export leads as CSV
- Upload media
- Edit the full JSON content structure
- Publish live changes instantly

## Client/VIP delivery recommendation

For a real VIP client handoff:

1. Change admin credentials in Netlify environment variables.
2. Connect the GitHub repo to Netlify.
3. Deploy production.
4. Visit `/admin` and click **Publish Live** once after reviewing the final content.
5. Test the contact form and lead inbox.
6. Replace or add any final client-specific assets through Media Upload or the file structure.

## Production portal note

The `/vip` page is a premium client portal presentation and access-request experience. A fully authenticated client portal can be expanded later with real client login, private file storage, support tickets, project timelines, and role-based access.
