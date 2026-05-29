# RankForge AI — Disaster Recovery Runbook
**Control Reference:** NIST CSF 2.0 RC.RP-01 · NIST SP 800-34 Rev 1  
**Version:** 1.0 · **Date:** 2026-05-29  
**RTO (Recovery Time Objective):** 30 minutes  
**RPO (Recovery Point Objective):** Last successful git commit

---

## 1. Recovery Scenarios

### Scenario A — Cloud Run Service Failure

```bash
# 1. List available revisions
gcloud run revisions list --service=indiarune --region=europe-west1

# 2. Route 100% traffic to last known-good revision
gcloud run services update-traffic indiarune \
  --to-revisions=<PREVIOUS_REVISION>=100 \
  --region=europe-west1

# 3. Verify health endpoint
curl https://indiarune-564295920588.europe-west1.run.app/api/health
```

### Scenario B — Accidental Code Regression (Bad Deploy)

```bash
# 1. Identify last good commit
git log --oneline -10

# 2. Revert to last good commit
git revert HEAD
git push origin main
# Cloud Build automatically redeploys

# 3. Monitor health
curl https://indiarune-564295920588.europe-west1.run.app/api/health
```

### Scenario C — API Key Compromised / Revoked

```bash
# 1. Generate new API key in Google AI Studio
# 2. Update Cloud Run environment variable
gcloud run services update indiarune \
  --set-env-vars=GEMINI_API_KEY=<NEW_KEY> \
  --region=europe-west1

# 3. Verify
curl https://indiarune-564295920588.europe-west1.run.app/api/health
```

### Scenario D — Complete Service Rebuild from Scratch

```bash
# 1. Clone repository
git clone https://github.com/ashu27198mastud-design/India-Runs.git
cd India-Runs

# 2. Install dependencies
npm install

# 3. Set environment variables in Cloud Run Console:
#    GEMINI_API_KEY = <your-key>
#    GOOGLE_CIVIC_API_KEY = <your-key>

# 4. Deploy
gcloud run deploy indiarune \
  --source=. \
  --region=europe-west1 \
  --allow-unauthenticated
```

---

## 2. Health Check Verification

After any recovery action, verify:

```bash
# Should return {"status":"healthy",...}
curl https://indiarune-564295920588.europe-west1.run.app/api/health

# Should return ranked candidates
curl https://indiarune-564295920588.europe-west1.run.app/api/rank
```

---

## 3. Recovery Contacts

| Resource | URL |
|---|---|
| GitHub Repository | https://github.com/ashu27198mastud-design/India-Runs |
| Cloud Run Console | https://console.cloud.google.com/run |
| Google AI Studio | https://aistudio.google.com |
| GCP Status | https://status.cloud.google.com |
