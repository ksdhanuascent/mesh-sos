# Demo with 3-4 Android phones

Goal for the video: show a message hopping A to B to C with no SIM and no internet.

1. Put every phone in **airplane mode**, then switch **Bluetooth and Wi-Fi on** (airplane mode does not block these when re-enabled).
2. Install the app on all phones. Name them: Phone A (victim), Phone B and C (relays), Phone D (control room).
3. Place Phone A and Phone D far apart (different rooms or about 30 m) so they **cannot** connect directly, with Phone B/C in between.
4. On Phone A tap **SOS**. Film the alert appearing on Phone D with the hop path (A, B, C).
5. Repeat with a **Lost Person** beacon.
6. Show the simulator and tests running in the laptop terminal (`npm test`) and the `demo/index.html` animation as the explanation shot.

Tip: if you cannot finish the native app in time, record the laptop `npm run simulate` output plus `demo/index.html`, and describe the phone integration (design doc, section 7) honestly as the next step.
