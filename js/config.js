/*
 * STARWRIGHT — balance settings.
 * Every number that controls pacing lives here. Change a value, reload, and the game uses it.
 * (The dev menu can also change a few of these live while you play.)
 */
(function (root) {
  var SW = root.SW = root.SW || {};

  SW.CONFIG = {
    version: '0.7.6',

    // Set to false for the store build. When false, the dev menu can never be opened.
    devAllowed: true,

    saveKey: 'starwright.save.v1',
    autosaveSeconds: 5,

    // ---- Factories (Era I) ----
    // cost: price of the first one. growth: each purchase multiplies the price by this.
    // cycle: seconds per production cycle. revenue: credits each factory makes per cycle.
    factories: [
      { id: 'bolt',     name: 'Bolt Press',       icon: 'bolt',   cost: 4,      growth: 1.08, cycle: 1.5, revenue: 1 },
      { id: 'wire',     name: 'Wire Mill',        icon: 'wire',   cost: 75,     growth: 1.12, cycle: 4,   revenue: 20 },
      { id: 'fuel',     name: 'Fuel Refinery',    icon: 'fuel',   cost: 1100,   growth: 1.13, cycle: 9,   revenue: 330 },
      { id: 'hull',     name: 'Hull Foundry',     icon: 'hull',   cost: 16000,  growth: 1.14, cycle: 20,  revenue: 5000 },
      { id: 'engine',   name: 'Engine Works',     icon: 'engine', cost: 2.4e5,  growth: 1.15, cycle: 45,  revenue: 6.6e4 },
      { id: 'avionics', name: 'Avionics Lab',     icon: 'chip',   cost: 3.6e6,  growth: 1.15, cycle: 90,  revenue: 7.6e5 },
      { id: 'kiln',     name: 'Heat Shield Kiln', icon: 'kiln',   cost: 5.4e7,  growth: 1.15, cycle: 180, revenue: 8.4e6 },
      { id: 'tower',    name: 'Launch Tower',     icon: 'tower',  cost: 8.1e8,  growth: 1.15, cycle: 360, revenue: 9e7 }
    ],

    // A factory appears in the list once you've earned this fraction of its first cost this run.
    revealAt: 0.4,

    // Owning this many of one factory gives a milestone bonus.
    // After the last listed value, milestones continue every `milestoneStep`.
    milestones: [10, 25, 50, 100, 150, 200, 300],
    milestoneStep: 100,
    // Milestones double speed until the cycle would drop below this; after that they double output.
    minCycle: 0.25,

    // ---- Upgrade shop ----
    // Per-factory upgrades: tier k costs factory.cost * upgradeBase * upgradeStep^k and multiplies that factory by upgradeMult.
    upgradeTiers: ['Tuned', 'Automated', 'Reinforced', 'Precision', 'Orbital-grade', 'Flawless'],
    upgradeBase: 1000,
    upgradeStep: 1000,
    upgradeMult: 3,
    // "All factories" upgrades: cost and multiplier.
    globalUpgrades: [
      { cost: 2.5e5,  mult: 2, name: 'Night shift' },
      { cost: 5e7,    mult: 2, name: 'Supply contracts' },
      { cost: 1e10,   mult: 2, name: 'Rail spur' },
      { cost: 2e12,   mult: 2, name: 'Second yard' },
      { cost: 5e14,   mult: 3, name: 'Robotic assembly' },
      { cost: 1e17,   mult: 3, name: 'Continuous production' }
    ],
    // How many upgrades the shop shows at once (the cheapest ones).
    shopShows: 3,

    // ---- Rocket and launch (Era II) ----
    rocketSections: [
      { id: 'engines',  name: 'Engines',   cost: 5e7 },
      { id: 'tank',     name: 'Fuel Tank', cost: 2.5e8 },
      { id: 'guidance', name: 'Guidance',  cost: 1e9 },
      { id: 'capsule',  name: 'Capsule',   cost: 4e9 }
    ],
    // Each launch makes the next rocket's sections cost this much more.
    rocketCostGrowth: 4,
    // Total payload you've earned = floor( cube root of (all credits ever earned / payloadDivisor) ).
    // A launch gives you the difference between that and what's already in orbit.
    // So 8x the lifetime credits = 2x the payload.
    payloadDivisor: 1e7,
    // Each tonne of payload in orbit adds this much income (0.02 = +2%).
    payloadBonus: 0.02,
    // The Rocket tab appears once you've earned this much in a run.
    rocketTabAt: 1e6,

    // ---- Overdrive and offline ----
    offlineRate: 0.5,              // earn 50% while away
    offlineCapHours: 8,            // max hours of offline earnings
    overdriveMult: 2,              // Overdrive multiplier
    overdriveCapHours: 12,         // max stored Overdrive
    awayCardMinSeconds: 60,        // show the "While you were away" card after this long

    // ---- Achievements ----
    achievementBonus: 0.01,        // each achievement: +1% income, forever

    // ---- Daily Supply Drop (7-day cycle; hours of income and/or Overdrive) ----
    // Missing a day steps you back one, not to the start.
    dailyDrops: [
      { income: 0.25 },
      { overdrive: 0.5 },
      { income: 1 },
      { overdrive: 1 },
      { income: 2 },
      { overdrive: 2 },
      { income: 4, overdrive: 4 }
    ],

    // ---- Harbor Station (Era III) ----
    // Modules come online automatically when your payload in orbit reaches `at` tonnes. Effects:
    //   income: multiply all factories   offline: add to offline rate   offlineCap: add hours
    //   odCap: add Overdrive hours        odMult: add to Overdrive multiplier
    //   rocketCost: multiply section cost payloadMult: multiply payload from launches   research: opens Research
    stationModules: [
      { id: 'core',   at: 25,   name: 'Station Core',   text: 'All factories ×1.5.',                                    effect: { income: 1.5 } },
      { id: 'solar',  at: 60,   name: 'Solar Array',    text: 'Offline earnings go from 50% to 65%.',                   effect: { offline: 0.15 } },
      { id: 'lab',    at: 150,  name: 'Research Lab',   text: 'Opens Research.',                                        effect: { research: true } },
      { id: 'hab',    at: 400,  name: 'Hab Ring',       text: 'Overdrive can store 24 hours instead of 12.',            effect: { odCap: 12 } },
      { id: 'dock',   at: 1000, name: 'Docking Port',   text: 'Rocket sections cost half as much.',                     effect: { rocketCost: 0.5 } },
      { id: 'cargo',  at: 2500, name: 'Cargo Bay',      text: 'Launches carry 25% more payload.',                       effect: { payloadMult: 1.25 } },
      { id: 'odcore', at: 6000, name: 'Overdrive Core', text: 'Overdrive gives ×3 instead of ×2.',                      effect: { odMult: 1 } },
      { id: 'obs',    at: 15000, name: 'Observatory',    text: 'Offline earnings last 12 hours instead of 8. The Moon comes into view.', effect: { offlineCap: 4 } }
    ],

    // ---- Era IV: the Moon base (opens with the Observatory) ----
    moon: {
      startHe3: 10,            // Helium-3 you start with (plus one free Regolith Scoop)
      awayCapHours: 24,        // rigs keep mining while you're away, up to this long, at full rate
      // Rigs: cost in Helium-3, growth per purchase, rate = Helium-3 per second each.
      rigs: [
        { id: 'scoop',     name: 'Regolith Scoop',   cost: 5,     growth: 1.12, rate: 0.006 },
        { id: 'extractor', name: 'Helium Extractor', cost: 300,   growth: 1.13, rate: 0.07 },
        { id: 'crawler',   name: 'Mining Crawler',   cost: 20000, growth: 1.14, rate: 1.2 }
      ],
      // Fusion Reactor: each level multiplies ALL income by fusionMult and adds fusionMining to mining speed.
      // Reaching level n+1 costs fusionBase * (n+1)^fusionPower Helium-3.
      fusionBase: 100,
      fusionPower: 5,
      fusionMult: 2,
      fusionMining: 1,
      // One-time base upgrades (Helium-3).
      base: [
        { id: 'driver',  name: 'Mass Driver',   cost: 0,    text: 'Launches payload for you. No rocket needed.' },
        { id: 'foreman', name: 'Foreman',       cost: 50,   text: 'Buys the best-value factory for you.' },
        { id: 'quarter', name: 'Quartermaster', cost: 5000, text: 'Buys upgrades as soon as you can afford them.' },
        { id: 'relay',   name: 'Lunar Relay',   cost: 3e5, text: 'Offline earnings +15%.' }
      ],
      // Mass Driver auto-launch choices: launch once it would add at least this % to your payload.
      thresholds: [25, 50, 100, 200]
    },

    // ---- Era V: Mars (opens at Fusion level unlockFusion) ----
    mars: {
      unlockFusion: 10,
      // Total colonists for a payload = (log10(payload) - colonistLogStart)^2, rounded down.
      // e.g. 10 million t -> 16 colonists, 100 million t -> 25.
      colonistLogStart: 3,
      incomePerColonist: 1.4,     // all income x1.4 per colonist (multiplies)
      miningPerColonist: 0.2,     // Moon mining +20% per colonist
      // Missions: an Expedition with a twist. Reach `goal` tonnes of payload during it to earn the perk.
      missions: [
        { id: 'lean',   name: 'Lean Yard',   goal: 1e5, twist: 'Only the first four factories run.',                       perk: 'First four factories ×10, forever.' },
        { id: 'noshop', name: 'Shop Closed', goal: 1e6, twist: 'No upgrade shop.',                                          perk: 'Factory upgrades give ×4 instead of ×3.' },
        { id: 'dark',   name: 'Dark Side',   goal: 1e6, twist: 'No offline earnings and no Overdrive.',                     perk: 'Overdrive is one step stronger (×3 becomes ×4).' },
        { id: 'manual', name: 'Hands On',    goal: 1e7, twist: 'Foreman, Quartermaster and auto-launch are switched off.', perk: 'Launches carry 50% more payload.' },
        { id: 'nomoon', name: 'No Moon',     goal: 1e6, twist: 'The Moon base stays dark.',                                 perk: 'Moon mining ×3.' }
      ]
    },

    // ---- Era VI: Kestrel, then The Long Way (endless) ----
    // Effects: income (multiplies), colonist (adds to each colonist's multiplier), odCap (hours),
    //   payload (multiplies), offline (adds), mining (multiplies), fusion (adds to each level's multiplier),
    //   research (speed multiplier).
    kestrel: {
      unlockColonists: 35,
      segments: [
        { id: 'keel',    name: 'Keel',             text: 'All income ×10.',                               effect: { income: 10 } },
        { id: 'bridge',  name: 'Bridge',           text: 'Each colonist gives ×1.45 instead of ×1.4.',    effect: { colonist: 0.05 } },
        { id: 'habA',    name: 'Forward Hab Ring', text: 'Overdrive stores 12 more hours.',               effect: { odCap: 12 } },
        { id: 'cargo',   name: 'Cargo Spine',      text: 'Launches carry 50% more payload.',              effect: { payload: 1.5 } },
        { id: 'habB',    name: 'Aft Hab Ring',     text: 'Offline earnings +15%.',                        effect: { offline: 0.15 } },
        { id: 'shield',  name: 'Shield Array',     text: 'All income ×10.',                               effect: { income: 10 } },
        { id: 'hydro',   name: 'Hydroponics',      text: 'Moon mining ×5.',                               effect: { mining: 5 } },
        { id: 'reactor', name: 'Reactor Core',     text: 'Each Fusion level gives ×2.5 instead of ×2.',   effect: { fusion: 0.5 } },
        { id: 'wings',   name: 'Solar Wings',      text: 'Research runs twice as fast.',                  effect: { research: 2 } },
        { id: 'nav',     name: 'Navigation',       text: 'Each colonist gives another +0.05.',            effect: { colonist: 0.05 } },
        { id: 'drive',   name: 'Drive Section',    text: 'All income ×100.',                              effect: { income: 100 } },
        { id: 'bell',    name: 'Engine Bell',      text: 'Kestrel is complete.',                          effect: {} }
      ],
      // The Long Way: each star rank multiplies all income; each system's payload goal grows per rank.
      rankIncome: 4,
      goalBase: 1e10,
      goalGrowth: 2.5,
      systemTwists: ['lean', 'noshop', 'dark', 'manual', 'nomoon'],
      systemBonuses: [
        { key: 'income',  value: 5,  text: 'Rich asteroid belt: all income ×5.' },
        { key: 'mining',  value: 5,  text: 'Helium-rich moons: Moon mining ×5.' },
        { key: 'payload', value: 2,  text: 'Low gravity: launches carry twice the payload.' },
        { key: 'odCap',   value: 12, text: 'Long days: Overdrive stores 12 more hours.' }
      ]
    },

    // ---- Research (opens with the Research Lab) ----
    // One project at a time. Projects run in real time, even while the app is closed.
    // hours: length of each level. per: effect added per level (same keys as modules, plus perTonne).
    research: [
      { id: 'lines',     name: 'Automated Lines', per: { income: 0.25 },     hours: [1 / 6, 0.5, 1, 2, 4] },
      { id: 'telemetry', name: 'Telemetry',       per: { perTonne: 0.005 },  hours: [1 / 3, 1, 3, 6] },
      { id: 'crews',     name: 'Night Crews',     per: { offline: 0.05 },    hours: [0.25, 0.75, 2, 5] },
      { id: 'fuel',      name: 'Fuel Chemistry',  per: { rocketCost: 0.8 },  hours: [0.5, 2, 6] },
      { id: 'headstart', name: 'Head Start',      levels: [10, 25, 50],      hours: [1, 3, 8] },
      { id: 'storage',   name: 'Long Storage',    per: { odCap: 4 },         hours: [1, 3, 6] }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
