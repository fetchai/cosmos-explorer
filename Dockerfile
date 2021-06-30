FROM node:14-buster as base

RUN apt-get update && \
    apt-get install -y libusb-1.0-0-dev && \
    apt-get clean
    
############################################################
FROM base as build

# Install meteor
RUN curl https://install.meteor.com/ | sh

WORKDIR /source/big-dipper

# Copy in the application code.

COPY . .

# Install the updates
RUN meteor npm install --save -f
# Compile app, and Create tarball with the copmiled app
RUN meteor build --allow-superuser ../output/ --architecture os.linux.x86_64 --server-only

############################################################ß
FROM base

# # Copy the tarball from build container. Then untar it
COPY --from=build /source/output/big-dipper.tar.gz /opt/big_dipper/big_dipper.tar.gz
RUN cd /opt/big_dipper && tar -xvzf big_dipper.tar.gz

# Copy entrypoint script
COPY ./entrypoints/start.sh /opt/big_dipper

WORKDIR /opt/big_dipper

ENTRYPOINT [ "bash", "/opt/big_dipper/start.sh" ]
