import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {Noise} from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {createFromJSON} from "@libp2p/peer-id-factory";

const hardcodedId = {
  "id":"12D3KooWB3y5QaatkKu81yfp3sZXajXDGKihg9vcPmCGG5CsaU5m",
  "privKey":"CAESQMRC8lYMmbLe01vU3KT5XEHhcN3JFaFH4wPr92DpE5K8Ele1QRWlpptwQV89zC0c317w1tSchuY4kik6b4jUcYg=",
  "pubKey":"CAESIBJXtUEVpaabcEFfPcwtHN9e8NbUnIbmOJIpOm+I1HGI"
}

const id = await createFromJSON(hardcodedId);
var announceAddr = "/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit/p2p/" + id.toString();
console.log(announceAddr);
const node = await createLibp2p( {
  peerId: id,
  transports: [
    new WebSockets(),
  ],
  connectionEncryption: [new Noise()],
  streamMuxers: [new Mplex()],
  //peerDiscovery: [
    // new Bootstrap({
    //   list: bootstrapers,
    //   //interval: 1000000000000
    // })
  //],
  dht: new KadDHT(),
  addresses: {
    listen: [
      //"/ip4/0.0.0.0/tcp/0/ws",
      //"/dns4/relayer.ms102.de/tcp/443/wss/p2p/Qma5QbMXc4DsZCa55vGhQAhK1ZLxy4ZBFTQALRyNCjYVYg/p2p-circuit"
      //"/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit",
    ],
    // announce: [
    announce: ["/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx/p2p-circuit/p2p/" + id.toString()]
  },
  connectionManager: {
    dialTimeout: 1000000,
    autoDial: false
  },
  relay: {
    enabled: true,
    autoRelay: {
      enabled: true,
      maxListeners: 10
    }
  },

}) // END libp2p.create

await node.start()
await node.dial("/ip4/89.58.0.139/tcp/34200/ws/p2p/12D3KooWJJzN1f9rvrNEhxkT3kutpPF9EAALvx9EPDMA71AYtAFx")

// Register Event handlers
node.addEventListener("peer:discovery", async (evt) => {
  console.log("Discovered: " + evt.detail.id.toString());
  console.log(evt.detail.multiaddrs);
  //await node.dial(evt.detail.id);
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
