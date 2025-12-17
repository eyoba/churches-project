# SMS System Setup - Complete Reference Guide

## Overview
This document contains all information about the SMS system setup for Debre Iyesus church management system, including domain registration, email forwarding, and MessageBird SMS service configuration.

---

## 1. DOMAIN REGISTRATION

**Provider:** Namecheap
**Dashboard:** https://www.namecheap.com
**Domain:** `debreiyesus.xyz`
**Cost:** $1.18/year (~15 NOK/year)
**Purpose:** Professional business email for MessageBird registration

### Why We Needed This
MessageBird requires a business email address for registration. Free email providers (Gmail, Outlook) are not accepted for business accounts.

---

## 2. EMAIL FORWARDING SERVICE

**Provider:** ImprovMX (Free tier)
**Dashboard:** https://app.improvmx.com/
**Setup:** Email forwarding service (no mailbox hosting needed)

### Emails Created
All emails forward to your Gmail account:
- `kontakt@debreiyesus.xyz` → your Gmail (primary business email)
- `test@debreiyesus.xyz` → your Gmail
- `admin@debreiyesus.xyz` → your Gmail

**Cost:** FREE forever (unlimited forwarding on free plan)

### DNS Records Added in Namecheap
Configure these DNS records in Namecheap dashboard for email forwarding to work:

| Type | Host | Value | Priority |
|------|------|-------|----------|
| MX | @ | mx1.improvmx.com | 10 |
| MX | @ | mx2.improvmx.com | 20 |
| TXT | @ | v=spf1 include:spf.improvmx.com ~all | - |

**Propagation Time:** 1-24 hours (usually within 1 hour)

### How to Test Email Forwarding
1. Send email to: kontakt@debreiyesus.xyz
2. Check your Gmail inbox
3. Email should arrive within seconds (after DNS propagation)

---

## 3. SMS SERVICE - MESSAGEBIRD (BIRD)

**Provider:** MessageBird (rebranded as "Bird")
**Dashboard:** https://app.bird.com/
**Registered with:** kontakt@debreiyesus.xyz
**Registration Date:** 2025 (see dashboard for exact date)

### API Configuration
**API Key:** `GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB`
**Key Location:** Dashboard → Developers → API access → Create access key
**Permissions:** Messages (SMS/MMS) enabled
**Mode:** Live (for real SMS sending)

### Sender Configuration
**Sender ID:** `DEBREIYESUS` (alphanumeric)
**Display:** Members see "DEBREIYESUS" as sender name, not a phone number
**Character Limit:** 11 characters max for alphanumeric sender IDs

### Pricing
| Item | Cost |
|------|------|
| Per SMS | €0.016 (~0.17-0.18 NOK depending on exchange rate) |
| 100 SMS | €1.60 (~18 NOK) |
| 1,000 SMS | €16 (~175 NOK) |
| 1,600 SMS/month | €25.60 (~280 NOK) |

**Note:** No free trial credit. Minimum top-up: €10 to start sending SMS.

### API Endpoints
**Base URL:** `https://rest.messagebird.com`

**Balance Check:**
```bash
curl -X GET https://rest.messagebird.com/balance \
  -H "Authorization: AccessKey GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB"
```

**Send SMS:**
```bash
curl -X POST https://rest.messagebird.com/messages \
  -H "Authorization: AccessKey GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB" \
  -H "Content-Type: application/json" \
  -d '{
    "originator": "DEBREIYESUS",
    "recipients": ["4748502673"],
    "body": "Test fra Debre Iyesus"
  }'
```

### Phone Number Format
- Remove `+` symbol before sending
- Remove spaces and dashes
- Example: `+47 485 02 673` → `4748502673`

---

## 4. BACKEND CONFIGURATION

### Environment Variables

**File:** `backend/.env`
```env
MESSAGEBIRD_API_KEY=GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB
MESSAGEBIRD_SENDER=DEBREIYESUS
```

**File:** `members-backend/.env`
```env
MESSAGEBIRD_API_KEY=GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB
MESSAGEBIRD_SENDER=DEBREIYESUS
```

### Code Implementation
Both backends use the same MessageBird REST API implementation:

**API Request Pattern:**
```javascript
const axios = require('axios');

const MESSAGEBIRD_CONFIG = {
  api_url: 'https://rest.messagebird.com/messages',
  api_key: process.env.MESSAGEBIRD_API_KEY,
  sender: process.env.MESSAGEBIRD_SENDER || 'DEBREIYESUS'
};

// Send SMS
const response = await axios.post(
  MESSAGEBIRD_CONFIG.api_url,
  {
    originator: MESSAGEBIRD_CONFIG.sender,
    recipients: phoneNumbers, // Array of phone numbers
    body: message
  },
  {
    headers: {
      'Authorization': `AccessKey ${MESSAGEBIRD_CONFIG.api_key}`,
      'Content-Type': 'application/json'
    }
  }
);
```

