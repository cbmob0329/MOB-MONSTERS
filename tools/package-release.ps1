$ErrorActionPreference = 'Stop'
$projectRoot = 'D:\GitHub\MOB-MONSTERS'
$releaseName = 'MOB-MONSTERS-v0023-HOME-PRODUCTION'
$releaseRoot = Join-Path $projectRoot "dist\$releaseName"
New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null
foreach ($name in @('index.html','README.md','start_server.bat','js','css','docs','assets')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $releaseRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $releaseRoot 'tools'),(Join-Path $releaseRoot 'tests') | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'tools\preview.cjs') -Destination (Join-Path $releaseRoot 'tools') -Force
foreach ($name in @('smoke.js','ui_runtime_smoke.js','asset_contract.js','production_flow.cjs','production_edges.cjs','browser-results.json','edge-results.json','screenshots')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "tests\$name") -Destination (Join-Path $releaseRoot 'tests') -Recurse -Force
}
$manifest = Get-ChildItem -LiteralPath $releaseRoot -Recurse -File | ForEach-Object {
    [PSCustomObject]@{path=$_.FullName.Substring($releaseRoot.Length+1).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $releaseRoot 'MANIFEST.json') -Encoding utf8
$zipPath = Join-Path $projectRoot "dist\$releaseName.zip"
Compress-Archive -LiteralPath $releaseRoot -DestinationPath $zipPath -Force
Get-Item -LiteralPath $zipPath | Select-Object FullName,Length
Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
