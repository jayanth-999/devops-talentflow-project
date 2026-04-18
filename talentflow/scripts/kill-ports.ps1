$ports = @(8001, 8080, 8002)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Write-Host "Killed process on port $port"
    }
    else {
        Write-Host "No process found on port $port"
    }
}
