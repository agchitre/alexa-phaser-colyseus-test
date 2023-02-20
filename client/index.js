const debugElement = document.getElementById('debugElement');
/**
 * Append text or any object that can be stringified to the debug element
 * @param {any} msg 
 */

function printDebug( msg ) {
    if ( typeof(msg) !== 'string' ) {
        debugElement.append(JSON.stringify(msg,null,2));
    } else {
        debugElement.append(msg);
    }
    debugElement.append('\n');
    debugElement.scrollTo({top: debugElement.scrollHeight});
    console.log(msg);
}

const PROTOCOL = window.location.protocol.replace("http", "ws");
            const ENDPOINT = (window.location.hostname.indexOf("heroku") >= 0 || window.location.hostname.indexOf("now.sh") >= 0 )
            ? `${ PROTOCOL }//${ window.location.hostname }` // port 80 on heroku or now
            : `${ PROTOCOL }//${ window.location.hostname }:8080` // port 8080 on localhost

            const roomname = 'gameRoom';
            var client = new Colyseus.Client(ENDPOINT);




            client.joinOrCreate(roomname).then(room=> {
                room.onMessage("message", (message)=> {
                    console.log(`message reveived on frontend ${message}`);
                    var p = document.createElement("p");
                    p.innerText = message;
                    document.querySelector("#messages").appendChild(p);
                });

            

            // send message to room on submit
            document.querySelector("#form").onsubmit = function(e) {
                        e.preventDefault();

                        var input = document.querySelector("#input");

                        console.log("input:", input.value);

                        // send data to room
                        room.send("message", input.value);

                        // clear input
                        input.value = "";
                    };
                        //Alexa Creation
            
            var alexaClient;
            Alexa.create({version: '1.1'})
                .then((args) => {
                    const {
                        alexa,
                        message
                    } = args;
                    alexaClient = alexa;
                    console.log(alexaClient);
                    alexaClient.skill.onMessage((message) => {   
                        printDebug('received a message from the skill endpoint');
                        printDebug(message);
                      room.send("message",message.chat);                 
                });
                   
                })
                .catch(error => {
                    
                });

 // Register a listener to receive a message from your skill
            //  alexaClient.skill.onMessage(messageReceivedCallback);

            

            
            });

            
