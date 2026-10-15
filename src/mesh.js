'use strict';
/**
 * Core store-and-forward mesh protocol for the Offline Mesh-Network SOS & Family Tracker.
 *
 * This module is transport-agnostic. On a phone, `Node.receive()` is called from the
 * Nearby Connections / BLE payload callback, and `Network.tick()` is replaced by the real
 * radio sending a packet to every currently connected peer.
 */
const crypto = require('crypto');

const TYPES = Object.freeze({ SOS: 'SOS', LOST_PERSON: 'LOST_PERSON' });
const DEFAULT_TTL = 8;
const MAX_STORE = 100;

function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest();
}

// AES-256-GCM: confidentiality + tamper detection. Relays only ever see ciphertext.
function encrypt(obj, key) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return { iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), ct: ct.toString('base64') };
}

function decrypt(box, key) {
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(box.iv, 'base64'));
  d.setAuthTag(Buffer.from(box.tag, 'base64'));
  const pt = Buffer.concat([d.update(Buffer.from(box.ct, 'base64')), d.final()]);
  return JSON.parse(pt.toString('utf8'));
}

class MeshNode {
  constructor({ id, x = 0, y = 0, isGateway = false, key }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.isGateway = isGateway; // the police control room node with satellite uplink
    this.key = key;
    this.seen = new Set(); // packet ids already processed (dedupe / loop prevention)
    this.store = new Map(); // packetId -> packet awaiting forwarding (store-and-forward)
    this.sent = new Map(); // packetId -> Set(neighborId) already sent to
    this.inbox = []; // gateway only: delivered, decrypted alerts
    this.rejected = 0; // gateway only: packets that failed authentication
  }

  originate(type, payload, ttl = DEFAULT_TTL) {
    if (!TYPES[type]) throw new Error(`Unknown packet type: ${type}`);
    const packet = {
      id: crypto.randomUUID(),
      type,
      origin: this.id,
      ttl,
      hops: 0,
      path: [this.id],
      box: encrypt({ ...payload, sentAt: Date.now() }, this.key),
    };
    this.seen.add(packet.id);
    this._keep(packet);
    return packet;
  }

  /** Called when a packet arrives from a neighbouring device. Returns true if newly accepted. */
  receive(incoming) {
    if (this.seen.has(incoming.id)) return false; // duplicate
    this.seen.add(incoming.id);
    const packet = {
      ...incoming,
      ttl: incoming.ttl - 1,
      hops: incoming.hops + 1,
      path: [...incoming.path, this.id],
    };
    if (this.isGateway) {
      try {
        const payload = decrypt(packet.box, this.key);
        this.inbox.push({ id: packet.id, type: packet.type, origin: packet.origin, hops: packet.hops, path: packet.path, payload });
      } catch (e) {
        this.rejected += 1; // tampered or wrong key
      }
      return true;
    }
    if (packet.ttl > 0) this._keep(packet);
    return true;
  }

  _keep(packet) {
    if (this.store.size >= MAX_STORE) this.store.delete(this.store.keys().next().value);
    this.store.set(packet.id, packet);
  }
}

class MeshNetwork {
  constructor({ range = 100, tamper = null } = {}) {
    this.range = range;
    this.nodes = new Map();
    this.tamper = tamper; // optional hook (packet, from, to) => packet, to simulate a malicious relay
    this.transmissions = 0;
  }

  add(node) {
    this.nodes.set(node.id, node);
    return node;
  }

  neighbours(node) {
    return [...this.nodes.values()].filter(
      (n) => n.id !== node.id && Math.hypot(n.x - node.x, n.y - node.y) <= this.range
    );
  }

  /** One radio round: every node offers each stored packet to each in-range neighbour once. */
  tick() {
    const deliveries = [];
    for (const node of this.nodes.values()) {
      if (node.isGateway) continue;
      for (const packet of node.store.values()) {
        if (!node.sent.has(packet.id)) node.sent.set(packet.id, new Set());
        const done = node.sent.get(packet.id);
        for (const nb of this.neighbours(node)) {
          if (done.has(nb.id)) continue;
          done.add(nb.id);
          deliveries.push({ from: node, to: nb, packet });
        }
      }
    }
    let accepted = 0;
    for (const { from, to, packet } of deliveries) {
      this.transmissions += 1;
      const wire = this.tamper ? this.tamper(structuredClone(packet), from, to) : structuredClone(packet);
      if (to.receive(wire)) accepted += 1;
    }
    return accepted;
  }

  run(maxTicks = 50) {
    let ticks = 0;
    while (ticks < maxTicks) {
      ticks += 1;
      if (this.tick() === 0) break; // network has gone quiet
    }
    return ticks;
  }
}

module.exports = { MeshNode, MeshNetwork, TYPES, deriveKey, encrypt, decrypt, DEFAULT_TTL };
