# Copyright 2024 Your Company

# Use a more recent version of Node.js
FROM node:22.5.1

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:20-bookworm
WORKDIR /app

# Copy application files
COPY . /app

# Install necessary packages and update ClamAV
RUN set -x \
    && echo 'Dir::Log::Planner "/dev/null";' > /etc/apt/apt.conf.d/99disablePlannerLog \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -qqy update \
    && apt-get -qqy --no-install-recommends install \
        apt-transport-https \
        ca-certificates \
        curl \
        python3-pip \
        pipx \
        lsb-release \
        openssh-client \
        gnupg \
        jq \
        gawk \
        gettext-base \
        clamav-daemon \
        clamav-freshclam \
        python3-crcmod \
        dos2unix \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get -qqy update \
    && apt-get -qqy --no-install-recommends install google-cloud-sdk \
    && gcloud config set core/disable_usage_reporting true \
    && gcloud config set component_manager/disable_update_check true \
    && gcloud config set metrics/environment github_docker_image \
    && gcloud --version \
    && find /var/log -type f -delete \
    && npm install --omit=dev \
    && dos2unix bootstrap.sh config.json gcs-proxy-server.js \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Expose the port your application runs on (e.g., 8080)
EXPOSE 8080

# Set the command to run the application
CMD ["bash", "bootstrap.sh"]
