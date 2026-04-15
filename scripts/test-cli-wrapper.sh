#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WRAPPER_SOURCE="$PROJECT_ROOT/scripts/cli/onote"

TMPDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

mkdir -p "$TMPDIR/ONote.app/Contents/Resources/bin" "$TMPDIR/link-bin"
cp "$WRAPPER_SOURCE" "$TMPDIR/ONote.app/Contents/Resources/bin/onote"
chmod +x "$TMPDIR/ONote.app/Contents/Resources/bin/onote"

cat > "$TMPDIR/ONote.app/Contents/Resources/bin/onote-cli" <<'EOF'
#!/bin/bash
if [ "$1" = "--help" ]; then
  echo "onote-cli help stub"
else
  echo "onote-cli stub: $*"
fi
EOF
chmod +x "$TMPDIR/ONote.app/Contents/Resources/bin/onote-cli"

# 模拟安装到 PATH：/usr/local/bin/onote -> .../Resources/bin/onote
ln -sf "$TMPDIR/ONote.app/Contents/Resources/bin/onote" "$TMPDIR/link-bin/onote"

OUTPUT="$($TMPDIR/link-bin/onote --help)"
if [ "$OUTPUT" != "onote-cli help stub" ]; then
  echo "Unexpected output: $OUTPUT" >&2
  exit 1
fi

echo "CLI wrapper symlink resolution test passed"
