This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Self-Hosting Deployments

### Synology NAS (GHCR Architecture)
1. Run `./scripts/deploy-nas.sh` on your dev machine to build and push the image to GHCR.
2. Transfer `docker-compose.nas.yml` and `.env.production` to your NAS.
3. On the NAS, pull and run the container:
   ```bash
   docker-compose -f docker-compose.nas.yml pull
   docker-compose -f docker-compose.nas.yml up -d
   ```

### Intel iMac (Direct Source Build)
1. On the Intel iMac, clone this repository:
   ```bash
   git clone <repository_url>
   cd miraclePoint
   ```
2. Create your `.env.production` file.
3. Run the helper deployment script, which pulls the latest code and uses `docker-compose` to build it locally:
   ```bash
   ./scripts/deploy-imac.sh
   ```
4. **(Optional)** If there has been a database schema change, run the manual database migration script:
   ```bash
   ./scripts/migrate-imac.sh
   ```

### Accessing the Intel iMac Remotely
To deploy or manage the Intel iMac server from your MacBook, you don't need to physically use the iMac.

1. **Enable SSH (Remote Login) on iMac:**
   - Go to **System Settings** > **General** > **Sharing**
   - Turn on **Remote Login** (SSH)
2. **Connect via Terminal:**
   ```bash
   ssh username@imac-ip-address
   # For example: ssh myuser@192.168.1.100
   ```
   (Once connected, you can run `cd miraclePoint` and execute your deployment scripts).
3. **Screen Sharing (Optional for GUI access):**
   - On the iMac, turn on **Screen Sharing** in the same Sharing settings.
   - On your MacBook, open Spotlight (Cmd + Space), type **Screen Sharing**, and enter the iMac's IP address.
