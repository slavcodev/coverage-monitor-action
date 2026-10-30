#!/usr/bin/env bash
# scripts/update-v1.sh
set -euo pipefail

git fetch --tags --force
latest=$(git tag -l '1.*.*' --sort=-v:refname | grep -v -- '-' | head -n1)
echo "Pointing v1 to $latest"
git tag -fa v1 "${latest}^{}" -m "Update v1 to $latest"
git push origin v1 --force
