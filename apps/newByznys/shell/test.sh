#! /bin/bash

apiKey="$(printenv FILIP_API_KEY)"

echo "$api"
# shelljs tenhle script spousti v rootu appky, musime vytvorit cesty
myDir="$(pwd)"

myDir+="/apps/newByznys/downloadedReports"

echo "$myDir"
touch "$myDir/ble"
echo "downloaded"

