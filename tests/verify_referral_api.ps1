$ErrorActionPreference = "Stop"
$BaseUrl = "https://jobspeak-backend-production.up.railway.app"

function Get-RandomEmail {
    return "ref_test_$((Get-Date).Ticks)@mailinator.com"
}

function Signup-User {
    param ($Email, $Password)
    $Body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $Response = Invoke-RestMethod -Uri "$BaseUrl/auth/signup" -Method Post -Body $Body -ContentType "application/json"
        return $Response
    } catch {
        Write-Host "Signup Failed for $Email : $($_.Exception.Message)"
        return $null
    }
}

function Login-User {
    param ($Email, $Password)
    $Body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $Response = Invoke-RestMethod -Uri "$BaseUrl/auth/signin" -Method Post -Body $Body -ContentType "application/json"
        return $Response
    } catch {
        Write-Host "Login Failed for $Email : $($_.Exception.Message)"
        return $null
    }
}

Write-Host "=== STARTING API VERIFICATION ==="

# 1. Setup Referrer
$RefEmail = Get-RandomEmail
$Password = "Password123!"
Write-Host "`n[1] Creating Referrer: $RefEmail"

$RefSignup = Signup-User -Email $RefEmail -Password $Password
# Login to get token
$RefLogin = Login-User -Email $RefEmail -Password $Password
$RefToken = $RefLogin.session.access_token

if (-not $RefToken) { Write-Error "Failed to get Referrer Token"; exit }

# Get Referral Code
try {
    $Headers = @{ Authorization = "Bearer $RefToken" }
    $RefData = Invoke-RestMethod -Uri "$BaseUrl/api/referrals/me" -Method Get -Headers $Headers
    $RefCode = $RefData.code
    Write-Host "Referral Code: $RefCode"
} catch {
    Write-Error "Failed to get referral code: $($_.Exception.Message)"
}

# 2. Run 3 Referrals
for ($i = 1; $i -le 3; $i++) {
    $UserEmail = Get-RandomEmail
    Write-Host "`n[Run $i] Creating User: $UserEmail"
    
    # Signup
    $UserSignup = Signup-User -Email $UserEmail -Password $Password
    
    # Login
    $UserLogin = Login-User -Email $UserEmail -Password $Password
    $UserToken = $UserLogin.session.access_token
    
    if ($UserToken) {
        # Claim
        Write-Host "   Claiming Code..."
        try {
            $UserHeaders = @{ Authorization = "Bearer $UserToken" }
            $ClaimBody = @{ referralCode = $RefCode } | ConvertTo-Json
            $ClaimRes = Invoke-RestMethod -Uri "$BaseUrl/api/referrals/claim" -Method Post -Headers $UserHeaders -Body $ClaimBody -ContentType "application/json"
            Write-Host "   Success! ReferrerId: $($ClaimRes.referrerId)"
        } catch {
            Write-Host "   Claim Failed: $($_.Exception.Message)"
            # Print response body if possible
             try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                Write-Host "   Details: $($reader.ReadToEnd())"
            } catch {}
        }
    }
}

# 3. Verify History
Write-Host "`n[Final] Verifying History for Referrer..."
try {
    $History = Invoke-RestMethod -Uri "$BaseUrl/api/referrals/history" -Method Get -Headers $Headers
    Write-Host "Found $($History.history.Count) history items:"
    $History.history | Format-Table referred_email, status, reward_status, created_at -AutoSize
} catch {
    Write-Error "Failed to fetch history: $($_.Exception.Message)"
}

Write-Host "`n=== VERIFICATION COMPLETE ==="
