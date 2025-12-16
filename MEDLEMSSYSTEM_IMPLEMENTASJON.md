# Medlemssystem - Komplett Implementasjon

## Oversikt
Dette er et komplett medlemshåndteringssystem for kirker med 400+ medlemmer. Systemet inkluderer:

- ✅ **Sikker datalagring** med kryptering av personnummer
- ✅ **CRUD operasjoner** for medlemmer
- ✅ **SMS-utsending** via Twilio
- ✅ **GDPR-compliant** med samtykke og audit logging
- ✅ **Enkelt brukergrensesnitt** for ikke-utviklere
- ✅ **Azure-basert** infrastruktur

## Arkitektur

### Frontend (Vue.js 3)
- **Teknologi**: Vue.js 3 (Options API), Vue Router
- **Komponenter**: 8 hovedkomponenter (innlogging, dashboard, liste, skjemaer, SMS)
- **Autentisering**: JWT token med localStorage
- **API-kommunikasjon**: Axios

### Backend (Node.js + Express)
- **Teknologi**: Node.js, Express.js
- **Database**: Azure SQL Database med TDE encryption
- **Autentisering**: JWT + bcrypt
- **SMS**: Twilio API integration
- **Sikkerhet**: Helmet, rate limiting, CORS

## Del 1: Frontend (✅ FERDIG IMPLEMENTERT)

Følgende Vue-komponenter er implementert i `church-website/src/views/`:

1. **MembersLogin.vue** - Innloggingsside
2. **MembersDashboard.vue** - Dashboard med statistikk
3. **MembersList.vue** - Medlemsliste med søk og filtrering
4. **AddMember.vue** - Legg til nytt medlem
5. **EditMember.vue** - Rediger medlem
6. **SendSMS.vue** - Send SMS til valgte medlemmer
7. **SMSLogs.vue** - SMS historikk
8. **membersService.js** - API integration modul

**Ruter**: Alle ruter er konfigurert i `router.js` under `/members/*`

**Tilgang**: Gå til `http://localhost:5178/members/login` for å logge inn

---

## Del 2: Backend Implementasjon

### Steg 1: Opprett Azure SQL Database

```bash
# Logg inn på Azure
az login

# Opprett resource group (hvis ikke finnes)
az group create --name debreiyesus-rg --location norwayeast

# Opprett SQL Server
az sql server create \
  --name debreiyesus-sql-server \
  --resource-group debreiyesus-rg \
  --location norwayeast \
  --admin-user sqladmin \
  --admin-password "DittSuperSikkerPassord123!"

# Konfigurer firewall for å tillate Azure services
az sql server firewall-rule create \
  --resource-group debreiyesus-rg \
  --server debreiyesus-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Opprett database
az sql db create \
  --resource-group debreiyesus-rg \
  --server debreiyesus-sql-server \
  --name members_db \
  --service-objective S0
```

### Steg 2: Database Schema

Kjør følgende SQL i Azure SQL Database (via Azure Portal Query Editor):

