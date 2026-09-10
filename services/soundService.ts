/**
 * SoundService: Efectos de audio sutiles y agradables mediante Web Audio API.
 * Diseñado con ondas senoidales suaves y decaimientos exponenciales
 * para ofrecer un micro-feedback táctil estilo consolas modernas sin ser molesto.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.12; // Volumen suave por defecto (12%)
  private listeners: Array<(muted: boolean) => void> = [];

  constructor() {
    // Recuperar preferencia de silencio guardada
    try {
      const saved = localStorage.getItem('teamlobby_sound_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch (e) {
      // Ignorar si localStorage no está disponible
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('teamlobby_sound_muted', String(muted));
    } catch (e) {}
    this.listeners.forEach(fn => fn(this.muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      // Tono sutil para confirmar desmuteo
      this.playPop();
    }
    return this.muted;
  }

  public onMuteChange(callback: (muted: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Click / Pop suave: feedback táctil para botones e interacciones menores.
   */
  public playPop(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

      gain.gain.setValueAtTime(this.masterVolume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Voto en juego:
   * - true: Acorde cálido ascendente (C5 -> E5).
   * - false: Suave tono descendente de cancelación.
   */
  public playVote(isVoted: boolean): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (isVoted) {
        // Doble campana suave estilo marimba
        const playTone = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(this.masterVolume * 0.8, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + dur + 0.01);
        };

        playTone(523.25, now, 0.12); // C5
        playTone(659.25, now + 0.06, 0.16); // E5
      } else {
        // Tono suave descendente
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  /**
   * Estado "SET READY":
   * - true: Sonido cálido de confirmación hacia arriba.
   * - false: Tono discreto de desactivación.
   */
  public playReady(isReady: boolean): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (isReady) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.9, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch (e) {}
  }

  /**
   * Tick de Ruleta: Click mecánico/madera sutil durante el giro.
   */
  public playRouletteTick(pitchMultiplier: number = 1): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 700 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.025);

      gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  /**
   * Victoria / Resultado Ready Command:
   * Acorde armónico mayor con caída suave (Nintendo Switch / PS5 dashboard feel).
   */
  public playVictory(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Tríada mayor de Do con octava: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + (i * 0.05);
        const duration = 0.55 - (i * 0.04);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.7, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch (e) {}
  }

  /**
   * Autocompletado seleccionado: Chime rápido de confirmación ("snap").
   */
  public playAutocompleteSelect(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09); // A5

      gain.gain.setValueAtTime(this.masterVolume * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Mensaje de Chat enviado: Burbujeo muy suave.
   */
  public playMessageSent(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);

      gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * Logro / Trofeo Desbloqueado: Arpegio triunfal armónico (C5 -> E5 -> G5 -> C6).
   */
  public playTrophy(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (i * 0.07);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.7, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch (e) {}
  }

  /**
   * Solicitud de amistad o reto recibido: Chime suave.
   */
  public playChime(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 987.77]; // E5 -> B5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (i * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.6, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {}
  }
}

export const soundService = new SoundService();
