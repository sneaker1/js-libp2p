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
