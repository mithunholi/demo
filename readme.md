#Sample Webviewer

This is a simple webviewer than monitors the state of the simulation using a client side javascript mqtt library, paho.mqtt, that communicates with the broker using websockets.  

NOTE: https://github.com/eclipse/mosquitto/issues/336
Latest version of MQTT breaks websocket support. Should use docker container with older version of mosquitto.

1.4.10  doesn't work

1.4.8   works

##Docker Run Command
```bash
sudo docker run -it -p 1883:1883 -p 9001:9001 -v ~/Development/bg_smarthome/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto:1.4.8
```

Where the local path, i.e: ~/Development/bg_smarthome/mosquitto/mosquitto.conf
above corresponds to the location you have stored your modified mosquitto.conf file. 