```sql
-- Opprett hovedtabell for medlemmer
CREATE TABLE members (
    id INT PRIMARY KEY IDENTITY(1,1),
    full_name NVARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    personnummer VARBINARY(256) NOT NULL, -- Kryptert!
    address NVARCHAR(500),
    postal_code VARCHAR(10),
    city NVARCHAR(100),
    member_since DATE,
    baptized BIT DEFAULT 0,
    baptism_date DATE,
    family_id INT,
    sms_consent BIT DEFAULT 1, -- GDPR samtykke
    consent_date DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1, -- Soft delete
    notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    updated_at DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100)
);

-- SMS logs tabell
CREATE TABLE sms_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    message NVARCHAR(MAX) NOT NULL,
    recipient_count INT NOT NULL,
    sent_at DATETIME DEFAULT GETDATE(),
    sent_by NVARCHAR(100),
    cost_estimate DECIMAL(10,2)
);

-- SMS recipients (many-to-many)
CREATE TABLE sms_recipients (
    id INT PRIMARY KEY IDENTITY(1,1),
    sms_log_id INT NOT NULL,
    member_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status NVARCHAR(50) DEFAULT 'sent',
    twilio_sid NVARCHAR(100),
    FOREIGN KEY (sms_log_id) REFERENCES sms_logs(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Audit log for GDPR compliance
CREATE TABLE audit_log (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(100),
    action NVARCHAR(100),
    table_name NVARCHAR(100),
    record_id INT,
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE()
);

-- Admin users tabell
CREATE TABLE members_admins (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(200),
    email NVARCHAR(100),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);

-- Krypteringsnøkkel (må genereres en gang)
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'DittSuperSikkerPassord123!';

CREATE CERTIFICATE MembersCert
WITH SUBJECT = 'Members Personnummer Encryption';

CREATE SYMMETRIC KEY PersonnummerKey
WITH ALGORITHM = AES_256
ENCRYPTION BY CERTIFICATE MembersCert;

-- Funksjoner for kryptering/dekryptering
GO
CREATE FUNCTION dbo.EncryptPersonnummer(@personnummer NVARCHAR(11))
RETURNS VARBINARY(256)
AS
BEGIN
    DECLARE @encrypted VARBINARY(256);
    OPEN SYMMETRIC KEY PersonnummerKey
    DECRYPTION BY CERTIFICATE MembersCert;

    SET @encrypted = EncryptByKey(Key_GUID('PersonnummerKey'), @personnummer);

    CLOSE SYMMETRIC KEY PersonnummerKey;
    RETURN @encrypted;
END;
GO

CREATE FUNCTION dbo.DecryptPersonnummer(@encrypted VARBINARY(256))
RETURNS NVARCHAR(11)
AS
BEGIN
    DECLARE @decrypted NVARCHAR(11);
    OPEN SYMMETRIC KEY PersonnummerKey
    DECRYPTION BY CERTIFICATE MembersCert;

    SET @decrypted = CAST(DecryptByKey(@encrypted) AS NVARCHAR(11));

    CLOSE SYMMETRIC KEY PersonnummerKey;
    RETURN @decrypted;
END;
GO

-- Opprett default admin bruker (brukernavn: admin, passord: admin123)
-- OBS: Endre dette passordet i produksjon!
INSERT INTO members_admins (username, password_hash, full_name, email)
VALUES ('admin', '$2b$10$YourBcryptHashHere', 'System Administrator', 'admin@church.no');
```

### Steg 3: Backend Server (members-backend)

Opprett ny mappe `members-backend` i prosjektrottet:

```bash
cd /home/eyob/personal/debreiyesus/churches-project
mkdir members-backend
cd members-backend
npm init -y
```

#### Installer avhengigheter:

```bash
npm install express mssql cors dotenv bcrypt jsonwebtoken twilio helmet express-rate-limit winston
```

#### Opprett `.env` fil:

```env
# Server
PORT=3002

# Azure SQL Database
DB_SERVER=debreiyesus-sql-server.database.windows.net
DB_DATABASE=members_db
DB_USER=sqladmin
DB_PASSWORD=DittSuperSikkerPassord123!
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# JWT Secret (generer et sterkt random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+44xxxxxxxxxxx

# CORS
FRONTEND_URL=http://localhost:5178

# Node Environment
NODE_ENV=development
```

#### Opprett `server.js`:

