#!/usr/bin/env bash
source ./variables.sh
#curl -X POST "${worker_url}/api/todos" -H "authorization: ${api_key}" -H 'Content-Type: application/json' -d '{"todo":"'"${1}"'"}'
curl -X POST "${worker_url}/api/attendance?dateStr=11012022&telegramID=1202717167" -H 'Content-Type: application/json' -d '{"entry":{"name": "'"${1}"'", "status": "'"${2}"'"}}'
