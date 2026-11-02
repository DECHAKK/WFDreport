#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Import the OrangeCare demo database into Aiven MySQL and verify row counts.
#
# Usage:
#   ./import-aiven.sh [options-file] [dump-file] [database]
#
# Defaults:
#   options-file  /tmp/aiven.cnf
#   dump-file     database/exports/insurance_landing_demo_aiven_20261102.sql
#   database      defaultdb
#
# The options file must look like (chmod 600, never commit it):
#   [client]
#   host=<service>-<project>.aivencloud.com
#   port=25060
#   user=avnadmin
#   password=<your-password>
#   ssl-ca=/path/to/ca.pem
#   ssl-mode=VERIFY_CA
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

OPTIONS_FILE="${1:-/tmp/aiven.cnf}"
DUMP_FILE="${2:-${PROJECT_DIR}/database/exports/insurance_landing_demo_aiven_20261102.sql}"
TARGET_DB="${3:-defaultdb}"

if [[ ! -f "${OPTIONS_FILE}" ]]; then
  echo "ERROR: options file not found: ${OPTIONS_FILE}" >&2
  exit 1
fi

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "ERROR: dump file not found: ${DUMP_FILE}" >&2
  exit 1
fi

echo "==> 1/3 Testing the Aiven connection"
mysql --defaults-extra-file="${OPTIONS_FILE}" -e \
  "SELECT VERSION() AS server_version, CURRENT_USER() AS connected_user;"

echo "==> 2/3 Importing ${DUMP_FILE##*/} into database '${TARGET_DB}'"
mysql --defaults-extra-file="${OPTIONS_FILE}" "${TARGET_DB}" < "${DUMP_FILE}"

echo "==> 3/3 Verifying row counts"
mysql --defaults-extra-file="${OPTIONS_FILE}" "${TARGET_DB}" -t -e "
  SELECT 'calculator_settings' AS table_name, COUNT(*) AS rows_ FROM calculator_settings UNION ALL
  SELECT 'payment_factors', COUNT(*) FROM payment_factors UNION ALL
  SELECT 'whole_life_rates', COUNT(*) FROM whole_life_rates UNION ALL
  SELECT 'ci50_rates', COUNT(*) FROM ci50_rates UNION ALL
  SELECT 'demo_plans', COUNT(*) FROM demo_plans UNION ALL
  SELECT 'leads', COUNT(*) FROM leads UNION ALL
  SELECT 'index_linked_plans', COUNT(*) FROM index_linked_plans UNION ALL
  SELECT 'index_linked_plan_schedule', COUNT(*) FROM index_linked_plan_schedule UNION ALL
  SELECT 'index_linked_scenarios', COUNT(*) FROM index_linked_scenarios;"

echo "==> Done. Expected: 1 / 4 / 1200 / 200 / 3 / 3 / 2 / 50 / 4"
