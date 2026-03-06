# EU / DSGVO Compliance Checklist

This document summarizes what is in place and what you may need to do for EU/GDPR (DSGVO) and ePrivacy compliance.

---

## Already in place

| Item | Status |
|------|--------|
| **Privacy Policy** | ✅ Comprehensive; mentions GDPR, German law, legal basis, data subject rights, BfDI, international transfers, retention, contact. |
| **Cookie Policy** | ✅ Describes essential vs analytics/performance cookies, third parties (Vercel, Cloudinary), managing cookies, local storage. |
| **Terms of Service** | ✅ Include account termination and data deletion. |
| **Account deletion** | ✅ Users can delete account in Settings; API deletes user and cascades to collections, items, etc. |
| **Data portability** | ✅ Export all collections as JSON or CSV via Settings / collection export. |
| **Data subject rights** | ✅ Listed in Privacy Policy (access, rectification, erasure, restrict, portability, object, withdraw consent, complain). |

---

## Implemented (previously gaps)

| Item | Status |
|------|--------|
| **Cookie consent** | Done: banner ("Accept all" / "Essential only"); Analytics + Speed Insights only after "Accept all". |
| **Sentry** | Done: in Privacy & Cookie Policy; client `enabled: false` until "Accept all" (GatedAnalytics). |
| **Impressum** | Done: `/impressum` (Nico Hennecke, nico@hennecke.email, address on request). |
| **Contact for GDPR** | Done: nico@hennecke.email in Privacy §12 and Impressum; Cookie Policy contact updated. |
| **Cookie settings** | Done: "Your cookie choice" on Cookie Policy page; "Cookie settings" in footer. |

---

## Optional / future

- **German Privacy Policy** (Datenschutzerklärung) for clarity.
- **Subprocessor list** – keep Privacy Policy list updated.
- **Age limit** – consider "under 16 in EU where applicable" in addition to under 13.

---

## (Legacy) Gaps and recommendations

### 1. Cookie consent (ePrivacy / Cookie Law) — **Done**

**Issue:** Non-essential cookies (e.g. Vercel Analytics, Vercel Speed Insights) are loaded without prior consent. EU ePrivacy and GDPR generally require **consent before** setting non-essential cookies or running analytics.

**Recommendation:**  
- Add a **cookie consent banner** on first visit (e.g. “Accept all” / “Essential only” / “Custom”).  
- Load Vercel Analytics (and optionally Sentry) **only after** the user has accepted “analytics” or “all” cookies.  
- Store the choice in a cookie or localStorage and respect it on subsequent visits.

### 2. Sentry in Privacy / Cookie Policy — **Medium priority**

**Issue:** Sentry (error tracking and possibly Session Replay) is used but not mentioned in the Privacy or Cookie Policy. It can process IP, device info, and session data.

**Recommendation:**  
- Add Sentry to the list of **service providers** in the Privacy Policy (section 5.2).  
- In the Cookie Policy, add a short subsection on **error monitoring** (e.g. Sentry) and whether it uses cookies or similar tech.  
- Optionally load Sentry only after consent (e.g. together with “analytics” or “marketing”) for stricter compliance.

### 3. Impressum (Legal notice) — **Required if you target Germany/Austria**

**Issue:** In Germany (§ 5 TMG / § 18 MStV) and Austria, websites that are “telemedia” or commercial generally need an **Impressum**: operator name, full address, contact (e.g. email), and optionally VAT ID and other details.

**Recommendation:**  
- If Colletro is directed at German or Austrian users (or you are based there), add an **Impressum** page (e.g. `/impressum` or “Legal notice”) and link it in the footer next to Privacy and Terms.  
- You can also offer a **German version of the Privacy Policy** (Datenschutzerklärung) for clarity and trust.

### 4. Contact for data subject requests

**Issue:** The Privacy Policy says to contact “through account settings or on our website.” Visitors without an account have no explicit contact (e.g. email or form).

**Recommendation:**  
- Add a **clear contact option** for data protection requests: e.g. a dedicated email (e.g. `privacy@colletro.com` or `datenschutz@colletro.com`) or a “Contact / Data protection” page, and refer to it in the Privacy Policy (e.g. in section 12).

### 5. Data processing agreement (AV-Vertrag) and subprocessors

**Issue:** If you use processors (Vercel, Prisma/DB, Sentry, Cloudinary, email provider, etc.), GDPR requires a **data processing agreement** and a list of subprocessors (or at least naming them in the Privacy Policy).

**Recommendation:**  
- In the Privacy Policy, **list main subprocessors** (hosting, database, analytics, error tracking, image hosting, email) and state that they process data on your instructions and under a contract (and, if applicable, Standard Contractual Clauses for transfers).  
- Optionally maintain a **subprocessor list** (in the policy or a separate page) and update it when you add or change providers.

### 6. Age limit

**Issue:** Privacy Policy states “not intended for children under 13.” In the EU, member states can set the age for valid consent (often 13–16). Germany often considers 16 for consent in relation to information society services.

**Recommendation:**  
- If you target Germany/EU, consider stating that the service is not intended for users below the age at which consent is valid in their country (e.g. “under 16 in the EU where applicable”). You can keep “under 13” as a minimum and add “or the applicable age in your country (e.g. 16 in Germany).”

---

## Quick reference

- **GDPR/DSGVO:** Legal basis, rights, retention, security, transfers, contact (nico@hennecke.email), Impressum — in place.
- **ePrivacy:** Cookie consent banner; analytics and Sentry only after "Accept all"; cookie settings on Cookie Policy page.
- **Germany/Austria:** Impressum at `/impressum` with name, email, address on request.

---

*This checklist is for orientation only and does not constitute legal advice. For binding compliance, consult a lawyer or a data protection officer.*
