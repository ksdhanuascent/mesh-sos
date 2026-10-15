'use strict';
// Runs a scenario from data/sample_scenario.json and prints how alerts hop to the control room.
const fs = require('fs');
const path = require('path');
const { MeshNode, MeshNetwork, deriveKey } = require('./mesh');

const file = process.argv[2] || path.join(__dirname, '..', 'data', 'sample_scenario.json');
const scenario = JSON.parse(fs.readFileSync(file, 'utf8'));
const key = deriveKey(process.env.MESH_SHARED_SECRET || 'demo-secret-change-me');

const net = new MeshNetwork({ range: scenario.range });
for (const n of scenario.nodes) net.add(new MeshNode({ ...n, key }));

for (const ev of scenario.events) {
  net.nodes.get(ev.from).originate(ev.type, ev.payload);
}
const ticks = net.run(scenario.maxTicks || 50);

const gateway = [...net.nodes.values()].find((n) => n.isGateway);
console.log(`Scenario: ${scenario.name}`);
console.log(`Radio range: ${scenario.range} m | rounds: ${ticks} | transmissions: ${net.transmissions}\n`);
for (const a of gateway.inbox) {
  console.log(`[${a.type}] from ${a.origin} -> control room in ${a.hops} hops via ${a.path.join(' -> ')}`);
  console.log(`   payload: ${JSON.stringify(a.payload)}\n`);
}
console.log(`Alerts delivered: ${gateway.inbox.length}/${scenario.events.length} | rejected (tampered): ${gateway.rejected}`);
