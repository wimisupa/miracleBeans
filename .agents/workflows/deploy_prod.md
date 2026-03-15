---
description: Deploy changes to Intel iMac Production Server
---

This workflow automates the deployment process for the Intel iMac production environment.

**Prerequisites:**
- Access to the Intel iMac (via SSH or terminal).
- Changes have been committed and pushed to the `main` branch on GitHub.

## The Workflow (Intel iMac)

The deployment now uses a single script on the iMac that pulls the latest code and rebuilds the Docker containers. Database migrations are applied automatically during container startup.

1.  **Tag and Push (Local Machine):**
    - Ensure your changes are tested and committed.
    - Run `git push origin main`

2.  **Deploy on iMac:**
    - Open the terminal on the Intel iMac (or SSH into it).
    - Navigate to the project directory: `cd ~/Workspaces/miraclePoint`
    - Run the deployment script:
    // turbo
    - `bash scripts/deploy-imac.sh`

3.  **Automatic Steps (Handled by Script/Docker):**
    - The script will pull the latest code: `git pull origin main`
    - Containers will rebuild and start: `docker-compose up -d --build`
    - **Migrations:** The `entrypoint.sh` inside the container automatically runs `npx prisma migrate deploy` before the server starts.

4.  **Verify:**
    - Check the logs to ensure migrations and startup were successful:
    - `docker-compose logs -f miracle-point`
    - Visit `https://ohmycong.wimi.com` to verify the site is live.

---
**How to Run:**
Just ask: "배포 워크플로우 실행해줘" or "아이맥에 배포해줘".

