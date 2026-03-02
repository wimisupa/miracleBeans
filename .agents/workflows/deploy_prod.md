---
description: Deploy changes to production (v1.x.x)
---

This workflow automates the deployment process for the production environment using Docker directly from the `miraclePoint` main folder.

**Prerequisites:**
- You must be in the `miraclePoint` folder.
- Docker Desktop must be running.

## The Workflow (Docker Native)

Now that the application is containerized, you **no longer need** the separate `miraclePoint-prod` directory. Both development and production deployments can be managed elegantly from your main `miraclePoint` repository.

1.  **Tag the Release:**
    - Test your features locally in dev (`npm run dev`).
    - Once satisfied, commit your changes.
    - Run `git tag -a <tag> -m "Release <tag>"`
    - Run `git push --follow-tags origin main`

2.  **Deploy to Production:**
    - Production now runs inside an isolated Docker container cluster, routing traffic through Caddy for HTTPS.
    - Run `mkdir -p ~/miraclePoint-data ~/caddy-data ~/caddy-config` (Ensure the external SQLite and Caddy volumes exist)
    - Run `docker-compose build` (Builds the Next.js `standalone` image using the latest committed code)
    - Run `docker-compose up -d --force-recreate` (Re-creates the containers with zero downtime mapping `https://ohmycong.wimi.com` to Port 443)
    - Run `docker exec miracle-point-prod npx prisma@5.22.0 db push --skip-generate` (Applies schema updates to the isolated `~/miraclePoint-data/prod.db`)

3.  **Verify:**
    - Navigate to `https://ohmycong.wimi.com` to verify the production instance is safely encrypted and healthy.

---
**How to Run:**
Just ask: "Run the deploy workflow" or "배포 워크플로우 실행해줘".
