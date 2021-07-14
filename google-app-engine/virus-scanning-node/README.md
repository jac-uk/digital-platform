# Malware Scanner Service

Pre-reqs : See the tutorial that accompanies the code example at the following [link](https://cloud.google.com/solutions/automating-malware-scanning-for-documents-uploaded-to-cloud-storage)

This directory contains the code to build a pipeline that scans documents
uploaded to GCS for malware. It illustrates how to use App Engine Flex to build
such a pipeline. This service is invoked from a background function that
responds to a GCS event i.e. when a document is uploaded to a predetermined GCS
bucket. This service downloads a copy of the document into the Docker container
running in App Engine Flex and requests a ClamAV scan. Upon completion, the
service moves the scanned document apprpropriately based on the outcome i.e.
clean vs infected. It also deletes the local copy of the document.

## How to use this example

Use the tutorial to understand how to configure your Google Cloud Platform
project to use Cloud functions and App Engine Flex.

1.  Clone it from GitHub.
2.  Develop and enhance it for your use case

## Quickstart

Clone this repository

```sh
git clone https://github.com/GoogleCloudPlatform/docker-clamav-malware-scanner.git
```

Change directory to one of the example directories

Follow the walkthrough in the tutorial associated with the Nodejs example for
configuration details of Cloud platform products (Cloud Storage, Cloud Functions
and App Engine Flex) and adapt accordingly using the accompanying README for
each example.

## License

Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.




## Technical Notes

# gcloud CLI setup

- Download and install the gcloud SDK from here https://cloud.google.com/sdk/docs/install
- Inititilise the SDK by running `gcloud init`
- In the CLI, navigate to the `\google-app-engine\virus-scanning-node` folder
- Now create gcloud configs for each environment:
    - Develop:
    - `gcloud config configurations create default`
    - `gcloud config set account halcyon@judicialappointments.digital`
    - `gcloud config set project digital-platform-develop`
    - `gcloud config set compute/zone europe-west2-a`
    - `gcloud config set compute/region europe-west2`
    - Staging:
    - `gcloud config configurations create staging`
    - `gcloud config set account halcyon@judicialappointments.digital`
    - `gcloud config set project digital-platform-staging`
    - `gcloud config set compute/zone europe-west2-a`
    - `gcloud config set compute/region europe-west2`
    - Production:
    - `gcloud config configurations create production`
    - `gcloud config set account halcyon@judicialappointments.digital`
    - `gcloud config set project platform-production-9207d`
    - `gcloud config set compute/zone europe-west2-a`
    - `gcloud config set compute/region europe-west2`
- Activate the environment you want to work with, i.e.
  - `gcloud config configurations activate default`
- Check the environment have been setup correctly.
  - `gcloud config configurations list`
  - Note: It should look like this:
```
    NAME        IS_ACTIVE  ACCOUNT                               PROJECT                    COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
    default     True       halcyon@judicialappointments.digital  digital-platform-develop   europe-west2-a        europe-west2
    production  False      halcyon@judicialappointments.digital  platform-production-9207d  europe-west2-a        europe-west2
    staging     False      halcyon@judicialappointments.digital  digital-platform-staging   europe-west2-a        europe-west2
```

# Deployment

To deploy:

- In the CLI, navigate to the `\google-app-engine\virus-scanning-node` folder
- Make sure the `app.yaml` file contains the correct settings.
- To deploy to develop, run:
  - `gcloud app deploy`
- To deploy to staging, run:
  - `gcloud app deploy app-staging.yaml --project=digital-platform-staging`
- To deploy to production, run:
  - `gcloud app deploy app-production.yaml --project=platform-production-9207d`
- Note: It takes about 5 mins to deploy (to a flex environment).
- Note: I had to deploy twice to get it to install everything it needed.

You can view the App Engine instances here: https://console.cloud.google.com/appengine?serviceId=default&versionId=20210428t161124&folder=true&organizationId=376574071228&project=digital-platform-develop

SNAG - After depoyment the ClaAV service is not running...

Solution: Manually restart the ClamAV service within the Docker container by doing the following:

- Connect to the App Engine VM via SSH
- List all docker containiners
  - `docker container ls`
- Launch a terminal in the docker container for the App Engine
  - `docker exec -it gaeapp /bin/bash`
- Check what listening ports are open
  - `netstat -plnt`
  - Note: we are expecting the malware scanning service to be running on 127.0.0.1 on port 3310, but it isn't
- Restart ClamAV
  - `service clamav-daemon force-reload`
  - Note: This takes about 30 seconds
- Check listening ports again
  - `netstat -plnt`
  - Now you should see that something is listening on 127.0.01 on port 3310


# Debugging

Can view `console.log()` output for the malware scanner service here:

https://console.cloud.google.com/logs/query;query=resource.type%3D%22gae_app%22%0Aresource.labels.project_id%3D%22digital-platform-develop%22%0Aresource.labels.module_id%3D%22malware-scanner%22;cursorTimestamp=2021-04-28T17:10:14.144Z?project=digital-platform-develop&folder=true&organizationId=376574071228&query=%0A

...or by running this command:

`gcloud app logs tail -s malware-scanner`

Note: This option is slower ;)
