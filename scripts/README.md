# How to restore Firestore from backup

1. Open browser to gcloud console
https://console.cloud.google.com/?cloudshell=true

```

# set your project to the UK one
gcloud config set project platform-production-9207d

# Import (restore) from the storage bucket below. 
# In this case, the backup folder is named 2019-12-12T22%3A58%3A32.478Z
gcloud firestore import gs://platform-production-9207d-backups/firestore/2019-12-12T22%3A58%3A32.478Z

```
