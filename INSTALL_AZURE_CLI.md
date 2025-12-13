# Install Azure CLI (Optional)

If you prefer using command-line automation, install Azure CLI.

## Windows Installation

### Option 1: MSI Installer (Recommended)

1. Download: https://aka.ms/installazurecliwindows
2. Run the installer
3. Follow the installation wizard
4. Restart your terminal after installation
5. Verify: `az --version`

### Option 2: Winget (Windows Package Manager)

```powershell
winget install -e --id Microsoft.AzureCLI
```

### Option 3: PowerShell

```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
Remove-Item .\AzureCLI.msi
```

## After Installation

1. **Restart your terminal**
2. **Verify installation**:
   ```bash
   az --version
   ```

3. **Login to Azure**:
   ```bash
   az login
   ```
   This will open your browser for authentication.

4. **Set default subscription** (if you have multiple):
   ```bash
   az account list --output table
   az account set --subscription "Your Subscription Name"
   ```

## Quick Test

```bash
# List your resource groups
az group list --output table

# List your PostgreSQL servers
az postgres flexible-server list --output table
```

## Once Installed

Follow the CLI-based deployment guide: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## Don't Want CLI?

No problem! Use the Azure Portal guide instead: [AZURE_PORTAL_DEPLOYMENT.md](./AZURE_PORTAL_DEPLOYMENT.md)

---

**Recommendation**: The Portal method is easier for first-time deployments. Use CLI later for automation.
