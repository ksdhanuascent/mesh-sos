'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { MeshNode, MeshNetwork, deriveKey } = require('../src/mesh');

const key = deriveKey('test-secret');
const chain = (opts = {}) => {
  const net = new MeshNetwork({ range: 100, ...opts });
  const A = net.add(new MeshNode({ id: 'A', x: 0, y: 0, key }));
  net.add(new MeshNode({ id: 'B', x: 80, y: 0, key }));
  net.add(new MeshNode({ id: 'C', x: 160, y: 0, key }));
  const G = net.add(new MeshNode({ id: 'G', x: 240, y: 0, isGateway: true, key }));
  return { net, A, G };
};

test('SOS hops A -> B -> C -> control room without any direct link', () => {
  const { net, A, G } = chain();
  A.originate('SOS', { note: 'help' });
  net.run();
  assert.strictEqual(G.inbox.length, 1);
  assert.deepStrictEqual(G.inbox[0].path, ['A', 'B', 'C', 'G']);
  assert.strictEqual(G.inbox[0].hops, 3);
  assert.strictEqual(G.inbox[0].payload.note, 'help');
});

test('duplicates arriving over multiple routes are delivered once', () => {
  const { net, A, G } = chain();
  net.add(new MeshNode({ id: 'D', x: 80, y: 50, key })); // second route
  net.add(new MeshNode({ id: 'E', x: 160, y: 50, key }));
  A.originate('SOS', { note: 'x' });
  net.run();
  assert.strictEqual(G.inbox.length, 1);
});

test('TTL stops packets from travelling forever', () => {
  const { net, A, G } = chain();
  A.originate('SOS', { note: 'x' }, 1);
  net.run();
  assert.strictEqual(G.inbox.length, 0);
});

test('out of range: nothing delivered; store-and-forward delivers when a link appears', () => {
  const net = new MeshNetwork({ range: 100 });
  const A = net.add(new MeshNode({ id: 'A', x: 0, y: 0, key }));
  net.add(new MeshNode({ id: 'B', x: 80, y: 0, key }));
  const G = net.add(new MeshNode({ id: 'G', x: 1000, y: 0, isGateway: true, key }));
  A.originate('LOST_PERSON', { name: 'Aarav' });
  net.run();
  assert.strictEqual(G.inbox.length, 0);
  G.x = 150; // a volunteer carrying the control-room node moves into range of B
  net.run();
  assert.strictEqual(G.inbox.length, 1);
  assert.strictEqual(G.inbox[0].type, 'LOST_PERSON');
});

test('tampered packets are rejected by the control room', () => {
  const tamper = (packet, from) => {
    if (from.id === 'B') packet.box.ct = Buffer.from('forged').toString('base64');
    return packet;
  };
  const { net, A, G } = chain({ tamper });
  A.originate('SOS', { note: 'x' });
  net.run();
  assert.strictEqual(G.inbox.length, 0);
  assert.strictEqual(G.rejected, 1);
});

test('relay phones cannot read the payload', () => {
  const { net, A } = chain();
  const p = A.originate('SOS', { note: 'secret location' });
  assert.ok(!JSON.stringify(p).includes('secret location'));
  net.run();
});

test('unknown packet type is rejected', () => {
  const { A } = chain();
  assert.throws(() => A.originate('SPAM', {}));
});
