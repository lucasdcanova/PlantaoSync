#!/usr/bin/env bash
set -euo pipefail

BUNDLE_ID="com.confirmaplantao.app"
DURATION_SEC=45
DEVICE_HINT=""
OUTPUT_ROOT="logs/ios"
FILTER_REGEX="com\\.confirmaplantao\\.app|CONFIRMAPLANTO|sandbox|SecTask|WebContent|WebKit|watchdog|EXC_|SIGABRT|SIGSEGV|Terminated|fatal|exception|deny\\("
NO_LAUNCH=0

print_help() {
  cat <<'EOF'
Uso:
  scripts/ios-capture-logs.sh [opcoes]

Descricao:
  Captura logs do iPhone sem abrir o app do Xcode.
  Fluxo padrao:
  1) Detecta automaticamente um iPhone conectado
  2) Inicia captura de logs
  3) Abre o app (bundle id)
  4) Aguarda alguns segundos
  5) Gera resumo com linhas criticas

Opcoes:
  --bundle-id <id>       Bundle ID do app (padrao: com.confirmaplantao.app)
  --duration <segundos>  Duracao da captura (padrao: 45)
  --device <udid|nome>   UDID ou nome do device (opcional)
  --output <pasta>       Pasta raiz de saida (padrao: logs/ios)
  --regex <filtro>       Regex para gerar arquivo filtrado/resumo
  --no-launch            Nao abre o app automaticamente
  -h, --help             Mostra esta ajuda

Exemplos:
  scripts/ios-capture-logs.sh
  scripts/ios-capture-logs.sh --duration 90
  scripts/ios-capture-logs.sh --bundle-id com.confirmaplantao.app --device "Lucas DC"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --)
      shift
      ;;
    --bundle-id)
      BUNDLE_ID="$2"
      shift 2
      ;;
    --duration)
      DURATION_SEC="$2"
      shift 2
      ;;
    --device)
      DEVICE_HINT="$2"
      shift 2
      ;;
    --output)
      OUTPUT_ROOT="$2"
      shift 2
      ;;
    --regex)
      FILTER_REGEX="$2"
      shift 2
      ;;
    --no-launch)
      NO_LAUNCH=1
      shift
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "Opcao invalida: $1" >&2
      print_help
      exit 1
      ;;
  esac
done

if ! [[ "$DURATION_SEC" =~ ^[0-9]+$ ]]; then
  echo "Erro: --duration deve ser inteiro em segundos." >&2
  exit 1
fi

for cmd in xcrun jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Erro: comando obrigatorio nao encontrado: $cmd" >&2
    exit 1
  fi
done

timestamp="$(date +'%Y%m%d-%H%M%S')"
run_dir="${OUTPUT_ROOT}/${timestamp}"
mkdir -p "$run_dir"

xcdevice_json="${run_dir}/xcdevice.json"
xcrun xcdevice list --timeout 5 > "$xcdevice_json"

