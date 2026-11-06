$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
npm install --save '@react-three/fiber@^8' 'three@^0.170.0' '@react-three/drei@^9' '@splinetool/react-spline' '@splinetool/runtime' '@theatre/core' '@theatre/studio'
if ($LASTEXITCODE -ne 0) { throw 'npm install failed. Check dependency compatibility.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed. Do not deploy.' }
Write-Host 'Review package.json and package-lock.json changes before merging.'
