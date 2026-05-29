# RankForge AI — Risk Tolerance Policy
**Control Reference:** NIST CSF 2.0 GV.RM-01 · NIST SP 800-53 RA-2  
**Version:** 1.0 · **Date:** 2026-05-29  
**Owner:** Engineering Lead

---

## 1. Purpose

This document defines the formal risk tolerance thresholds for the RankForge AI application. All architectural, deployment, and AI model decisions must be evaluated against these thresholds before implementation.

---

## 2. Risk Appetite Statement

RankForge AI adopts a **Low-to-Moderate** overall risk appetite. Because the application produces AI-generated hiring intelligence that informs human decisions, accuracy, transparency, and fairness are non-negotiable.

---

## 3. Risk Tolerance Thresholds

| Risk Category | Tolerance Level | Threshold | Response |
|---|---|---|---|
| **Data Privacy** | Zero Tolerance | No PII storage, ever | Block deployment if violated |
| **Secret Exposure** | Zero Tolerance | No API keys in source control | Immediate revocation + rotation |
| **AI Bias / Fairness** | Zero Tolerance | No protected attributes in scoring | Block feature if violated |
| **API Security** | Low | Max 10 unauthenticated req/IP/min | Rate limiter enforced in middleware |
| **AI Availability** | Moderate | <5% error rate acceptable | Fallback model implemented |
| **Dependency CVEs** | Low | No HIGH/CRITICAL in direct deps | Block deployment; patch within 24h |
| **Transitive CVEs** | Moderate | Assess exploitability; accept if not reachable | Document and monitor |
| **TypeScript Safety** | Low | Zero `any` types in production code | ESLint blocks PR merge |
| **Response Accuracy** | Low | Structured schema enforced on all AI output | Schema validation mandatory |

---

## 4. Residual Risk Acceptance

The following residual risks are formally accepted for the hackathon scope:

| Risk | Justification | Owner |
|---|---|---|
| Lodash CVEs in Next.js internal bundle | Not exploitable via our code paths; upstream fix required | Next.js team |
| No persistent rate limiting (in-memory only) | Single-instance Cloud Run; acceptable for demo scale | Engineering |
| Gemini API quota exhaustion | Fallback model implemented; usage monitored | Engineering |

---

## 5. Review Cycle

This policy must be reviewed before every major deployment and at minimum quarterly in production.
