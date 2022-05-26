# Webrtc-star example

In this example we are going to setup an webrtc signalling server and connect multiple peers to it. With this setup peers can discover and connect to each other event if they are behind a NAT.


## 01. Settting up the webrtc server with docker

On a cloud server we are setting up the webrtc server with docker-compose. Create a docker-compose.yml file.
```yaml
version: "3.3"

services:
  webrtc:
    container_name: webrtc
    image: libp2p/js-libp2p-webrtc-star:version-0.23.0
    restart: always
    ports:
      - 9090:9090

```

Start the server with `docker-compose up -d`

Checkout `http://<SERVER-IP>:9090` and note the multiaddr of the webrtc-server.

## 02. Creating the peers

```js
import {createLibp2p} from "libp2p";
import {WebRTCStar} from "@libp2p/webrtc-star";
import {Noise} from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import wrtc from "wrtc";


// Reading the webrtc servers multiaddr from the parameter
var args = process.argv.slice(2);
if (!args[0]) {
  // No arguments given
  console.log("=== HELP ===")
  console.log("You have to pass the multiaddr of the webrtc-star signalling server as an argument.");
  console.log("node peer.js /ip4/<IP>/tcp/<PORT>/ws/p2p-webrtc-star")
  console.log("or");
  console.log("node peer.js /dns4/<DOMAIN>/tcp/443/wss/p2p-webrtc-star")
  process.exit(1);
}
else {
  var webrtcMultiaddr = args[0];
}


// Creating the libp2p node
const node = await createLibp2p( {
  transports: [
    new WebRTCStar({wrtc: wrtc})
  ],
  connectionEncryption: [new Noise()],
  streamMuxers: [new Mplex()],
  dht: new KadDHT(),
  connectionManager: {
    autoDial: false
  },
  addresses: {
    listen: [
      webrtcMultiaddr
    ],
  },
})


// Starting the node
await node.start();

// Register Event handlers
node.addEventListener("peer:discovery", async (evt) => {
  console.log("Discovered: " + evt.detail.id.toString());
  await node.dial(evt.detail.id);
});
node.connectionManager.addEventListener("peer:connect", (evt) => {
  console.log("Connected: " + evt.detail.remotePeer.toString());
});
node.connectionManager.addEventListener("peer:disconnect", (evt) => {
  console.log("Disconnected: " + evt.detail.remotePeer.toString());
});

// Miscellaneous
await node.components.getTransportManager().transports.get("@libp2p/webrtc-star").discovery.start();
node.components.getTransportManager().transports.get("@libp2p/webrtc-star").discovery.addEventListener('peer', evt => {
    node.onDiscoveryPeer(evt);
});


// Show Infos on startup
console.log("=============================================================================================")
console.log("Peer id: \t" + node.peerId.toString());
console.log("Webrtc server: \t" + webrtcMultiaddr);
var myMultiaddr = node.getMultiaddrs();
for(var i=0; i<myMultiaddr.length; i++) {
  console.log("Listening on: \t" + myMultiaddr[i].toString());
}
console.log("=============================================================================================")
console.log("");
```

## 03. Start your peer on your local computer 
`node peer.js <WEBRTCSERVER-MULTIADDR>`
You will only see the startup info as there are currently no other peers.
```
=============================================================================================
Peer id:        12D3KooWR5Z3GnhgkxHNkZogfLW62hktgK9m3KYPDJsiHC6Rt5Bk
Webrtc server:  /ip4/<SERVER-IP>/tcp/9090/ws/p2p-webrtc-star
Listening on:   /ip4/<SERVER-IP>/tcp/9090/ws/p2p-webrtc-star/p2p/12D3KooWR5Z3GnhgkxHNkZogfLW62hktgK9m3KYPDJsiHC6Rt5Bk
=============================================================================================
```

## 04. Start one or multiple other peer on your local computer or somewhere else
`node peer.js <WEBRTCSERVER-MULTIADDR>`
You will see that it discovers the other peers and connects to them.
```
=============================================================================================
Peer id:        12D3KooW9utJf7KFMRtsNo4UQjPyyLqNr6HzYNLhH4catQRJmRhM
Webrtc server:  /ip4/<SERVER-IP>/tcp/9090/ws/p2p-webrtc-star
Listening on:   /ip4/<SERVER-IP>/tcp/9090/ws/p2p-webrtc-star/p2p/12D3KooW9utJf7KFMRtsNo4UQjPyyLqNr6HzYNLhH4catQRJmRhM
=============================================================================================

Connected: 12D3KooWR5Z3GnhgkxHNkZogfLW62hktgK9m3KYPDJsiHC6Rt5Bk
Discovered: 12D3KooWR5Z3GnhgkxHNkZogfLW62hktgK9m3KYPDJsiHC6Rt5Bk
```
