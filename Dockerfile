FROM ubuntu
WORKDIR /root
ADD icb-web-registry .
ADD delete_docker_registry_image /usr/local/bin/
RUN chmod a+x /usr/local/bin/delete_docker_registry_image
RUN chmod +x icb-web-registry
EXPOSE 8080
