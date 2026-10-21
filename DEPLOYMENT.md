# TaskFlow VM Deployment Guide & Runbook

This runbook outlines the standard operating procedures for deploying TaskFlow to a target Linux VM using SSH and Docker, following the VM Deployment Responsibilities.

---

## 1. Pre-Deployment Inspection Checklist

Before executing any deployment on the target VM, inspect the environment over SSH:

```bash
# 1. Inspect OS version
cat /etc/os-release

# 2. Inspect available disk space (ensure at least 2GB free for images/volumes)
df -h /var/lib/docker /

# 3. Check Docker daemon and Docker Compose status
sudo systemctl status docker
docker --version
docker compose version

# 4. Check active firewall rules and allowed inbound traffic
sudo ufw status verbose || sudo iptables -L -n -v

# 5. Check if port 5001 or any conflict is currently listening
sudo ss -tulpn | grep 5001
```

---

## 2. Pre-Deployment State Backup

Before performing upgrades or applying changes:

```bash
# Create a timestamped backup directory
BACKUP_DIR="/opt/backups/taskflow-$(date +%Y%m%d%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"

# Backup SQLite database volume if container is running
if [ -d "/var/lib/docker/volumes/taskflow_sqlite_data/_data" ]; then
  sudo cp -r /var/lib/docker/volumes/taskflow_sqlite_data/_data "$BACKUP_DIR/data"
  echo "Database state backed up to $BACKUP_DIR/data"
fi

# Backup existing docker-compose.yml and .env
if [ -f "/opt/taskflow/docker-compose.yml" ]; then
  sudo cp /opt/taskflow/docker-compose.yml "$BACKUP_DIR/"
  [ -f "/opt/taskflow/.env" ] && sudo cp /opt/taskflow/.env "$BACKUP_DIR/"
fi
```

---

## 3. Deployment Procedure

### Step A: Transfer Artifacts or Clone Repository
On deployment host:
```bash
sudo mkdir -p /opt/taskflow
cd /opt/taskflow
```

Transfer `Dockerfile`, `docker-compose.yml`, `package.json`, `backend/`, and `frontend/` to `/opt/taskflow`.

### Step B: Configure Environment Variables
Create `/opt/taskflow/.env` (do NOT commit secrets or log sensitive values):
```env
NODE_ENV=production
PORT=5001
DB_PATH=/app/backend/data/taskflow.db
```

### Step C: Build & Deploy Container Stack
```bash
cd /opt/taskflow

# Build versioned image
docker compose build --pull

# Start application in detached mode
docker compose up -d

# Verify image tag
docker images taskflow:1.0.0
```

---

## 4. Post-Deployment Verification

Verify container health and API connectivity:

```bash
# 1. Verify container status and Docker health check
docker compose ps

# 2. Inspect health check output directly
docker inspect --format='{{json .State.Health}}' taskflow_app | jq .

# 3. Test HTTP Health Endpoint
curl -fsS http://localhost:5001/api/health

# 4. Test Tasks API Endpoint
curl -fsS http://localhost:5001/api/tasks | jq '.count'

# 5. Inspect application logs for clean startup
docker compose logs --tail=50 taskflow
```

---

## 5. Rollback Procedure

If health checks fail or an issue is detected during post-deployment verification:

```bash
cd /opt/taskflow

# 1. Stop the failing container
docker compose down

# 2. Revert to the previous image version (e.g., previous tag or backup)
# Update docker-compose.yml image tag to previous stable version
# or restore files from $BACKUP_DIR
sudo cp "$BACKUP_DIR/docker-compose.yml" ./

# 3. Restore database snapshot if schema migration occurred
if [ -d "$BACKUP_DIR/data" ]; then
  sudo cp -r "$BACKUP_DIR/data"/* /var/lib/docker/volumes/taskflow_sqlite_data/_data/
fi

# 4. Bring previous version back online
docker compose up -d

# 5. Re-verify health
curl -fsS http://localhost:5001/api/health
```
