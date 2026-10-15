# Offline Mesh-Network SOS & Family Tracker

When a mass gathering such as the Kumbh Mela overwhelms the cellular network, people cannot call for help. This project lets phones form a **decentralised peer-to-peer mesh** (Bluetooth Low Energy + Wi-Fi Direct via Google Nearby Connections). An SOS or "lost person" alert **hops phone to phone** until it reaches a police control room node that has satellite internet, with no SIM or cell signal needed.

**Theme:** Disaster Mitigation, Kumbh Mela | **SDGs:** 3, 9, 11

## What is in this repository

| Path | Purpose |
|---|---|
| `src/mesh.js` | Core store-and-forward mesh protocol: packets, flooding with dedupe and TTL, AES-256-GCM encrypted payloads, gateway node |
| `src/simulate.js` | Runs a scenario and prints each alert's hop path |
| `data/sample_scenario.json` | Sample data: 4 phones + control room, one medical SOS and one lost child |
| `test/mesh.test.js` | 7 automated test cases (multi-hop, dedupe, TTL, partition healing, tamper rejection, privacy) |
| `demo/index.html` | Open in any browser: animated visual demo of an alert hopping A to B to C to control room |
| `docs/TECHNICAL_DESIGN.md` | Architecture and hop diagram, packet format, security, mobile integration |
| `docs/DEMO_WITH_PHONES.md` | Step-by-step for the 3-4 Android phone demo |
| `.env.example` | Environment variables |
| `LICENSE` | MIT |

## Setup

Requirements: Node.js 18 or newer. No dependencies to install.

```bash
git clone <your-repo-url>
cd mesh-sos
cp .env.example .env        # optional; set MESH_SHARED_SECRET
npm test                    # runs all 7 test cases
npm run simulate            # runs data/sample_scenario.json
```

To use your own scenario: `node src/simulate.js path/to/scenario.json`

Open `demo/index.html` in a browser for the visual demo (no server needed).

### Environment variables

| Variable | Used by | Meaning |
|---|---|---|
| `MESH_SHARED_SECRET` | simulator and tests | Secret from which the AES-256-GCM key is derived (demo only) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_PATH` | control-room backend | Only the satellite-connected master node talks to the backend |

## Expected output

```
[SOS] from PhoneA -> control room in 3 hops via PhoneA -> PhoneB -> PhoneC -> ControlRoom
[LOST_PERSON] from PhoneD -> control room in 2 hops via PhoneD -> PhoneC -> ControlRoom
Alerts delivered: 2/2 | rejected (tampered): 0
```

## How it works (short)

1. A user taps **SOS** or sets a **Lost Person** beacon. The app creates a packet with a unique ID, TTL and an encrypted payload.
2. Each phone stores the packet and offers it to every phone currently in radio range (store-and-forward, so a packet waits if no neighbour exists yet).
3. Phones ignore packets already seen (loop prevention) and drop them when TTL runs out.
4. The first packet to reach the control-room node is decrypted, authenticated and shown to responders; the node forwards it over satellite internet.

See `docs/TECHNICAL_DESIGN.md` for details.

## Scope and honesty note

`src/mesh.js` is the transport-independent protocol and is fully tested in simulation. On Android, the same logic is driven by the Google Nearby Connections callbacks (see the design doc, section "Mobile integration"). Real radio range, battery and crowd-density behaviour must be validated on devices.

## License

MIT, see `LICENSE`.
