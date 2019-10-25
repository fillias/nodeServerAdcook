Node server bezici soucasne s Apache na Adcooku v AWS instanci

instalace node
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html


routa /node na serveru routnuta do node serveru:
https://stackoverflow.com/questions/9831594/apache-and-node-js-on-the-same-server


Run node.js service with systemd (jinak ho to ukonci kdyz ho pustime z terminalu)
https://www.axllent.org/docs/view/nodejs-service-with-systemd/

pri jakekoliv zmene je treba restartnout node appku
sudo systemctl stop nodeserver.service
sudo systemctl daemon-reload
sudo systemctl start nodeserver.service

resp sudo ./restart.sh v ~/apps/node

node server je v directory ~/apps/node