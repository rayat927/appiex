#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --save '@react-three/fiber@^8' 'three@^0.170.0' '@react-three/drei@^9' '@splinetool/react-spline' '@splinetool/runtime' '@theatre/core' '@theatre/studio'
npm run build
echo "Review package.json and package-lock.json changes and browser performance before merging."
