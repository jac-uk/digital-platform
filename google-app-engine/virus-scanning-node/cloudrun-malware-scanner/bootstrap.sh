#!/bin/bash

# Copyright 2024 Your Company
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

CMD="$(basename $0)"

# Log function to standardize log output
function Log {
    local SEVERITY="$1"
    local MESSAGE="$2"
    echo "{\"severity\": \"${SEVERITY}\", \"message\": \"${CMD}: ${MESSAGE}\"}"
}

# Error handling function
function trapError {
    local EXIT_CODE="$?"
    local LINE="$1"
    Log "ERROR" "Script exited with error at line ${LINE}, exit code: ${EXIT_CODE}"
    exit "${EXIT_CODE}"
}
trap 'trapError $LINENO' ERR

# Log the start of the script
Log "INFO" "Starting ClamAV update and reload process"

# Get latest definitions
Log "INFO" "Updating ClamAV virus definitions with freshclam"
if ! freshclam; then
    Log "ERROR" "Failed to update ClamAV virus definitions"
    exit 1
fi

# Reload ClamAV daemon service
Log "INFO" "Reloading clamav-daemon service"
if ! service clamav-daemon force-reload; then
    Log "ERROR" "Failed to reload clamav-daemon service"
    exit 1
fi

# Reload freshclam service
Log "INFO" "Reloading clamav-freshclam service"
if ! service clamav-freshclam force-reload; then
    Log "ERROR" "Failed to reload clamav-freshclam service"
    exit 1
fi

# Run GCS proxy server
Log "INFO" "Starting GCS proxy server"
if ! node gcs-proxy-server.js; then
    Log "ERROR" "Failed to start GCS proxy server"
    exit 1
fi

Log "INFO" "Script completed successfully"
