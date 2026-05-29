# RankForge AI — Cloud Monitoring & Alerting Setup Guide
**Control Reference:** NIST CSF 2.0 DE.CM-03 · NIST SP 800-53 SI-4  
**Version:** 1.0 · **Date:** 2026-05-29

---

## 1. Overview

This guide documents the Cloud Monitoring alert policies that must be configured for NIST DE.CM-03 compliance. These alerts detect anomalies in real time.

---

## 2. Alert Policies

### Alert 1 — High Error Rate (5xx)

**Trigger:** 5xx responses > 5% of requests over 5-minute window  
**Severity:** P1 — High  
**Action:** PagerDuty / email notification

```bash
gcloud alpha monitoring policies create \
  --notification-channels=<CHANNEL_ID> \
  --display-name="RankForge: High 5xx Error Rate" \
  --condition-display-name="5xx > 5%" \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"' \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

### Alert 2 — Gemini API Quota Exhaustion

**Trigger:** Gemini API quota usage > 80%  
**Severity:** P2 — Medium  
**Action:** Email notification

Monitor via: Google Cloud Console → APIs & Services → Quotas → Generative Language API

### Alert 3 — Rate Limit Triggers Spike

**Trigger:** HTTP 429 responses > 20 per minute (potential abuse)  
**Severity:** P2 — Medium  
**Action:** Email notification + review IP logs

```bash
# View rate-limited requests in logs
gcloud logging read 'resource.type="cloud_run_revision" AND jsonPayload.level="WARN" AND jsonPayload.message="Rate limit exceeded"' \
  --project=<PROJECT_ID> \
  --limit=50
```

### Alert 4 — Health Check Failure

**Trigger:** `/api/health` returns non-200  
**Severity:** P0 — Critical  
**Action:** Immediate PagerDuty

```bash
# Set up uptime check
gcloud monitoring uptime-check-configs create \
  --display-name="RankForge Health Check" \
  --monitored-resource=uptime_url \
  --host=indiarune-564295920588.europe-west1.run.app \
  --path=/api/health \
  --period=60s
```

---

## 3. Structured Log Queries

All application logs are structured JSON. Use these queries in Cloud Logging:

```bash
# All errors
jsonPayload.level="ERROR"

# Ranking failures
jsonPayload.service="api/rank" AND jsonPayload.level="ERROR"

# Rate limit events
jsonPayload.service="middleware" AND jsonPayload.level="WARN"

# Health check history
jsonPayload.service="health"
```

---

## 4. Dashboard

Create a Cloud Monitoring dashboard with these widgets:
1. Request count by response code (5xx vs 2xx)
2. Request latency (p50, p95, p99)
3. Instance count (auto-scaling view)
4. HTTP 429 rate (rate limit activations)
5. Health check uptime %

---

## 5. Compliance Statement

When all 4 alert policies above are active, RankForge AI achieves **NIST CSF 2.0 DE.CM-03** compliance:
> "Computing resources are protected by monitoring to provide visibility into unauthorized or unexpected activity."
