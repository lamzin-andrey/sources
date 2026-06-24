#!/bin/bash
cp /opt/lampp/share/curl/curl-ca-bundle.crt /etc/ssl/certs/combined-ca-bundle.crt
cat /home/andrey/.local/share/mkcert/rootCA.pem | sudo tee -a /etc/ssl/certs/combined-ca-bundle.crt
