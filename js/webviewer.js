//Init MQTT connection to solver interface

//List available actuators and their possible states
// Create a client instance: Broker, Port, Websocket Path, Client ID
clientID = "webview";
host = "192.168.1.30";
port = Number(9001);
var object_table
var action_table
var grounded_actions
 //Using the HiveMQ public Broker, with a random client Id
client = new Paho.MQTT.Client(host, port, clientID);

 //Gets  called if the websocket/mqtt connection gets disconnected for any reason
 client.onConnectionLost = function (responseObject) {
     //Depending on your scenario you could implement a reconnect logic here
    console.log("connection lost: " + responseObject.errorMessage);
    // console.log("Connection Lost...")
    client.connect(options)
};

 //Gets called whenever you receive a message for your subscriptions
 client.onMessageArrived = function (message) {
     //Do something with the push message you received
     console.log("GOT MESSAGE")
     console.log(message.payloadString)
     if(message.destinationName == "view/init"){
        object_data = JSON.parse(message.payloadString);
        console.log(object_data)
        process_init_message(object_data)
                
        //Handle Update Messages
     }
     else if(message.destinationName == "view/change"){
        data_object = JSON.parse(message.payloadString)
        for(ob in data_object){
            obj = data_object[ob]
            object_name = obj["name"]
        if(object_table != null){
            console.log("updating table");
            console.log(obj);
        object_table.rows().every(function(rowIdx, tableLoop, rowLoop){
                var d = this.data();
                if(d[0]==object_name){
                    table_props = ""
                    props = obj["properties"]
                    for (var prop in props){
                        if(prop != "bounds"){
                            table_props+= String(prop) + " : " + String(props[prop]) + "<br>"
                        } else {
                            table_props+= String(prop) + " : " + location_to_string(props[prop]) + "<br>"
                        }
                    }
                    d[2] = table_props;
                    locations = obj["location"];
                    d[3] = location_to_string(locations)
                    this.data(d)                    
                    object_table.draw()
                }
        })
        }}
    }else if(message.destinationName == "view/grounded"){
        grounded_state = JSON.parse(message.payloadString)
        grounded_actions = grounded_state["actions"]
        // console.log(grounded_actions)
        process_grounded_actions();
    }
    //  $('#messages').append('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
 };

function location_to_string(location){
    result = ""
    coords = ["x", "y", "z"]
    for(var i=0; i<3; i++){
        result += coords[i] +": "+ String(locations[coords[i]]).substring(0,5) + "<br>"
    }
    return result
}

function process_grounded_actions(){
    //Use DataTables to populate the table
        name_index = 0
        execute_index = 1
        object_column_headers = [
            { title: "action" },
            { title: "execute action"}
        ]
        
        action_table = $('#action_table').DataTable({
            columns: object_column_headers,
            "bPaginate": false,
            "bInfo" : false
        });

        action_table.clear()

        grounded_actions.forEach(function(action){
            console.log(action)
            action_string = action["grounded_action_string"]
            action_button = '<button onclick=\"invoke_action(\'' +action_string+ '\');">'+action["name"] +'</button>';
            action_table.row.add([action_string, action_button])
            console.log(action_string)
    });

        action_table.draw()
}

function process_init_message(objects){
        //Use DataTables to populate the table
        name_index = 0
        type_index = 1
        properties_index = 2
        location_index = 3
        object_column_headers = [
            { title: "name" },
            { title: "type"},
            { title: "properties"}, 
            { title: "location"}
        ]
    
        
        object_table = $('#object_table').DataTable({
            columns: object_column_headers,
            "bPaginate": false,
            "bInfo" : false
        });

        object_table.clear()
        for (var obj in object_data) {
            console.log(object_data[obj])
            if (object_data.hasOwnProperty(obj)) {
                object_list = [];
                // table.row.add(actuator);
                object_column_headers.forEach(function(key){
                    key = key["title"]
                    if(key == "name"){
                        name = object_data[obj][key]
                        // button = "<button onclick=\"request_available_actions(\'"+ name +
                        // "\');\">" + name + 
                        // "</button>"
                        // object_list.push(button)
                        object_list[name_index] = name
                    }   
                    if(key == "type"){
                        type = object_data[obj][key]
                        // button = "<button onclick=\"request_available_actions(\'"+ name +
                        // "\');\">" + name + 
                        // "</button>"
                        // object_list.push(button)
                        object_list[type_index] = type
                    }   
                    if(key == "properties"){
                        props = object_data[obj][key]
                        table_props = ""
                        for (var prop in props){
                            if(prop != "bounds"){
                                table_props+= String(prop) + " : " + String(props[prop]) + "<br>"
                            } else {
                                table_props+= String(prop) + " : " + location_to_string(props[prop]) + "<br>"                            
                            }
                        }
                        object_list[properties_index] = table_props
                }
                    if(key == "location"){
                        locations = object_data[obj][key]
                        object_list[location_index] = location_to_string(locations)
                    }
                })
                object_table.row.add(object_list);
            }
        }

        object_table.draw();
}

function request_available_actions(object_name){
    message = new Paho.MQTT.Message(JSON.stringify(object_name));
    message.destinationName = "view/webviewer";
    client.send(message);    
}

function invoke_action(action_string){
        message = new Paho.MQTT.Message(JSON.stringify(action_string));
        message.destinationName = "action/submit";
        client.send(message);    
}

function subscribe() {
    client.subscribe("view/init");
    client.subscribe("view/change");
    client.subscribe("view/grounded");    
}

function send_update(name, value){
    msg = {"name": name, "currentState":value}
      message = new Paho.MQTT.Message(JSON.stringify(msg));
  message.destinationName = "actuator/change";
  client.send(message);

}
 //Connect Options
 var options = {
     timeout: 6,
     //Gets Called if the connection has sucessfully been established
     onSuccess: function () {
         console.log("Connected");
         subscribe();
     },
     //Gets Called if the connection could not be established
     onFailure: function (message) {
         console.log("Connection failed: " + message.errorMessage);
     }
 };

client.connect(options);