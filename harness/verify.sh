#!/usr/bin/env bash
# Compatibilidade com o caminho anterior da main; o executor ativo é harness.sh.
set -Eeuo pipefail
VU_COMPAT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ $# -eq 0 ]]; then
  set -- frontend
fi
exec bash "$VU_COMPAT_ROOT/harness.sh" "$@"
