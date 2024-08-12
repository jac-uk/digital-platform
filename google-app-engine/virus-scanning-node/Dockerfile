# Use a more recent version of Node.js
FROM node:14

# Set the working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install necessary packages and update ClamAV
RUN apt-get update && \
    apt-get install -y net-tools dos2unix clamav clamav-daemon && \
    apt-get upgrade -y clamav clamav-daemon && \
    freshclam && \
    echo "TCPSocket 3310" >> /etc/clamav/clamd.conf && \
    echo "TCPAddr 127.0.0.1" >> /etc/clamav/clamd.conf && \
    mkdir /unscanned_files && \
    npm install && \
    dos2unix bootstrap.sh

# Expose the port your application runs on (e.g., 8080)
EXPOSE 8080

# Set the command to run the application
CMD ["sh", "bootstrap.sh"]
