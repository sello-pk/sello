# Deployment Instructions

This repository is configured with a GitHub Actions workflow for automatic deployment to your VPS.

## 1. Configure GitHub Secrets

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | The IP address of your VPS | `123.45.67.89` |
| `VPS_USERNAME`| The SSH username | `root` or `ubuntu` |
| `VPS_SSH_KEY` | The private SSH key content | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `VPS_PORT` | (Optional) SSH port, defaults to 22 | `2222` |

## 2. Update Workflow File

Open `.github/workflows/deploy.yml` and locate the line:

```yaml
cd /root/apps/sello  # <--- UPDATE THIS PATH
```

Change `/root/apps/sello` to the **absolute path** where your project is located on your VPS.

## 3. Server Requirements

Ensure your VPS has the following installed:
- Node.js (v18+)
- PM2 (`npm install -g pm2`)
- Git

## 4. Trigger Deployment

Simply push any changes to the `main` branch:

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

The action will automatically:
1. SSH into your server.
2. Pull the latest code.
3. Install dependencies for both client and server.
4. Build the client.
5. Restart the application using PM2.