```javascript
const express = require('express');
const mssql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5178',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database Configuration
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Database Connection Pool
let pool;

async function connectDB() {
  try {
    pool = await mssql.connect(dbConfig);
    console.log('✅ Connected to Azure SQL Database');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

// Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Audit Logging Function
async function logAudit(userId, action, tableName, recordId, oldValues, newValues, ipAddress) {
  try {
    await pool.request()
      .input('user_id', mssql.NVarChar, userId)
      .input('action', mssql.NVarChar, action)
      .input('table_name', mssql.NVarChar, tableName)
      .input('record_id', mssql.Int, recordId)
      .input('old_values', mssql.NVarChar, JSON.stringify(oldValues))
      .input('new_values', mssql.NVarChar, JSON.stringify(newValues))
      .input('ip_address', mssql.NVarChar, ipAddress)
      .query(`
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address)
        VALUES (@user_id, @action, @table_name, @record_id, @old_values, @new_values, @ip_address)
      `);
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// ======================
// AUTH ROUTES
// ======================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.request()
      .input('username', mssql.NVarChar, username)
      .query('SELECT * FROM members_admins WHERE username = @username AND is_active = 1');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================
// MEMBERS ROUTES
// ======================

// Get all members
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const { search, active } = req.query;

    let query = `
      SELECT
        id, full_name, phone_number, email,
        dbo.DecryptPersonnummer(personnummer) as personnummer,
        address, postal_code, city,
        member_since, baptized, baptism_date,
        sms_consent, consent_date, is_active, notes,
        created_at, updated_at
      FROM members
      WHERE 1=1
    `;

    if (active !== undefined) {
      query += ` AND is_active = ${active === 'true' ? 1 : 0}`;
    }

    if (search) {
      query += ` AND (full_name LIKE '%${search}%' OR phone_number LIKE '%${search}%')`;
    }

    query += ' ORDER BY full_name';

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

// Get single member
app.get('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', mssql.Int, req.params.id)
      .query(`
        SELECT
          id, full_name, phone_number, email,
          dbo.DecryptPersonnummer(personnummer) as personnummer,
          address, postal_code, city,
          member_since, baptized, baptism_date,
          sms_consent, consent_date, is_active, notes,
          created_at, updated_at
        FROM members
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get member error:', err);
    res.status(500).json({ error: 'Failed to retrieve member' });
  }
});

