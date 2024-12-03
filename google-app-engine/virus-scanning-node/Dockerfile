# Copyright 2019 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:20-bookworm
WORKDIR /app
COPY . /app
RUN apt-get update && \
    apt-get install net-tools -y && \
    apt-get install dos2unix -y && \
    apt-get install clamav-daemon -y && \
    freshclam && \
    echo "TCPSocket 3310" >> /etc/clamav/clamd.conf && \
    echo "TCPAddr 127.0.0.1" >> /etc/clamav/clamd.conf && \
    mkdir /unscanned_files && \
    npm install && \
    dos2unix bootstrap.sh
CMD ["sh", "bootstrap.sh"]

# dos2unix converts Windows\DOS return characters (\r\n) to Unix return characters (\n)
# and is necessary if the bootstrap.sh file was last edited on a Windows machine
