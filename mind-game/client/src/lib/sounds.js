// Sound effects using Web Audio API
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Create a simple tone
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play a sequence of tones
  playSequence(notes, interval = 0.1) {
    if (!this.enabled) return;
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration, note.type, note.volume);
      }, index * interval * 1000);
    });
  }

  // Horror sound effects
  join() {
    // Creepy door creak sound
    this.playSequence([
      { freq: 80, duration: 0.3, type: 'sawtooth', volume: 0.15 },
      { freq: 60, duration: 0.4, type: 'sawtooth', volume: 0.2 },
      { freq: 40, duration: 0.2, type: 'sawtooth', volume: 0.1 }
    ], 0.2);
  }

  gameStart() {
    // Horror heartbeat start
    this.playSequence([
      { freq: 40, duration: 0.1, type: 'sine', volume: 0.3 },
      { freq: 60, duration: 0.1, type: 'sine', volume: 0.3 },
      { freq: 40, duration: 0.1, type: 'sine', volume: 0.3 },
      { freq: 80, duration: 0.3, type: 'square', volume: 0.2 }
    ], 0.15);
  }

  submit() {
    // Blood drop sound
    this.playTone(150, 0.15, 'sine', 0.25);
  }

  roundStart() {
    // Scary whisper wind
    this.playSequence([
      { freq: 100, duration: 0.2, type: 'sawtooth', volume: 0.15 },
      { freq: 120, duration: 0.15, type: 'sawtooth', volume: 0.2 },
      { freq: 80, duration: 0.25, type: 'sawtooth', volume: 0.15 }
    ], 0.1);
  }

  timerUrgent() {
    // Heartbeat urgent
    this.playTone(50, 0.1, 'square', 0.3);
  }

  reveal() {
    // Ghostly moan reveal
    this.playSequence([
      { freq: 200, duration: 0.3, type: 'sawtooth', volume: 0.2 },
      { freq: 150, duration: 0.2, type: 'sawtooth', volume: 0.25 },
      { freq: 100, duration: 0.4, type: 'sawtooth', volume: 0.15 }
    ], 0.15);
  }

  win() {
    // Sinister victory laugh
    this.playSequence([
      { freq: 300, duration: 0.1, type: 'square', volume: 0.2 },
      { freq: 400, duration: 0.1, type: 'square', volume: 0.25 },
      { freq: 500, duration: 0.1, type: 'square', volume: 0.3 },
      { freq: 200, duration: 0.3, type: 'sawtooth', volume: 0.2 }
    ], 0.12);
  }

  eliminate() {
    // Death scream
    this.playSequence([
      { freq: 800, duration: 0.2, type: 'sawtooth', volume: 0.3 },
      { freq: 600, duration: 0.2, type: 'sawtooth', volume: 0.25 },
      { freq: 400, duration: 0.3, type: 'sawtooth', volume: 0.2 },
      { freq: 100, duration: 0.4, type: 'sine', volume: 0.15 }
    ], 0.1);
  }

  gameOver() {
    // Funeral dirge
    this.playSequence([
      { freq: 100, duration: 0.3, type: 'triangle', volume: 0.2 },
      { freq: 80, duration: 0.3, type: 'triangle', volume: 0.2 },
      { freq: 60, duration: 0.5, type: 'triangle', volume: 0.25 },
      { freq: 40, duration: 0.4, type: 'sine', volume: 0.15 }
    ], 0.2);
  }

  countdown() {
    // Ticking clock horror
    this.playTone(120, 0.08, 'square', 0.2);
  }

  error() {
    // Static horror buzz
    this.playSequence([
      { freq: 100, duration: 0.1, type: 'sawtooth', volume: 0.25 },
      { freq: 150, duration: 0.1, type: 'sawtooth', volume: 0.3 },
      { freq: 80, duration: 0.2, type: 'sawtooth', volume: 0.2 }
    ], 0.05);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const sounds = new SoundManager();