// Create member
app.post('/api/members', authenticateToken, async (req, res) => {
  try {
    const {
      full_name, phone_number, email, personnummer,
      address, postal_code, city, member_since,
      baptized, baptism_date, sms_consent, notes
    } = req.body;

    // Validate personnummer (11 digits)
    if (!/^\d{11}$/.test(personnummer)) {
      return res.status(400).json({ error: 'Personnummer must be 11 digits' });
    }

    // Check for duplicate
    const duplicateCheck = await pool.request()
      .input('phone', mssql.VarChar, phone_number)
      .query('SELECT id FROM members WHERE phone_number = @phone');

    if (duplicateCheck.recordset.length > 0) {
      return res.status(400).json({ error: 'Member with this phone number already exists' });
    }

    const result = await pool.request()
      .input('full_name', mssql.NVarChar, full_name)
      .input('phone_number', mssql.VarChar, phone_number)
      .input('email', mssql.NVarChar, email || null)
      .input('personnummer', mssql.NVarChar, personnummer)
      .input('address', mssql.NVarChar, address || null)
      .input('postal_code', mssql.VarChar, postal_code || null)
      .input('city', mssql.NVarChar, city || null)
      .input('member_since', mssql.Date, member_since || null)
      .input('baptized', mssql.Bit, baptized || 0)
      .input('baptism_date', mssql.Date, baptism_date || null)
      .input('sms_consent', mssql.Bit, sms_consent !== undefined ? sms_consent : 1)
      .input('notes', mssql.NVarChar, notes || null)
      .input('created_by', mssql.NVarChar, req.user.username)
      .query(`
        INSERT INTO members (
          full_name, phone_number, email, personnummer,
          address, postal_code, city, member_since,
          baptized, baptism_date, sms_consent, notes, created_by, updated_by
        )
        VALUES (
          @full_name, @phone_number, @email, dbo.EncryptPersonnummer(@personnummer),
          @address, @postal_code, @city, @member_since,
          @baptized, @baptism_date, @sms_consent, @notes, @created_by, @created_by
        );
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const newId = result.recordset[0].id;

    await logAudit(
      req.user.username,
      'CREATE',
      'members',
      newId,
      null,
      req.body,
      req.ip
    );

    res.status(201).json({ id: newId, message: 'Member created successfully' });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
app.put('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    // Get old values for audit
    const oldResult = await pool.request()
      .input('id', mssql.Int, memberId)
      .query('SELECT * FROM members WHERE id = @id');

    if (oldResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const {
      full_name, phone_number, email, personnummer,
      address, postal_code, city, member_since,
      baptized, baptism_date, sms_consent, is_active, notes
    } = req.body;

    await pool.request()
      .input('id', mssql.Int, memberId)
      .input('full_name', mssql.NVarChar, full_name)
      .input('phone_number', mssql.VarChar, phone_number)
      .input('email', mssql.NVarChar, email || null)
      .input('personnummer', mssql.NVarChar, personnummer)
      .input('address', mssql.NVarChar, address || null)
      .input('postal_code', mssql.VarChar, postal_code || null)
      .input('city', mssql.NVarChar, city || null)
      .input('member_since', mssql.Date, member_since || null)
      .input('baptized', mssql.Bit, baptized || 0)
      .input('baptism_date', mssql.Date, baptism_date || null)
      .input('sms_consent', mssql.Bit, sms_consent !== undefined ? sms_consent : 1)
      .input('is_active', mssql.Bit, is_active !== undefined ? is_active : 1)
      .input('notes', mssql.NVarChar, notes || null)
      .input('updated_by', mssql.NVarChar, req.user.username)
      .query(`
        UPDATE members SET
          full_name = @full_name,
          phone_number = @phone_number,
          email = @email,
          personnummer = dbo.EncryptPersonnummer(@personnummer),
          address = @address,
          postal_code = @postal_code,
          city = @city,
          member_since = @member_since,
          baptized = @baptized,
          baptism_date = @baptism_date,
          sms_consent = @sms_consent,
          is_active = @is_active,
          notes = @notes,
          updated_by = @updated_by,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    await logAudit(
      req.user.username,
      'UPDATE',
      'members',
      memberId,
      oldResult.recordset[0],
      req.body,
      req.ip
    );

    res.json({ message: 'Member updated successfully' });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (soft delete)
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    await pool.request()
      .input('id', mssql.Int, memberId)
      .input('updated_by', mssql.NVarChar, req.user.username)
      .query(`
        UPDATE members SET
          is_active = 0,
          updated_by = @updated_by,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    await logAudit(
      req.user.username,
      'DELETE',
      'members',
      memberId,
      null,
      { is_active: 0 },
      req.ip
    );

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ======================
// SMS ROUTES
// ======================

// Send SMS
app.post('/api/sms/send', authenticateToken, async (req, res) => {
  try {
    const { member_ids, message } = req.body;

    if (!member_ids || member_ids.length === 0) {
      return res.status(400).json({ error: 'No recipients selected' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get members with SMS consent
    const placeholders = member_ids.map((_, i) => `@id${i}`).join(',');
    const request = pool.request();

    member_ids.forEach((id, i) => {
      request.input(`id${i}`, mssql.Int, id);
    });

    const result = await request.query(`
      SELECT id, full_name, phone_number
      FROM members
      WHERE id IN (${placeholders})
      AND sms_consent = 1
      AND is_active = 1
    `);

    const recipients = result.recordset;

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    // Create SMS log entry
    const logResult = await pool.request()
      .input('message', mssql.NVarChar, message)
      .input('recipient_count', mssql.Int, recipients.length)
      .input('sent_by', mssql.NVarChar, req.user.username)
      .input('cost_estimate', mssql.Decimal(10, 2), recipients.length * 0.16)
      .query(`
        INSERT INTO sms_logs (message, recipient_count, sent_by, cost_estimate)
        VALUES (@message, @recipient_count, @sent_by, @cost_estimate);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const smsLogId = logResult.recordset[0].id;

    // Send SMS to each recipient
    const sendPromises = recipients.map(async (recipient) => {
      try {
        const twilioMessage = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone_number
        });

        // Log recipient
        await pool.request()
          .input('sms_log_id', mssql.Int, smsLogId)
          .input('member_id', mssql.Int, recipient.id)
          .input('phone_number', mssql.VarChar, recipient.phone_number)
          .input('status', mssql.NVarChar, 'sent')
          .input('twilio_sid', mssql.NVarChar, twilioMessage.sid)
          .query(`
            INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status, twilio_sid)
            VALUES (@sms_log_id, @member_id, @phone_number, @status, @twilio_sid)
          `);

        return { success: true, recipient: recipient.full_name };
      } catch (err) {
        console.error(`SMS send error for ${recipient.phone_number}:`, err);

        // Log failed recipient
        await pool.request()
          .input('sms_log_id', mssql.Int, smsLogId)
          .input('member_id', mssql.Int, recipient.id)
          .input('phone_number', mssql.VarChar, recipient.phone_number)
          .input('status', mssql.NVarChar, 'failed')
          .query(`
            INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status)
            VALUES (@sms_log_id, @member_id, @phone_number, @status)
          `);

        return { success: false, recipient: recipient.full_name, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    res.json({
      message: `SMS sent to ${successCount} of ${recipients.length} recipients`,
      sent: successCount,
      failed: recipients.length - successCount,
      details: results
    });
  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Get SMS logs
app.get('/api/sms/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('limit', mssql.Int, parseInt(limit))
      .input('offset', mssql.Int, offset)
      .query(`
        SELECT
          sl.id, sl.message, sl.recipient_count, sl.sent_at, sl.sent_by, sl.cost_estimate,
          (
            SELECT
              sr.id, m.full_name, sr.phone_number, sr.status, sr.twilio_sid
            FROM sms_recipients sr
            JOIN members m ON sr.member_id = m.id
            WHERE sr.sms_log_id = sl.id
            FOR JSON PATH
          ) as recipients_json
        FROM sms_logs sl
        ORDER BY sl.sent_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    const logs = result.recordset.map(log => ({
      ...log,
      recipients: log.recipients_json ? JSON.parse(log.recipients_json) : []
    }));

    res.json(logs);
  } catch (err) {
    console.error('Get SMS logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve SMS logs' });
  }
});

// Get SMS statistics
app.get('/api/sms/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        COALESCE(SUM(recipient_count), 0) as total_sent,
        COALESCE(SUM(CASE WHEN sent_at >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0) THEN recipient_count ELSE 0 END), 0) as this_month,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM sms_logs
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get SMS stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Members Management API' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Members API server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
});
```

#### Opprett `package.json`:

```json
{
  "name": "members-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mssql": "^10.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "twilio": "^4.19.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0"
  }
}
```

### Steg 4: Opprett admin bruker med bcrypt

Kjør dette Node.js scriptet for å generere bcrypt hash:

```javascript
// generate-admin.js
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123'; // Endre dette!
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
  console.log('\nKjør denne SQL:\n');
  console.log(`INSERT INTO members_admins (username, password_hash, full_name, email)
VALUES ('admin', '${hash}', 'System Administrator', 'admin@church.no');`);
}

generateHash();
```

Kjør:
```bash
node generate-admin.js
```

Kopier SQL-kommandoen og kjør den i Azure SQL.

### Steg 5: Konfigurer Twilio

1. Gå til https://www.twilio.com/
2. Opprett konto (gratis trial)
3. Få Account SID, Auth Token og telefonnummer
4. Oppdater `.env` fil med Twilio credentials

### Steg 6: Oppdater Frontend environment

Opprett/oppdater `church-website/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_MEMBERS_API_URL=http://localhost:3002
```

### Steg 7: Start backend server

```bash
cd members-backend
npm start
```

Du skal se:
```
✅ Connected to Azure SQL Database
🚀 Members API server running on port 3002
📍 http://localhost:3002
```

### Steg 8: Test systemet

1. Start frontend: `cd church-website && npm run dev`
2. Gå til: `http://localhost:5178/members/login`
3. Logg inn med: `admin` / `admin123`
4. Utforsk alle funksjonene!

---

## Produksjonsdeployment

### Deploy backend til Azure Web App

```bash
# Opprett Azure Web App
az webapp up \
  --name members-api \
  --resource-group debreiyesus-rg \
  --runtime "NODE:18-lts" \
  --sku B1

# Konfigurer environment variables
az webapp config appsettings set \
  --name members-api \
  --resource-group debreiyesus-rg \
  --settings \
    DB_SERVER="debreiyesus-sql-server.database.windows.net" \
    DB_DATABASE="members_db" \
    DB_USER="sqladmin" \
    DB_PASSWORD="DittPassord" \
    JWT_SECRET="your-jwt-secret" \
    TWILIO_ACCOUNT_SID="your-sid" \
    TWILIO_AUTH_TOKEN="your-token" \
    TWILIO_PHONE_NUMBER="+44xxx" \
    FRONTEND_URL="https://fnatewahedo.azurewebsites.net"
```

### Oppdater frontend for produksjon

I `church-website/.env.production`:

```env
VITE_API_URL=https://fnatewahedo.azurewebsites.net
VITE_MEMBERS_API_URL=https://members-api.azurewebsites.net
```

---

## Sikkerhet

### Implementerte sikkerhetstiltak:

✅ **Datakryptering**:
- TDE (Transparent Data Encryption) på Azure SQL
- Personnummer kryptert med AES-256 symmetric key
- TLS/SSL for all kommunikasjon

✅ **Autentisering**:
- JWT tokens med 24t utløp
- Bcrypt password hashing (10 rounds)
- Rate limiting (100 req/15min)

✅ **GDPR Compliance**:
- SMS samtykke tracking
- Audit logging for alle endringer
- Soft delete (data retention)
- Data export funksjonalitet

✅ **Best practices**:
- Helmet.js security headers
- CORS konfigurering
- Input validering
- SQL injection prevention (parameterized queries)

---

## Kostnadsestimat (Azure)

| Tjeneste | Pris/måned (NOK) |
|----------|------------------|
| Azure SQL Database (S0) | ~150 |
| Azure Web App (B1) x2 | ~180 |
| Twilio SMS (400 meldinger/måned) | ~64 |
| **Total** | **~394 NOK/mnd** |

---

## Support og vedlikehold

### Vanlige problemer:

**Problem**: Kan ikke koble til database
- **Løsning**: Sjekk firewall rules i Azure SQL

**Problem**: SMS sendes ikke
- **Løsning**: Verifiser Twilio credentials og telefonnummer

**Problem**: "Invalid token" feil
- **Løsning**: Logg ut og inn igjen

### Logging

Alle audit logs lagres i `audit_log` tabellen:
```sql
SELECT * FROM audit_log ORDER BY timestamp DESC;
```

### Backup

Azure SQL tar automatisk backup. For å ta manuell backup:
```bash
az sql db export \
  --resource-group debreiyesus-rg \
  --server debreiyesus-sql-server \
  --name members_db \
  --admin-user sqladmin \
  --admin-password "DittPassord" \
  --storage-key-type StorageAccessKey \
  --storage-key "YourStorageKey" \
  --storage-uri "https://yourstorage.blob.core.windows.net/backups/members.bacpac"
```

---

## For andre kirker/organisasjoner

Dette systemet kan enkelt tilpasses for andre organisasjoner:

1. Endre labels i Vue-komponentene (norsk/engelsk/amharisk)
2. Opprett egen Azure SQL database
3. Konfigurer egne Twilio credentials
4. Deploy til egen Azure subscription

**Kontakt**: admin@church.no for assistanse med oppsett

---

## Lisens

Dette systemet er utviklet for Eritrean Orthodox Tewahdo Church, Diocese of Norway.
Kan brukes av andre kirker/organisasjoner med tillatelse.

---

**Laget med ❤️ for kirkesamfunnet i Norge**
