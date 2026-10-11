#!/usr/bin/env bash
# Compatibilidade: o executor ativo fica em scripts/verify.sh.
set -Eeuo pipefail
VU_COMPAT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$VU_COMPAT_ROOT/scripts/verify.sh" "$@"