**Cost Calculation:**
```javascript
// €0.016 per SMS, convert to NOK
const cost_eur = recipients.length * 0.016;
const cost_nok = cost_eur * 11.5; // Exchange rate EUR to NOK
```

---

## 5. DEPLOYMENT CONFIGURATION

### Production Environment Variables (Azure)

When deploying to Azure App Service, add these environment variables in Azure Portal:

**church-backend (port 3001):**
```
MESSAGEBIRD_API_KEY=GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB
MESSAGEBIRD_SENDER=DEBREIYESUS
```

**church-members-backend (port 3002):**
```
MESSAGEBIRD_API_KEY=GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB
MESSAGEBIRD_SENDER=DEBREIYESUS
```

### Azure Configuration Steps
1. Go to Azure Portal
2. Navigate to App Service (backend or members-backend)
3. Settings → Configuration → Application settings
4. Click "+ New application setting"
5. Add both MESSAGEBIRD_API_KEY and MESSAGEBIRD_SENDER
6. Click "Save" and restart the app service

---

## 6. TESTING CHECKLIST

### Before Going Live
- [ ] Verify MessageBird account has credit (minimum €10)
- [ ] Test balance endpoint with curl command
- [ ] Test sending single SMS to your own phone number
- [ ] Verify SMS displays sender as "DEBREIYESUS"
- [ ] Test batch sending (multiple recipients)
- [ ] Verify cost calculation matches actual charges
- [ ] Check SMS delivery reports in MessageBird dashboard

### Test Commands
```bash
# Check account balance
curl -X GET https://rest.messagebird.com/balance \
  -H "Authorization: AccessKey GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB"

# Send test SMS to yourself
curl -X POST https://rest.messagebird.com/messages \
  -H "Authorization: AccessKey GazkzBUOF7JkWR3kqmnhmP4vnbUeprZOG1rB" \
  -H "Content-Type: application/json" \
  -d '{
    "originator": "DEBREIYESUS",
    "recipients": ["4748502673"],
    "body": "Test fra Debre Iyesus kirkens SMS-system"
  }'
```

---

## 7. TROUBLESHOOTING

### Common Issues

**Error: "Request not allowed (incorrect access_key)"**
- Verify API key is correct in .env files
- Restart both backend servers after changing .env
- Check MessageBird dashboard that API key hasn't been deleted
- Verify API key has "Messages" permission enabled

**SMS Not Received**
- Check MessageBird dashboard for delivery status
- Verify phone number format (no + or spaces)
- Check recipient has SMS consent enabled
- Verify account has sufficient credit

**Wrong Sender Displayed**
- Confirm MESSAGEBIRD_SENDER=DEBREIYESUS in .env
- Some countries may not support alphanumeric sender IDs
- Test with Norwegian phone numbers first

**Cost Estimate Wrong**
- Frontend: Update SendSMS.vue line 164 to use 0.18 NOK
- Backend: Verify 0.016 EUR per SMS in server.js
- Exchange rate may fluctuate (currently ~11.5 EUR to NOK)

---

## 8. COST ANALYSIS

### Monthly SMS Budget Examples

| Scenario | SMS/month | Cost EUR | Cost NOK |
|----------|-----------|----------|----------|
| Small church (100 members × 1 SMS/month) | 100 | €1.60 | ~18 NOK |
| Medium church (300 members × 2 SMS/month) | 600 | €9.60 | ~105 NOK |
| Large church (500 members × 3 SMS/month) | 1,500 | €24 | ~263 NOK |
| Active church (1000 members × 4 SMS/month) | 4,000 | €64 | ~700 NOK |

### Cost Comparison vs Twilio
- **MessageBird:** €0.016/SMS (~0.18 NOK)
- **Twilio:** ~€0.05-0.10/SMS (~0.55-1.10 NOK)
- **Savings:** 50-70% cheaper than Twilio

---

## 9. IMPORTANT NOTES

1. **API Key Security:**
   - Never commit .env files to git
   - Keep API key confidential
   - Rotate key if compromised

2. **Email Forwarding:**
   - Check ImprovMX dashboard monthly
   - Ensure Namecheap domain renewal is enabled
   - Keep domain renewed to maintain email forwarding

3. **MessageBird Account:**
   - Monitor credit balance regularly
   - Set up low balance alerts in dashboard
   - Review SMS delivery reports monthly

4. **Compliance:**
   - Only send SMS to members who have given consent
   - Database has `sms_consent` field for this purpose
   - Members can opt-out at any time

5. **Rate Limits:**
   - MessageBird has rate limits (check dashboard)
   - Backend implements batch sending for efficiency
   - Test with small batches first before large campaigns

---

## 10. SUPPORT CONTACTS

| Service | Support URL |
|---------|-------------|
| Namecheap | https://www.namecheap.com/support/ |
| ImprovMX | https://improvmx.com/support/ |
| MessageBird | https://support.messagebird.com/ |

---

**Document Created:** 2025-12-17
**Last Updated:** 2025-12-17
**Maintained By:** Debre Iyesus Development Team
**Version:** 1.0
