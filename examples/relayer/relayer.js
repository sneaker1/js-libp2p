import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {TCP} from "@libp2p/tcp";
import {Noise} from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import { PubSubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import {createRSAPeerId, createEd25519PeerId, createFromJSON, exportToProtobuf} from "@libp2p/peer-id-factory";
import {fromString, toString} from "uint8arrays";

const hardcodedId = {
  "id":"12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx",
  "privKey":"CAESQG6q3/NoEjWZWRtL9fdBSAliHyHUCyrceUVeKL+d4dORfjKu3Nn8vx1wZIcms/PRTeMuLtx1TjsXgANp01BChy8=",
  "pubKey":"CAESIH4yrtzZ/L8dcGSHJrPz0U3jLi7cdU47F4ADadNQQocv"
}

var id = await createFromJSON(hardcodedId);

const node = await createLibp2p({
  peerId: id,
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0',
      //'/dns4/relayer.ms102.de/tcp/443/wss'
      //'/ip4/89.58.0.139/tcp/34200/ws'
    ],
  },
  transports: [new TCP()],
  streamMuxers: [new Mplex()],
  connectionEncryption: [new Noise()],
  pubsub: new GossipSub(),
  peerDiscovery: [
    new PubSubPeerDiscovery({
      interval: 1000
    })
  ],
  relay: {
    enabled: true,
    hop: {
      enabled: true
    }
  }
})

await node.start()

// Register Event handlers
node.addEventListener("peer:discovery", async (evt) => {
  console.log("Discovered: " + evt.detail.id.toString());
  //await node.dial(evt.detail.id);
});
node.connectionManager.addEventListener("peer:connect", (evt) => {
  console.log("Connected: " + evt.detail.remotePeer.toString());
});
node.connectionManager.addEventListener("peer:disconnect", (evt) => {
  console.log("Disconnected: " + evt.detail.remotePeer.toString());
});


console.log("RELAYER")
console.log("=============================================================================");
console.log("Peer ID: \t" + node.peerId.toString());
node.getMultiaddrs().forEach((ma) => console.log("Listening on: \t" + ma.toString()));
console.log("=============================================================================");
