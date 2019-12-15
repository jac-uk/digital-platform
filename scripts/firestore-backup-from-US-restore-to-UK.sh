#!/bin/bash
set -euxo pipefail

# Open https://console.cloud.google.com/?cloudshell=true on your browser, then
# Upload this script file to Google cloud shell and run it there

export NOW=$(date "+%Y-%m-%dT%H:%M:%S")
export NAME="firestore-$NOW"
export BACKUP_PATH="gs://application-form-e08c9-backups/$NAME"

# Backup the US Firestore to the US bucket
gcloud config set project application-form-e08c9
gcloud firestore export $BACKUP_PATH --collection-ids=applications,candidates,exercises,meta,roles
echo "backup name = $NAME"

# Copy the US Firestore backup to the UK bucket (gs://platform-production-9207d-backups/from-us/)
gsutil -m cp -R $BACKUP_PATH gs://platform-production-9207d-backups/from-us/

# Restore to UK Firestore from the UK bucket
gcloud config set project platform-production-9207d
gcloud firestore import gs://platform-production-9207d-backups/from-us/$NAME --collection-ids=applications,candidates,exercises,meta,roles
