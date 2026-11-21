/*
 * Sound effects and music, all generated in code with the Web Audio API (no sound files).
 * Earth music: warm pads, a soft arpeggio, a light "factory" tick. Space music: a slow drone with sparse bells.
 * Browsers only allow sound after the first tap, so SW.audio.unlock() is called on every tap.
 */
(function (root) {
  var SW = root.SW;
  var A = SW.audio = {};
  var AC = root.AudioContext || root.webkitAudioContext;
  var ctx = null, master, sfxBus, musicBus, earthBus, spaceBus, verb, noiseBuf;
  var on = { sound: true, music: true }, scene = 'earth', timer = null;
  var nextTime = 0, step = 0;

  var LEVEL = { sfx: 0.55, music: 0.2 };
  var BPM = 84, EIGHTH = 60 / BPM / 2;

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  // D major colours: Dmaj7, Bm7, Gmaj7, A(sus)
  var CHORDS = [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 50, 52, 57]];
  var ARP = [0, 2, 1, 3, 2, 1, 3, 2];
  var BELLS = [74, 76, 78, 81, 83, 86];

  function build() {
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = gain(on.sound ? LEVEL.sfx : 0, master);
    musicBus = gain(on.music ? LEVEL.music : 0, master);
    earthBus = gain(scene === 'earth' ? 1 : 0, musicBus);
    spaceBus = gain(scene === 'space' ? 1 : 0, musicBus);
    verb = ctx.createConvolver();
    verb.buffer = impulse(3.2);
    var verbOut = gain(0.6, master);
    verb.connect(verbOut);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function gain(v, dest) { var g = ctx.createGain(); g.gain.value = v; if (dest) g.connect(dest); return g; }
  function impulse(sec) {
    var len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var ch = b.getChannelData(c);
      for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return b;
  }

  // One note with an attack/release envelope.
  function tone(freq, t, dur, o) {
    o = o || {};
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + dur);
    if (o.detune) osc.detune.value = o.detune;
    var peak = o.gain || 0.1, att = o.attack || 0.005, rel = o.release || 0.1;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + att);
    g.gain.setValueAtTime(peak, t + Math.max(att, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
    var node = osc;
    if (o.filter) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filter; osc.connect(f); node = f; }
    node.connect(g);
    g.connect(o.dest || sfxBus);
    if (o.send) { var sg = gain(o.send, verb); g.connect(sg); }
    osc.start(t); osc.stop(t + dur + rel + 0.05);
  }
  function noise(t, dur, o) {
    o = o || {};
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.sweep) f.frequency.exponentialRampToValueAtTime(o.sweep, t + dur);
    f.Q.value = o.q || 0.7;
    var peak = o.gain || 0.1;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    src.start(t); src.stop(t + dur + 0.05);
  }

  // ---------- Sound effects ----------
  var SFX = {
    tap: function (t) { tone(1500, t, 0.02, { gain: 0.025, release: 0.03 }); },
    buy: function (t) { var f = 640 + Math.random() * 60; tone(f, t, 0.06, { gain: 0.09, glide: f * 1.35, release: 0.07 }); },
    upgrade: function (t) { tone(523.25, t, 0.12, { type: 'triangle', gain: 0.08, release: 0.2 }); tone(783.99, t + 0.08, 0.16, { type: 'triangle', gain: 0.08, release: 0.3, send: 0.2 }); },
    build: function (t) {
      tone(120, t, 0.25, { gain: 0.25, glide: 60, release: 0.2 });
      noise(t, 0.18, { freq: 900, gain: 0.06 });
      tone(1046.5, t + 0.1, 0.2, { gain: 0.05, release: 0.6, send: 0.4 });
    },
    launch: function (t) {
      noise(t, 3.6, { freq: 140, sweep: 2200, gain: 0.32, attack: 2.4 });
      tone(46, t, 3.2, { gain: 0.3, attack: 1.2, release: 0.6 });
    },
    achieve: function (t) { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, t + i * 0.07, 0.08, { gain: 0.06, release: 0.5, send: 0.35 }); }); },
    claim: function (t) { [587.33, 739.99, 880, 1174.66].forEach(function (f, i) { tone(f, t + i * 0.08, 0.1, { type: 'triangle', gain: 0.06, release: 0.6, send: 0.35 }); }); },
    overdrive: function (t) { tone(220, t, 0.35, { type: 'sawtooth', gain: 0.045, glide: 880, filter: 1600, release: 0.1 }); tone(880, t + 0.3, 0.12, { gain: 0.06, release: 0.4, send: 0.3 }); },
    off: function (t) { tone(660, t, 0.12, { gain: 0.05, glide: 330, release: 0.1 }); }
  };
  A.play = function (name) {
    if (!ctx || !on.sound || ctx.state !== 'running' || !SFX[name]) return;
    try { SFX[name](ctx.currentTime + 0.01); } catch (e) { /* ignore */ }
  };

  // ---------- Music ----------
  function scheduleStep(t, i) {
    var bar = Math.floor(i / 8), e = i % 8, chord = CHORDS[bar % 4];
    if (scene === 'earth') {
      if (e === 0) {
        chord.forEach(function (n) {
          [-7, 7].forEach(function (dt) { tone(midi(n), t, EIGHTH * 8, { type: 'triangle', detune: dt, gain: 0.03, attack: 0.9, release: 1.4, filter: 950, dest: earthBus, send: 0.25 }); });
        });
      }
      if (e === 0 || e === 4) tone(midi(chord[0] - 12), t, EIGHTH * 1.6, { gain: 0.09, attack: 0.02, release: 0.25, filter: 400, dest: earthBus });
      var an = chord[ARP[e]] + 12;
      tone(midi(an), t, 0.05, { type: 'triangle', gain: 0.03 + (e % 2 ? 0 : 0.01), release: 0.3, filter: 2400, dest: earthBus, send: 0.15 });
      if (e % 2 === 1) noise(t, 0.04, { type: 'highpass', freq: 6500, gain: 0.012, dest: earthBus });
    } else {
      if (i % 16 === 0) {
        [38, 45].forEach(function (n) { tone(midi(n), t, EIGHTH * 16, { gain: 0.06, attack: 2.5, release: 3, filter: 500, dest: spaceBus, send: 0.3 }); });
        tone(midi(chord[2]), t, EIGHTH * 16, { type: 'triangle', gain: 0.018, attack: 3, release: 3, filter: 800, dest: spaceBus, send: 0.5 });
      }
      if (e % 2 === 0 && Math.random() < 0.18) {
        tone(midi(BELLS[Math.floor(Math.random() * BELLS.length)]), t, 0.05, { gain: 0.035, release: 2.6, dest: spaceBus, send: 0.7 });
      }
    }
  }
  function tick() {
    if (!ctx || !on.music || ctx.state !== 'running') return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.35) {
      scheduleStep(nextTime, step);
      step = (step + 1) % 64;
      nextTime += EIGHTH;
    }
  }

  A.setScene = function (name) {
    if (name === scene) return;
    scene = name;
    if (!ctx) return;
    var t = ctx.currentTime;
    earthBus.gain.setTargetAtTime(name === 'earth' ? 1 : 0, t, 1.2);
    spaceBus.gain.setTargetAtTime(name === 'space' ? 1 : 0, t, 1.2);
  };

  A.setEnabled = function (kind, value) {
    on[kind] = !!value;
    if (!ctx) return;
    var t = ctx.currentTime;
    if (kind === 'sound') sfxBus.gain.setTargetAtTime(value ? LEVEL.sfx : 0, t, 0.05);
    if (kind === 'music') musicBus.gain.setTargetAtTime(value ? LEVEL.music : 0, t, 0.6);
  };

  // Call from a tap: creates or resumes audio (browsers require a user gesture).
  A.unlock = function () {
    if (!AC || (!on.sound && !on.music)) return;
    try {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      if (!timer) timer = setInterval(tick, 60);
    } catch (e) { /* audio unavailable */ }
  };
  A.pause = function () { if (ctx && ctx.state === 'running') ctx.suspend(); };
  A.resume = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };
})(typeof window !== 'undefined' ? window : globalThis);
