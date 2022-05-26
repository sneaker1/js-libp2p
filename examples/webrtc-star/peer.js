import {createLibp2p} from "libp2p";
import {WebRTCStar} from "@libp2p/webrtc-star";
import {Noise} from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import wrtc from "wrtc";

// Creating the libp2p node
const node = await createLibp2p( {
  //peerId: id,
  transports: [
    new WebRTCStar({wrtc: wrtc})
  ],
  connectionEncryption: [new Noise()],
  streamMuxers: [new Mplex()],
  dht: new KadDHT(),
  connectionManger: {
    autoDial: false
  },
  addresses: {
    listen: [
      "/dns4/webrtc-localnet.ms101.de/tcp/443/wss/p2p-webrtc-star"
    ],
  },
})

// Starting the node
await node.start();

await node.components.getTransportManager().transports.get("@libp2p/webrtc-star").discovery.start();

// Register handlers
node.addEventListener("peer:discovery", (evt) => {
  console.log("Discovered: " + evt.detail.id.toString());
});
node.connectionManager.addEventListener("peer:connect", (evt) => {
  console.log("Connected: " + evt.detail.remotePeer.toString());
});
node.connectionManager.addEventListener("peer:disconnect", (evt) => {
  console.log("Disconnected: " + evt.detail.remotePeer.toString());
});
node.components.getTransportManager().transports.get("@libp2p/webrtc-star").discovery.addEventListener('peer', evt => {
    node.onDiscoveryPeer(evt);
});

// Show Infos
console.log(`Peer started with id ${node.peerId.toString()}`)
console.log('Listening on:')
var myMultiaddrs = node.getMultiaddrs();
for(var i=0; i<myMultiaddrs.length; i++) {
  console.log(myMultiaddrs[i].toString());
}
console.log("");
console.log("=========================================")
console.log("");
