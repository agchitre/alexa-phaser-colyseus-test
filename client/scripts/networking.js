const PROTOCOL = window.location.protocol.replace("http", "ws");
const ENDPOINT = (window.location.hostname.indexOf("heroku") >= 0 || window.location.hostname.indexOf("now.sh") >= 0 )
    ? `${ PROTOCOL }//${ window.location.hostname }` // port 80 on heroku or now
    : `${ PROTOCOL }//${ window.location.hostname }:8080` // port 8080 on localhost
export const client = new Colyseus.Client(ENDPOINT);
