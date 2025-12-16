# Medlemssystem Backend

Komplett medlemshåndteringssystem for kirker med sikker datalagring, CRUD operasjoner, og SMS-funksjonalitet.

## ✅ Status: FULLSTENDIG IMPLEMENTERT OG KJØRER!

Backend serveren kjører på: **http://localhost:3002**
Frontend kjører på: **http://localhost:5178**

## Innloggingsdetaljer

```
URL: http://localhost:5178/members/login
Brukernavn: admin
Passord: admin123
```

## Funksjonalitet

### ✅ Implementert:
- **Autentisering**: JWT-basert innlogging med bcrypt password hashing
- **Medlemshåndtering**: Full CRUD (Create, Read, Update, Delete)
  - Navn, telefon, e-post, personnummer (11 siffer)
  - Adresse, postnummer, by
  - Medlemsdato, dåp informasjon
  - SMS samtykke (GDPR)
  - Notater
- **SMS-funksjonalitet**: Send SMS til valgte medlemmer (krever Twilio oppsett)
- **SMS historikk**: Logg over sendte SMS med mottakerliste
- **Sikkerhet**:
  - Helmet.js for HTTP security headers
  - Rate limiting (100 requests / 15 min)
  - CORS konfigurering
  - Audit logging for alle operasjoner
- **Database**: PostgreSQL med 5 tabeller
- **API**: 13 RESTful endpoints

### Frontend Komponenter:
- ✅ MembersLogin.vue - Innloggingsside
- ✅ MembersDashboard.vue - Dashboard med statistikk
- ✅ MembersList.vue - Medlemsliste med søk og filtrering
- ✅ AddMember.vue - Legg til nytt medlem
- ✅ EditMember.vue - Rediger medlem
- ✅ SendSMS.vue - Send SMS til valgte medlemmer
- ✅ SMSLogs.vue - SMS historikk

## API Endpoints

### Autentisering
- `POST /api/auth/login` - Logg inn med brukernavn/passord

### Medlemmer
- `GET /api/members` - Hent alle medlemmer (støtter search og active filter)
- `GET /api/members/:id` - Hent enkelt medlem
- `POST /api/members` - Opprett nytt medlem
- `PUT /api/members/:id` - Oppdater medlem
- `DELETE /api/members/:id` - Slett medlem (soft delete)

### SMS
- `POST /api/sms/send` - Send SMS til valgte medlemmer
- `GET /api/sms/logs` - Hent SMS historikk
- `GET /api/sms/stats` - Hent SMS statistikk

### System
- `GET /health` - Health check

## Database Tabeller

1. **members** - Medlemsinformasjon
2. **members_admins** - Admin brukere
3. **sms_logs** - SMS sending historikk
4. **sms_recipients** - SMS mottakere (many-to-many)
5. **audit_log** - Audit log for GDPR compliance

## Environment Variables

```env
PORT=3002
DATABASE_URL=postgresql://church_user:***@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase
JWT_SECRET=***
TWILIO_ACCOUNT_SID=your_account_sid (optional)
TWILIO_AUTH_TOKEN=your_auth_token (optional)
TWILIO_PHONE_NUMBER=+44xxx (optional)
FRONTEND_URL=http://localhost:5178
NODE_ENV=development
```

## Oppstart

```bash
# Installer dependencies (allerede gjort)
npm install

# Start serveren
npm start

# Serveren starter på port 3002
```

## Testing

```bash
# Test health endpoint
curl http://localhost:3002/health

# Test login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## SMS Oppsett med Alphanumeric Sender ID

Systemet bruker **alphanumeric sender ID** slik at medlemmer ser "DEBREIYESUS" i stedet for et tilfeldig telefonnummer!

### Konfigurasjon:

1. Registrer deg på [Twilio](https://www.twilio.com/)
2. Få Account SID, Auth Token og et telefonnummer (backup)
3. Oppdater `.env` filen:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890

   # Alphanumeric Sender ID (medlemmer ser "DEBREIYESUS")
   SMS_SENDER_ID=DEBREIYESUS
   ```
4. Restart serveren

### Hvordan det fungerer:

- **Primær metode**: Sender med alphanumeric ID "DEBREIYESUS"
- **Fallback**: Hvis alphanumeric ikke støttes, brukes telefonnummeret
- **Resultat**: Medlemmer ser profesjonell avsender: "DEBREIYESUS"

### Fordeler:

✅ Profesjonelt utseende - ser ut som offisiell kirke-SMS
✅ Ingen tilfeldig nummer - medlemmer gjenkjenner avsender
✅ Pålitelig - automatisk fallback hvis nødvendig
✅ GDPR-vennlig - kun til medlemmer med samtykke

## Sikkerhet

- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT tokens (24 timer utløp)
- ✅ Rate limiting
- ✅ CORS konfigurering
- ✅ Helmet.js security headers
- ✅ SQL injection prevention (parameterized queries)
- ✅ Audit logging
- ✅ GDPR compliance (samtykke, soft delete)

## Produksjonsdeployment

For å deploye til Azure:

1. Opprett Azure Web App
2. Konfigurer environment variables
3. Deploy koden
4. Oppdater FRONTEND_URL i .env

Se [MEDLEMSSYSTEM_IMPLEMENTASJON.md](../MEDLEMSSYSTEM_IMPLEMENTASJON.md) for fullstendig deployment guide.

## Support

For spørsmål eller problemer, kontakt admin@church.no

---

**Laget for Eritrean Orthodox Tewahdo Church, Diocese of Norway**
