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

3.  **Prod Environment (Update & Deploy):**
    - Navigate to `../miraclePoint-prod`
    - Run `git fetch --tags` (Fetch new tags from local dev repo)
    - Run `git checkout <tag>` (Switch to the new release tag)
    - Run `mkdir -p ~/miraclePoint-data` (Ensure external database directory exists)
    - Run `docker-compose build` (Build the new Docker image based on the latest code)
    - Run `docker-compose up -d` (Start the new container gracefully in the background)
    - Run `docker exec miracle-point-prod npx prisma migrate deploy` (Apply DB migrations to the external `prod.db` inside the container)

4.  **Verify:**
    - The server should now be running cleanly on Port 3000 via Docker.
    - Test the application to ensure it is healthy.

---
**How to Run:**
Just ask: "Run the deploy workflow" or "배포 워크플로우 실행해줘".
