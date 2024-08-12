# Start from a base Debian image
FROM debian:latest

# Install ClamAV and necessary packages
RUN apt-get update && \
    apt-get install -y clamav clamav-daemon

# Create necessary directories with appropriate permissions
RUN mkdir -p /var/log/clamav /var/run/clamav /var/lib/clamav && \
    chown -R clamav:clamav /var/log/clamav /var/run/clamav /var/lib/clamav

# Copy configuration files into the container
COPY clamd.conf /etc/clamav/clamd.conf
COPY freshclam.conf /etc/clamav/freshclam.conf

# Expose ClamAV port
EXPOSE 3310

# Start ClamAV services
CMD ["sh", "-c", "freshclam && service clamav-daemon start && tail -f /var/log/clamav/clamd.log"]
