# Nginx ka official lightweight image use karein
FROM nginx:alpine

# Aap ki HTML/CSS files ko Nginx ke default web server directory me copy karein
COPY . /usr/share/nginx/html/

# Port 80 ko expose karein
EXPOSE 80