pick_device_line() {
  if [[ -n "$DEVICE_HINT" ]]; then
    jq -r --arg hint "$DEVICE_HINT" '
      .[]
      | select(.simulator == false and .platform == "com.apple.platform.iphoneos" and .available == true)
      | select(.identifier == $hint or .name == $hint)
      | [.identifier, .name, .modelName, (.interface // "unknown")]
      | @tsv
    ' "$xcdevice_json" | head -n 1
    return
  fi

  local usb_line
  usb_line="$(jq -r '
    .[]
    | select(.simulator == false and .platform == "com.apple.platform.iphoneos" and .available == true and (.interface // "") == "usb")
    | [.identifier, .name, .modelName, (.interface // "unknown")]
    | @tsv
  ' "$xcdevice_json" | head -n 1)"

  if [[ -n "$usb_line" ]]; then
    printf '%s\n' "$usb_line"
    return
  fi

  jq -r '
    .[]
    | select(.simulator == false and .platform == "com.apple.platform.iphoneos" and .available == true)
    | [.identifier, .name, .modelName, (.interface // "unknown")]
    | @tsv
  ' "$xcdevice_json" | head -n 1
}

device_line="$(pick_device_line)"
if [[ -z "$device_line" ]]; then
  echo "Erro: nenhum iPhone disponivel encontrado. Conecte e desbloqueie o aparelho." >&2
  exit 1
fi

IFS=$'\t' read -r device_udid device_name device_model device_interface <<< "$device_line"

info_file="${run_dir}/session-info.txt"
{
  echo "timestamp=${timestamp}"
  echo "bundle_id=${BUNDLE_ID}"
  echo "duration_sec=${DURATION_SEC}"
  echo "device_udid=${device_udid}"
  echo "device_name=${device_name}"
  echo "device_model=${device_model}"
  echo "device_interface=${device_interface}"
  echo "filter_regex=${FILTER_REGEX}"
} > "$info_file"

echo "Captura iniciada:"
echo "  Device: ${device_name} (${device_udid})"
echo "  Bundle: ${BUNDLE_ID}"
echo "  Duracao: ${DURATION_SEC}s"
echo "  Saida: ${run_dir}"

xcrun devicectl device info details --device "$device_udid" --json-output "${run_dir}/device-details.json" >/dev/null 2>&1 || true

syslog_pid=""
app_console_pid=""
launch_status=0

cleanup() {
  if [[ -n "$syslog_pid" ]]; then
    kill -TERM "$syslog_pid" >/dev/null 2>&1 || true
    wait "$syslog_pid" >/dev/null 2>&1 || true
    syslog_pid=""
  fi

  if [[ -n "$app_console_pid" ]]; then
    pkill -TERM -P "$app_console_pid" >/dev/null 2>&1 || true
    kill -TERM "$app_console_pid" >/dev/null 2>&1 || true
    wait "$app_console_pid" >/dev/null 2>&1 || true
    app_console_pid=""
  fi
}
trap cleanup EXIT INT TERM

if command -v idevicesyslog >/dev/null 2>&1; then
  raw_syslog="${run_dir}/syslog.raw.log"
  filtered_syslog="${run_dir}/syslog.filtered.log"

  (
    idevicesyslog -u "$device_udid" 2>&1 \
      | tee "$raw_syslog" \
      | grep -Ei "$FILTER_REGEX" > "$filtered_syslog"
  ) &
  syslog_pid="$!"
  sleep 1

  if [[ "$NO_LAUNCH" -eq 0 ]]; then
    xcrun devicectl device process launch \
      --device "$device_udid" \
      --terminate-existing \
      --activate \
      "$BUNDLE_ID" > "${run_dir}/launch.log" 2>&1 || launch_status=$?
  fi
else
  echo "Aviso: 'idevicesyslog' nao encontrado. Usando fallback com 'devicectl --console'."
  echo "Para logs de sistema completos, instale: brew install libimobiledevice"

  if [[ "$NO_LAUNCH" -eq 1 ]]; then
    echo "Erro: sem idevicesyslog, use sem --no-launch para habilitar fallback com console." >&2
    exit 1
  fi

  (
    xcrun devicectl device process launch \
      --device "$device_udid" \
      --terminate-existing \
      --activate \
      --console \
      "$BUNDLE_ID" 2>&1 | tee "${run_dir}/app-console.log"
  ) &
  app_console_pid="$!"
fi

sleep "$DURATION_SEC"

xcrun devicectl device info processes --device "$device_udid" > "${run_dir}/processes.txt" 2>&1 || true

cleanup
trap - EXIT INT TERM

summary_file="${run_dir}/summary.txt"
{
  echo "Resumo da captura"
  echo "================="
  echo "Pasta: ${run_dir}"
  echo "Device: ${device_name} (${device_udid})"
  echo "Bundle: ${BUNDLE_ID}"
  echo "Duracao: ${DURATION_SEC}s"
  echo "Launch exit code: ${launch_status}"
  echo ""
  echo "Linhas criticas (mais recentes):"
  echo "--------------------------------"

  if [[ -f "${run_dir}/syslog.raw.log" ]]; then
    grep -Ei "$FILTER_REGEX" "${run_dir}/syslog.raw.log" | tail -n 200 || true
  elif [[ -f "${run_dir}/app-console.log" ]]; then
    grep -Ei "$FILTER_REGEX" "${run_dir}/app-console.log" | tail -n 200 || true
  else
    echo "Nenhum arquivo de log encontrado."
  fi
} > "$summary_file"

echo ""
echo "Captura finalizada."
echo "Arquivos:"
echo "  - ${info_file}"
[[ -f "${run_dir}/launch.log" ]] && echo "  - ${run_dir}/launch.log"
[[ -f "${run_dir}/syslog.raw.log" ]] && echo "  - ${run_dir}/syslog.raw.log"
[[ -f "${run_dir}/syslog.filtered.log" ]] && echo "  - ${run_dir}/syslog.filtered.log"
[[ -f "${run_dir}/app-console.log" ]] && echo "  - ${run_dir}/app-console.log"
echo "  - ${summary_file}"
