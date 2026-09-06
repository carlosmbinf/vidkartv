#!/usr/bin/env bash
set -euo pipefail

AAB_PATH="${1:-}"
MANIFEST_PATH="$(find android/app/build/intermediates/merged_manifests/release -type f -name AndroidManifest.xml -print -quit 2>/dev/null || true)"
MANIFEST_PATH="${MANIFEST_PATH:-android/app/src/main/AndroidManifest.xml}"

if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo "No se encontró el manifest merged de release" >&2
  exit 1
fi

require_manifest_value() {
  local value="$1"
  if ! grep -q "$value" "$MANIFEST_PATH"; then
    echo "Falta en manifest: $value" >&2
    exit 1
  fi
}

require_manifest_feature() {
  local name="$1"
  local required="$2"
  if ! python3 - "$MANIFEST_PATH" "$name" "$required" <<'PY'
import sys
import xml.etree.ElementTree as ET

manifest_path, expected_name, expected_required = sys.argv[1:]
android = "{http://schemas.android.com/apk/res/android}"
root = ET.parse(manifest_path).getroot()
found = any(
    feature.get(f"{android}name") == expected_name
    and feature.get(f"{android}required") == expected_required
    for feature in root.findall("uses-feature")
)
raise SystemExit(0 if found else 1)
PY
  then
    echo "Falta en manifest: uses-feature $name required=$required" >&2
    exit 1
  fi
}

verify_16kb_alignment() (
  local sdk_root="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Library/Android/sdk}}"
  local readelf
  local zipalign
  local tmp_dir

  readelf="$(find "$sdk_root/ndk" -path '*/toolchains/llvm/prebuilt/*/bin/llvm-readelf' -print 2>/dev/null | sort | tail -1)"
  zipalign="$(find "$sdk_root/build-tools" -path '*/zipalign' -print 2>/dev/null | sort | tail -1)"
  if [[ -z "$readelf" || -z "$zipalign" ]]; then
    echo "No se encontraron llvm-readelf y zipalign para validar páginas de 16 KB" >&2
    exit 1
  fi

  "$zipalign" -c -P 16 4 "$AAB_PATH"

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT
  unzip -qq "$AAB_PATH" 'base/lib/arm64-v8a/*.so' 'base/lib/x86_64/*.so' -d "$tmp_dir"
  python3 - "$tmp_dir/base/lib" "$readelf" <<'PY'
import pathlib
import subprocess
import sys

root = pathlib.Path(sys.argv[1])
readelf = sys.argv[2]
failures = []
checked = 0

for library in sorted(root.glob("*/*.so")):
    output = subprocess.check_output([readelf, "-lW", str(library)], text=True)
    alignments = [
        int(line.split()[-1], 16)
        for line in output.splitlines()
        if line.lstrip().startswith("LOAD ")
    ]
    if not alignments or min(alignments) < 0x4000:
        failures.append(str(library.relative_to(root)))
    checked += 1

if checked == 0:
    print("No se encontraron librerías ELF Android de 64 bits", file=sys.stderr)
    raise SystemExit(1)
if failures:
    print("Librerías incompatibles con páginas de 16 KB:", file=sys.stderr)
    print("\n".join(f"  {name}" for name in failures), file=sys.stderr)
    raise SystemExit(1)
print(f"Compatibilidad de páginas de 16 KB verificada en {checked} librerías ELF de 64 bits.")
PY
)

grep -Eq "applicationId ['\"]com\.vidkar['\"]" android/app/build.gradle
require_manifest_feature 'android.software.leanback' 'true'
require_manifest_feature 'android.hardware.touchscreen' 'false'
require_manifest_value 'android:name="android.intent.category.LEANBACK_LAUNCHER"'
require_manifest_value 'android:banner="@drawable/vidkar_tv_banner"'
test -f android/app/src/main/res/drawable-xhdpi/vidkar_tv_banner.png || {
  echo "Falta el banner TV 320x180 en drawable-xhdpi" >&2
  exit 1
}
if grep -q 'android.intent.category.LAUNCHER' "$MANIFEST_PATH"; then
  echo "El manifest TV no debe declarar LAUNCHER móvil" >&2
  exit 1
fi

EXPO_CONFIG="$(npx expo config --type public --json)"
grep -Eq '"minSdkVersion"[[:space:]]*:[[:space:]]*(2[6-9]|30|31)' <<< "$EXPO_CONFIG" || {
  echo "No se pudo confirmar minSdk <= 31 desde la configuración Expo" >&2
  exit 1
}
grep -Eq '"targetSdkVersion"[[:space:]]*:[[:space:]]*(3[1-9]|[4-9][0-9])' <<< "$EXPO_CONFIG" || {
  echo "No se pudo confirmar target API >= 31 desde la configuración Expo" >&2
  exit 1
}

if [[ -n "${CM_BUILD_DIR:-}" ]]; then
  grep -Eq 'signingConfig signingConfigs\.release' android/app/build.gradle || {
    echo "Release no está configurado con signingConfigs.release" >&2
    exit 1
  }
else
  echo "Firma de release no exigida localmente: faltan variables/keystore Codemagic."
fi

if [[ -n "$AAB_PATH" ]]; then
  test -f "$AAB_PATH"
  jarsigner -verify -verbose -certs "$AAB_PATH" >/dev/null
  AAB_ENTRIES="$(unzip -Z1 "$AAB_PATH")"
  grep -Eq 'base/lib/(armeabi-v7a|x86)/' <<< "$AAB_ENTRIES" || {
    echo "El AAB no contiene ABI Android 32-bit" >&2
    exit 1
  }
  grep -Eq 'base/lib/(arm64-v8a|x86_64)/' <<< "$AAB_ENTRIES" || {
    echo "El AAB no contiene ABI Android 64-bit" >&2
    exit 1
  }
  verify_16kb_alignment
  echo "AAB firmado y con ABI 32/64 verificados: $AAB_PATH"
fi

echo "Validación Android TV correcta: package, Leanback, touchscreen, launcher, banner, SDK y firma configurados."
