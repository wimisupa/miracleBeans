---
description: Deploy changes to production (v1.x.x)
---

This workflow automates the deployment process from the `miraclePoint` (Dev) folder to the `miraclePoint-prod` (Prod) folder.

**Prerequisites:**
- You must be in the `miraclePoint` (Dev) folder.
- The `miraclePoint-prod` folder must exist as a sibling.
- The server (Port 3000) should be stopped or will be restarted.

**Steps:**

1.  **Ask for Version & Message:**
    - Prompt the user for the new version tag (e.g., `v1.0.2`).
    - Prompt the user for a commit message.

2.  **Dev Environment (Commit & Tag):**
    - Run `git add .`
    - Run `git commit -m "<message>"`
    - Run `git tag -a <tag> -m "Release <tag>"`

3.  **Prod Environment (Update & Build):**
    - Navigate to `../miraclePoint-prod`
    - Run `git fetch --tags` (Fetch new tags from local dev repo)
    - Run `git checkout <tag>` (Switch to the new release tag)
    - Run `npm ci` (Install/Update dependencies cleanly)
    - Run `npx prisma migrate deploy` (Apply DB migrations to `prod.db`)
    - Run `npm run build` (Build for production)

4.  **Restart Server:**
    - Ask the user if they want to start the production server immediately.
    - If yes, run `npm run start` (Starts on Port 3000).

---
**How to Run:**
Just ask: "Run the deploy workflow" or "배포 워크플로우 실행해줘".
