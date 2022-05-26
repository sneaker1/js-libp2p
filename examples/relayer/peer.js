import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {TCP} from "@libp2p/tcp";
import {Noise} from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import {Bootstrap} from "@libp2p/bootstrap";
import { PubSubPeerDiscovery } from '@libp2p/pubsub-peer-discovery';
import {createFromJSON, createEd25519PeerId} from "@libp2p/peer-id-factory";

const hardcodedId = {
  "id":"12D3KooWQ5G8SMrCJyKHxBVpnnFec1FqN2QFhvSPsJcCqJxWgo6V",
  "privKey":"CAESQPNmgqm7eUfXESK6OBKKRU16t8DGttKBfcl8vAkMA1Yh09R/+sh7Xi1G4qOQ1MeBNoJMxRf/31URpCLn+Y9XqT4=",
  "pubKey":"CAESINPUf/rIe14tRuKjkNTHgTaCTMUX/99VEaQi5/mPV6k+"
}

//const id = await createFromJSON(hardcodedId);
const id = await createEd25519PeerId();
var announceAddr = "/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit/p2p/" + id.toString();
console.log(announceAddr);

const node = await createLibp2p( {
  //peerId: id,
  addresses: {
    listen: [
      "/ip4/0.0.0.0/tcp/0",
      //"/dns4/relayer.ms102.de/tcp/443/wss/p2p/Qma5QbMXc4DsZCa55vGhQAhK1ZLxy4ZBFTQALRyNCjYVYg/p2p-circuit"
      //"/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit",
    ],
    // announce: [
    //announce: ["/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit/p2p/" + id.toString()]
  },
  transports: [new TCP()],
  streamMuxers: [new Mplex()],
  connectionEncryption: [new Noise()],
  pubsub: new GossipSub(),
  peerDiscovery: [
    new Bootstrap({
      list: ["/ip4/89.58.0.139/tcp/34200/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx"],
    }),
    new PubSubPeerDiscovery({
      interval: 1000
    })
  ],
  // relay: {
  //   enabled: true,
  //   autoRelay: {
  //     enabled: true,
  //     maxListeners: 10
  //   }
  // },

}) // END libp2p.create

await node.start()
//await node.dial("/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx")

// Register Event handlers
node.addEventListener("peer:discovery", async (evt) => {
  console.log("Discovered: " + evt.detail.id.toString());
  console.log(evt.detail.multiaddrs);
  await node.dial(evt.detail.id);
});
node.connectionManager.addEventListener("peer:connect", (evt) => {
  console.log("Connected: " + evt.detail.remotePeer.toString());
});
node.connectionManager.addEventListener("peer:disconnect", (evt) => {
  console.log("Disconnected: " + evt.detail.remotePeer.toString());
});

console.log("PEER")
console.log("=============================================================================");
console.log("Peer ID: \t" + node.peerId.toString());
node.getMultiaddrs().forEach((ma) => console.log("Listening on: \t" + ma.toString()));
console.log("=============================================================================");
