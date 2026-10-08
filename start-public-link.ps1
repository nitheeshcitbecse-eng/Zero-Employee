# Starts Zero Employees behind an ngrok link your friend can open.
# Keep this window open (and the PC awake) for as long as the link should work.
# Run from PowerShell:  powershell -ExecutionPolicy Bypass -File .\start-public-link.ps1

$ErrorActionPreference = 'Stop'
$appDir = Join-Path $PSScriptRoot 'Zero_Employees'

# 1. Open the ngrok tunnel in its own window.
Start-Process ngrok -ArgumentList 'http', '3100'

# 2. Wait for ngrok to report its public URL.
$publicUrl = $null
for ($i = 0; $i -lt 30 -and -not $publicUrl; $i++) {
    Start-Sleep -Seconds 1
    try {
        $publicUrl = (Invoke-RestMethod http://127.0.0.1:4040/api/tunnels).tunnels |
            Where-Object { $_.public_url -like 'https://*' } |
            Select-Object -First 1 -ExpandProperty public_url
    } catch { }
}
if (-not $publicUrl) { throw 'ngrok did not start. Run "ngrok config add-authtoken <token>" and try again.' }

# 3. Require sign-in: the default local_trusted mode would give anyone with the link full admin access.
$env:PAPERCLIP_DEPLOYMENT_MODE = 'authenticated'
$env:PAPERCLIP_DEPLOYMENT_EXPOSURE = 'public'
$env:PAPERCLIP_PUBLIC_URL = $publicUrl
$env:PAPERCLIP_ALLOWED_HOSTNAMES = ([Uri]$publicUrl).Host
$env:PAPERCLIP_TELEMETRY_DISABLED = '1'
if (-not $env:BETTER_AUTH_SECRET) {
    $env:BETTER_AUTH_SECRET = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
}

Write-Host ''
Write-Host "  Share this link: $publicUrl" -ForegroundColor Green
Write-Host '  (the app takes a minute to start; ngrok free links show a "Visit Site" warning page first)'
Write-Host ''

# 4. Run the app in this window.
Set-Location $appDir
pnpm dev:once
