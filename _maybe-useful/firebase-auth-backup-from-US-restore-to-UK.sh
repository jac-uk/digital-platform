#!/bin/bash
set -euxo pipefail

# Run this from Firebase CLI on your local machine (Mac)

export NOW=$(date "+%Y-%m-%dT%H:%M:%S")
export FIREBASE_AUTH_BACKUP_FILENAME="firebase-auth-backup-$NOW.json"

# Download backup of US Firebase authentication users to your local machine in JSON
firebase use application-form-e08c9
firebase auth:export $FIREBASE_AUTH_BACKUP_FILENAME --format=JSON

# Restore Firebase authentication on UK project
firebase use platform-production-9207d
firebase auth:import --hash-algo=SCRYPT --hash-key=amFjLWFkbWluCg== --rounds=2 --mem-cost=1 $FIREBASE_AUTH_BACKUP_FILENAME
