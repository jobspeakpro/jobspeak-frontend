param(
    [string]$Command
)

$password = "Word@Word+1234"
$host_ip = "72.62.171.225"

# Create expect-like script using PowerShell
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.Arguments = "-o StrictHostKeyChecking=no root@$host_ip `"$Command`""
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $psi
$process.Start() | Out-Null

# Wait a moment for password prompt
Start-Sleep -Milliseconds 500

# Send password
$process.StandardInput.WriteLine($password)
$process.StandardInput.Close()

# Read output
$output = $process.StandardOutput.ReadToEnd()
$error_output = $process.StandardError.ReadToEnd()

$process.WaitForExit()

Write-Output $output
if ($error_output) {
    Write-Error $error_output
}

exit $process.ExitCode
