# BryonDevelops Sanity Studio

This directory contains the Sanity Studio that powers dynamic content (experience cards, rich media snippets) for the portfolio. It is deployed independently from the Next.js app but shares environment variables for authentication.

## Commands
```bash
npm install        # install studio dependencies
npm run dev        # start local studio at http://localhost:3333
npm run build      # generate a production build
npm run deploy     # deploy to Sanity managed hosting
```

## Environment variables
Create `.env` or `.env.local` with:

```
SANITY_STUDIO_PROJECT_ID=49hebsmj
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_TITLE=bryondevelops
SANITY_AUTH_TOKEN=your_token # optional for write access
```

These should mirror the variables configured in the main Next.js app (`.env.local`). Tokens are only required when running authenticated mutations.

## Schema
Custom document types live in `schemaTypes/` (for example `experienceCard.ts`). Add new types there and register them in `sanity.config.ts`.

## Deployment
Refer to `../SANITY_DEPLOYMENT_README.md` for end-to-end deployment steps, including CORS configuration and linking the studio to Vercel or other hosts.

## Contributing
- Keep schema changes backwards compatible when possible.
- Document new content types in the main repo so the Next.js app can consume them safely.
- Remember to redeploy both the Studio and Next.js app after introducing schema changes used by pages.
