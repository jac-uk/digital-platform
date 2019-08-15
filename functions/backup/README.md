# Backups

Functions in this directory handle backups of the Firestore and Firebase Authentication databases.
 
Backups are fully automated: a new backup is taken once every hour, and old backups are deleted after 30 days.

## Setup dependencies

### Cloud Storage bucket

The backup functions expect a Cloud Storage bucket to exist 

Create a Cloud Storage bucket using [`gsutil`](https://cloud.google.com/storage/docs/gsutil):

```
gsutil mb -p digital-platform-staging -l europe-west2 -b on --retention 30d gs://digital-platform-staging-backups/
```

This will create a new bucket:

- Called `digital-platform-staging-backups`
- `-p`: In the project `digital-platform-staging`
- `-l`: Located in London (`europe-west2`)
- `-b on`: Using [Bucket Policy Only](https://cloud.google.com/storage/docs/bucket-policy-only) (to simplify access control)
- `--retention 30d`: 30 day [retention policy](https://cloud.google.com/storage/docs/bucket-lock) (older files are deleted automatically)

The same can also be achieved using the web console instead of `gsutil`.

### Service Account permissions

Cloud Functions defaults to using the App Engine default service account (`PROJECT_ID@appspot.gserviceaccount.com`).
More information is available in the
[Cloud Functions documentation](https://cloud.google.com/functions/docs/concepts/iam#runtime_service_account).

This service account needs additional permissions so it can perform Firestore backups:

1. Open the [IAM console](https://console.cloud.google.com/iam-admin/iam)
2. Find the App Engine default service account `PROJECT_ID@appspot.gserviceaccount.com` and click the edit icon
3. Add the role 'Cloud Datastore Import Export Admin'
