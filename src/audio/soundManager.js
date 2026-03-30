/**
 * Web Audio API Sound Manager
 * Synthesizes all game sounds procedurally (no external audio files)
 * Provides instant playback of musical chords, tones, and sound effects
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isMuted = false;
    this.soundCache = new Map(); // Precomputed audio buffers
    this.activeOscillators = new Set();
    this.SAMPLE_RATE = 44100;
    
    // Initialize with user interaction
    this.isInitialized = false;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      // Create AudioContext with fallback for browser compatibility
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextConstructor();
      
      // Create master volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Start at reasonable volume
      this.masterGain.connect(this.audioContext.destination);
      
      this.isInitialized = true;
      
      // Precompute common sounds for instant playback
      this._precomputeSounds();
      
      console.log('✓ SoundManager initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      return false;
    }
  }

  /**
   * Precompute and cache common sounds for instant playback
   */
  _precomputeSounds() {
    // Common sound effect frequencies
    const sounds = {
      // Card Placed: Bright C-Major chord
      cardPlaced: {
        frequencies: [262, 330, 392], // C, E, G
        duration: 0.1,
        type: 'sine'
      },
      // Victory: 4-note triumphant arpeggio
      victory: {
        notes: [
          { freq: 262, time: 0.0 },   // C
          { freq: 330, time: 0.125 }, // E
          { freq: 392, time: 0.25 },  // G
          { freq: 524, time: 0.375 }  // C (octave up)
        ],
        duration: 0.5,
        type: 'sine'
      },
      // Match Start: Bright jingle
      matchStart: {
        frequencies: [262, 330, 392],
        duration: 0.3,
        type: 'sine'
      },
      // Unit Spawn: Brief pop
      unitSpawn: {
        frequency: 1000,
        duration: 0.08,
        type: 'sine'
      },
      // Critical Hit: Double beep
      criticalHit: {
        frequencies: [800, 1200],
        duration: 0.2,
        type: 'sine'
      }
    };

    // Pre-generate these for instant playback
    for (const [key, config] of Object.entries(sounds)) {
      try {
        // These are simple enough to generate on-the-fly
        // but we could cache them if needed for performance
      } catch (error) {
        console.error(`Failed to precompute sound ${key}:`, error);
      }
    }
  }

  /**
   * Play a sound effect by type
   * @param {string} type - Sound effect type
   * @param {object} options - Optional configuration
   */
  playSfx(type, options = {}) {
    if (!this.isInitialized || this.isMuted) return;

    const sfxConfig = {
      cardPlaced: () => this.playChord([262, 330, 392], 0.1),
      cardError: () => this._playDescendingTone(400, 200, 0.3),
      unitDeath: () => this._playExplosion(200),
      towerDamage: () => this.playTone(600, 0.15, 'sine'),
      victory: () => this._playArpeggio([262, 330, 392, 524], 0.5),
      defeat: () => this._playSadTrombone(800, 0.8),
      matchStart: () => this.playChord([262, 330, 392], 0.3),
      criticalHit: () => this._playDoubleBeep(800, 1200, 0.2),
      unitSpawn: () => this.playTone(1000, 0.08, 'sine'),
      freezeApplied: () => this._playFreezeEffect(0.4),
      spellCast: () => this.playChord([440, 554], 0.15),
      damageHit: () => this.playTone(500, 0.1, 'triangle'),
    };

    const soundFn = sfxConfig[type];
    if (soundFn) {
      try {
        soundFn();
      } catch (error) {
        console.error(`Error playing sound ${type}:`, error);
      }
    }
  }

  /**
   * Play a musical chord (multiple frequencies simultaneously)
   * @param {array} frequencies - Array of frequencies in Hz
   * @param {number} duration - Duration in seconds
   */
  playChord(frequencies, duration) {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    frequencies.forEach(freq => {
      try {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.value = freq;
        osc.type = 'sine';

        // Smooth attack and release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02); // Attack
        gain.gain.linearRampToValueAtTime(0.05, endTime - 0.05); // Release
        gain.gain.linearRampToValueAtTime(0, endTime);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(endTime);
        this.activeOscillators.add(osc);

        // Cleanup
        osc.onended = () => this.activeOscillators.delete(osc);
      } catch (error) {
        console.error('Error playing chord:', error);
      }
    });
  }

  /**
   * Play a simple tone
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} type - Waveform type ('sine', 'square', 'sawtooth', 'triangle')
   */
  playTone(frequency, duration, type = 'sine') {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      osc.frequency.value = frequency;
      osc.type = type;

      // Apply filter for softer attack
      filter.type = 'lowpass';
      filter.frequency.value = 3000;

      // Smooth envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, endTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(endTime);
      this.activeOscillators.add(osc);

      osc.onended = () => this.activeOscillators.delete(osc);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  /**
   * Play an arpeggio sequence (notes played in sequence)
   * @param {array} frequencies - Array of frequencies in Hz
   * @param {number} duration - Total duration for all notes in seconds
   */
  _playArpeggio(frequencies, duration) {
    if (!this.isInitialized || this.isMuted) return;

    const noteDuration = duration / frequencies.length;
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, noteDuration, 'sine');
      }, index * noteDuration * 1000);
    });
  }

  /**
   * Play descending tone (for error/sad sounds)
   * @param {number} startFreq - Starting frequency in Hz
   * @param {number} endFreq - Ending frequency in Hz
   * @param {number} duration - Duration in seconds
   */
  _playDescendingTone(startFreq, endFreq, duration) {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.linearRampToValueAtTime(endFreq, endTime);
      osc.type = 'sine';

      // Envelope
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.05, endTime - 0.1);
      gain.gain.linearRampToValueAtTime(0, endTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(endTime);
      this.activeOscillators.add(osc);

      osc.onended = () => this.activeOscillators.delete(osc);
    } catch (error) {
      console.error('Error playing descending tone:', error);
    }
  }

  /**
   * Play explosion noise (unit death)
   * @param {number} duration - Duration in milliseconds
   */
  _playExplosion(duration) {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const durationSec = duration / 1000;
    const endTime = now + durationSec;

    try {
      // Create noise using white noise
      const bufferSize = this.audioContext.sampleRate * durationSec;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Fill with white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Random between -1 and 1
      }

      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      source.buffer = noiseBuffer;
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.linearRampToValueAtTime(50, endTime);

      // Envelope: quick attack, exponential decay
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, endTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(now);
      source.stop(endTime);
    } catch (error) {
      console.error('Error playing explosion:', error);
    }
  }

  /**
   * Play sad trombone descending tone
   * @param {number} startFreq - Starting frequency
   * @param {number} duration - Duration in seconds
   */
  _playSadTrombone(startFreq, duration) {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    try {
      // Play descending multi-note sound
      const notes = [startFreq, startFreq * 0.7, startFreq * 0.5];
      const noteDuration = duration / notes.length;

      notes.forEach((freq, index) => {
        const noteStart = now + (index * noteDuration);
        const noteEnd = noteStart + noteDuration;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.value = freq;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.linearRampToValueAtTime(0.01, noteEnd);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteEnd);
        this.activeOscillators.add(osc);

        osc.onended = () => this.activeOscillators.delete(osc);
      });
    } catch (error) {
      console.error('Error playing sad trombone:', error);
    }
  }

  /**
   * Play double beep sound (critical hit)
   * @param {number} freq1 - First frequency
   * @param {number} freq2 - Second frequency
   * @param {number} duration - Total duration in seconds
   */
  _playDoubleBeep(freq1, freq2, duration) {
    if (!this.isInitialized || this.isMuted) return;

    const beepDuration = duration / 2;
    this.playTone(freq1, beepDuration, 'sine');
    setTimeout(() => {
      this.playTone(freq2, beepDuration, 'sine');
    }, beepDuration * 1000);
  }

  /**
   * Play crystalline freeze effect
   * @param {number} duration - Duration in seconds
   */
  _playFreezeEffect(duration) {
    if (!this.isInitialized || this.isMuted) return;

    const now = this.audioContext.currentTime;
    const endTime = now + duration;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      // Sweep from high to medium frequency for crystalline effect
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(600, endTime);

      osc.type = 'triangle'; // Triangle for crystalline texture

      // Tremolo effect (amplitude modulation)
      gain.gain.setValueAtTime(0.15, now);
      
      // Modulate amplitude for shimmer
      for (let i = 0; i < 8; i++) {
        const t = now + (i * duration / 8);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.08, t + duration / 16);
      }
      
      gain.gain.linearRampToValueAtTime(0, endTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(endTime);
      this.activeOscillators.add(osc);

      osc.onended = () => this.activeOscillators.delete(osc);
    } catch (error) {
      console.error('Error playing freeze effect:', error);
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   * @param {number} volume - Volume level
   */
  setVolume(volume) {
    if (!this.isInitialized) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume * 0.5; // Cap at 0.5 max to prevent clipping
  }

  /**
   * Get current volume
   */
  getVolume() {
    if (!this.isInitialized) return 0;
    return this.masterGain.gain.value / 0.5;
  }

  /**
   * Mute/unmute sound
   */
  setMuted(muted) {
    this.isMuted = muted;
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Stop all active sounds
   */
  stopAll() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (error) {
        // Oscillator already stopped
      }
    });
    this.activeOscillators.clear();
  }

  /**
   * Get number of active sounds
   */
  getActiveSoundCount() {
    return this.activeOscillators.size;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

export default SoundManager;
