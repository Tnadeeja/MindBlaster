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

  // Specific game sounds
  join() {
    // Cheerful ascending tone
    this.playSequence([
      { freq: 523.25, duration: 0.1, type: 'sine', volume: 0.2 },
      { freq: 659.25, duration: 0.15, type: 'sine', volume: 0.25 }
    ], 0.1);
  }

  gameStart() {
    // Exciting fanfare
    this.playSequence([
      { freq: 392, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 523.25, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 659.25, duration: 0.25, type: 'square', volume: 0.25 }
    ], 0.12);
  }

  submit() {
    // Confirmation beep
    this.playTone(880, 0.1, 'sine', 0.2);
  }

  roundStart() {
    // Alert tone
    this.playSequence([
      { freq: 784, duration: 0.1, type: 'triangle', volume: 0.2 },
      { freq: 880, duration: 0.15, type: 'triangle', volume: 0.25 }
    ], 0.08);
  }

  timerUrgent() {
    // Urgent beep
    this.playTone(1046.5, 0.08, 'square', 0.15);
  }

  reveal() {
    // Dramatic reveal
    this.playSequence([
      { freq: 523.25, duration: 0.1, type: 'sine', volume: 0.2 },
      { freq: 659.25, duration: 0.1, type: 'sine', volume: 0.2 },
      { freq: 783.99, duration: 0.2, type: 'sine', volume: 0.25 }
    ], 0.1);
  }

  win() {
    // Victory fanfare
    this.playSequence([
      { freq: 523.25, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 659.25, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 783.99, duration: 0.15, type: 'square', volume: 0.2 },
      { freq: 1046.5, duration: 0.3, type: 'square', volume: 0.25 }
    ], 0.12);
  }

  eliminate() {
    // Descending dramatic tone
    this.playSequence([
      { freq: 523.25, duration: 0.15, type: 'sawtooth', volume: 0.25 },
      { freq: 392, duration: 0.15, type: 'sawtooth', volume: 0.25 },
      { freq: 261.63, duration: 0.3, type: 'sawtooth', volume: 0.2 }
    ], 0.1);
  }

  gameOver() {
    // Game over sequence
    this.playSequence([
      { freq: 392, duration: 0.2, type: 'triangle', volume: 0.2 },
      { freq: 349.23, duration: 0.2, type: 'triangle', volume: 0.2 },
      { freq: 293.66, duration: 0.4, type: 'triangle', volume: 0.25 }
    ], 0.15);
  }

  countdown() {
    // Quick tick
    this.playTone(1174.66, 0.05, 'sine', 0.15);
  }

  error() {
    // Error buzz
    this.playTone(200, 0.2, 'sawtooth', 0.2);
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
