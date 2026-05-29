# RankForge AI — Incident Response Plan
**Control Reference:** NIST CSF 2.0 RS.CO-01 · NIST SP 800-61 Rev 3  
**Version:** 1.0 · **Date:** 2026-05-29  
**Owner:** Engineering Lead

---

## 1. Purpose

This plan defines the procedures to detect, contain, eradicate, and recover from security incidents affecting RankForge AI in production.

---

## 2. Incident Classification

| Severity | Definition | Response SLA |
|---|---|---|
| **P0 — Critical** | API key exposed publicly / data breach | 15 minutes |
| **P1 — High** | Service completely unavailable / AI model producing harmful output | 1 hour |
| **P2 — Medium** | Elevated error rate / rate limit bypass detected | 4 hours |
| **P3 — Low** | Single user experiencing errors / performance degradation | 24 hours |

---

## 3. Response Procedures

### P0 — Secret Exposure
1. **Immediately revoke** the compromised key in Google AI Studio / Google Cloud Console
2. **Generate a new key** and update Cloud Run environment variable
3. **Trigger new Cloud Run deployment** to propagate the new key
4. **Audit git history** — if key was committed, use `git filter-branch` or BFG Repo Cleaner
5. **Notify** all stakeholders within 1 hour

### P1 — Service Unavailable
1. Check Cloud Run logs: `gcloud run services logs read indiarune --region=europe-west1`
2. Check Gemini API status: https://status.cloud.google.com
3. If Gemini overloaded → fallback model (`gemini-2.5-flash`) is automatic
4. If Cloud Run issue → roll back to last healthy revision:
   ```bash
   gcloud run services update-traffic indiarune --to-revisions=PREVIOUS_REVISION=100 --region=europe-west1
   ```

### P2 — Elevated Error Rate
1. Review structured logs in Cloud Logging for error patterns
2. Check if rate limiter is functioning: look for HTTP 429 responses in logs
3. If AI output quality degraded → lower temperature, revert model if needed

### P3 — Performance
1. Review Cloud Monitoring dashboards for latency trends
2. Check if batch size reduction needed in `ranking.ts`

---

## 4. Communication

| Audience | Channel | Timing |
|---|---|---|
| Engineering team | Direct message | Immediately |
| Competition judges | Email (if during submission window) | Within 1 hour of P0/P1 |

---

## 5. Post-Incident Review

Within 48 hours of any P0 or P1, produce a written post-incident report covering:
- Timeline of events
- Root cause analysis
- Remediation steps taken
- Prevention measures implemented
