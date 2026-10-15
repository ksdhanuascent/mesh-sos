# Submission Pack (copy-paste ready)

## 1. Problem/Concept Title (62 characters)
Offline Mesh-Network SOS & Family Tracker for Mass Gatherings

## 2. Theme
Disaster Mitigation, Kumbh Mela

## 3. Theme Description & UNSDG Alignment
Our solution aligns with Theme 11 by ensuring safety and rapid emergency response during large-scale gatherings like the Kumbh Mela, where cellular networks frequently fail. It supports SDG 3 (Good Health and Well-being) by enabling rapid medical SOS dispatch, SDG 9 (Industry, Innovation) through resilient off-grid communication networks, and SDG 11 (Sustainable Cities and Communities) by enhancing crowd management and disaster mitigation in hyper-dense urban environments.

## 4. Problem Statement
During massive localized events like the Kumbh Mela, dense crowds overwhelm existing cellular infrastructure, creating absolute communication dead zones. When stampedes occur, medical emergencies arise, or children go missing, citizens cannot call for help or coordinate with authorities. First responders face critical delays due to this information blackout, leading to preventable casualties. The core gap is the total reliance on fragile, centralized cellular networks in hyper-dense areas.

## 5. Solution Description
- **Approach:** An offline mobile application that uses Bluetooth Low Energy (BLE) and Wi-Fi Direct to create a decentralized, peer-to-peer mesh network among nearby smartphones.
- **Tech Stack:** React Native (mobile frontend), Google Nearby Connections API (mesh transport), Node.js/Firebase backend reserved strictly for the master authority node with satellite access.
- **Key Features:** One-tap offline SOS broadcasting, a "Lost Person" digital beacon, and encrypted device-to-device packet hopping.
- **Intended Impact:** Emergency alerts hop from user to user until they reach a connected police control room, reducing response times and helping prevent localized panics from escalating, without requiring an active SIM card.

## 6. Working Prototype (Code Repository)
Paste your GitHub URL here: `<YOUR-REPO-URL>`

Checklist (all included in this repo):
- [x] Detailed README with setup steps and environment variables (`README.md`, `.env.example`)
- [x] Technical Design Document with hop architecture diagram (`docs/TECHNICAL_DESIGN.md`)
- [x] Sample data / test cases (`data/sample_scenario.json`, `test/mesh.test.js`, 7 tests passing)
- [x] Open-source license (`LICENSE`, MIT)

## 7. Upload Components: what you still need to do
| Item | Requirement | Status |
|---|---|---|
| Video | MP4/MOV, 3-5 min, 720p+, under 80 MB | **You must record this.** Script below |
| PPT/PDF | Under 10 MB, MUST use the official template | **You must download the official template and paste the content below into it** |
| Design documentation | Wireframes/UI mockups, max 10 MB | Take screenshots of `demo/index.html` (and the app screens if you build them) |

### Slide content for the official template
1. **Title:** Offline Mesh-Network SOS & Family Tracker
2. **Problem:** Cell networks collapse in dense crowds (Kumbh Mela); SOS and lost-child calls fail; responders blind.
3. **Solution:** Phones form a BLE + Wi-Fi Direct mesh; alerts hop to a control room with satellite uplink; no SIM needed.
4. **How it works:** diagram from `docs/TECHNICAL_DESIGN.md` (A to B to C to Control Room).
5. **Features:** one-tap SOS, Lost Person beacon, encrypted hopping, store-and-forward, dedupe + TTL.
6. **Tech stack:** React Native, Nearby Connections API, Node.js/Firebase (control room only).
7. **Prototype and results:** 7/7 tests pass; simulation: SOS delivered in 3 hops, lost-child in 2 hops; tamper detection.
8. **Impact and SDGs:** SDG 3, 9, 11; faster response, fewer casualties.
9. **Roadmap:** public-key sealing, rate limiting, field test with 20+ devices, multilingual UI.

### Video script (target about 4 minutes)
- 0:00-0:30 Problem: crowd footage or stats-free narration; "At Kumbh Mela, networks fail exactly when help is needed."
- 0:30-1:15 Solution overview using the architecture diagram.
- 1:15-2:45 Live demo: phones in airplane mode, SOS on Phone A appears on control-room phone via B and C (or `demo/index.html` plus terminal if app not finished).
- 2:45-3:30 Show `npm test` (7 passing) and `npm run simulate` output.
- 3:30-4:00 Impact, SDGs, roadmap.

Record at 1280x720 or higher; export MP4 (H.264) and check it is under 80 MB (use HandBrake at RF 26 if too large).
