$ErrorActionPreference = 'Stop'
$projectRoot = 'D:\GitHub\MOB-MONSTERS'
$releaseName = 'MOB-MONSTERS-v0029-BATTLE-OPTIMIZED'
$releaseRoot = Join-Path $projectRoot "dist\$releaseName"
New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null
foreach ($name in @('index.html','README.md','start_server.bat','js','css','docs','assets','back','battle','boss','enemy','spenemy','play','skill','skill2','icon','robo','stage','takara','ef')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $releaseRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $releaseRoot 'tools'),(Join-Path $releaseRoot 'tests\screenshots') | Out-Null
Copy-Item -LiteralPath (Join-Path $projectRoot 'tools\preview.cjs') -Destination (Join-Path $releaseRoot 'tools') -Force
foreach ($name in @('smoke.js','ui_runtime_smoke.js','asset_contract.js','update929_browser.cjs','update929_contract.cjs','update929_features.cjs','update929-results.json','performance_v0029.cjs','performance-v0029.json','fixtures')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "tests\$name") -Destination (Join-Path $releaseRoot 'tests') -Recurse -Force
}
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tests\screenshots') -Filter '029-*.png' | Copy-Item -Destination (Join-Path $releaseRoot 'tests\screenshots') -Force
$manifest = Get-ChildItem -LiteralPath $releaseRoot -Recurse -File | Where-Object { $_.Name -ne 'MANIFEST.json' } | ForEach-Object {
    [PSCustomObject]@{path=$_.FullName.Substring($releaseRoot.Length+1).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $releaseRoot 'MANIFEST.json') -Encoding utf8
$zipPath = Join-Path $projectRoot "dist\$releaseName.zip"
Compress-Archive -LiteralPath $releaseRoot -DestinationPath $zipPath -Force
Get-Item -LiteralPath $zipPath | Select-Object FullName,Length
Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
