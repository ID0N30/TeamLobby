import React, { useRef, useEffect } from 'react';
import { soundService } from '../services/soundService';

export interface RouletteOption {
  gameId: string;
  gameTitle: string;
  count: number;
  percentage: number;
  color: string;
  imageUrl?: string;
}

interface RouletteWheelProps {
  options: RouletteOption[];
  targetAngle?: number;
  isSpinning: boolean;
  spinStartedAt?: number;
  spinDuration?: number;
  onSpinComplete?: () => void;
}

const PALETTE = [
  '#8b5cf6', // Violeta Neón (Primary)
  '#06b6d4', // Cian Eléctrico
  '#10b981', // Verde Esmeralda
  '#f59e0b', // Ámbar Dorado
  '#ec4899', // Fucsia Neón
  '#ef4444', // Rojo Carmesí
  '#3b82f6', // Azul Cobalto
  '#14b8a6', // Turquesa Matrix
  '#a855f7', // Púrpura Brillante
  '#f97316', // Naranja Vívido
];

export const getOptionColor = (index: number): string => {
  return PALETTE[index % PALETTE.length];
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
  vRot: number;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  options,
  targetAngle = 0,
  isSpinning,
  spinStartedAt,
  spinDuration = 6500,
  onSpinComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastPegIndexRef = useRef<number>(-1);
  const completedRef = useRef<boolean>(false);
  const needleWobbleRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const currentAngleRef = useRef<number>(0);

  // Cantidad de clavijas perimetrales para el efecto de sonido y visual
  const TOTAL_PEGS = 24;

  // Easing de desaceleración suave y progresivo (Quintic Ease-Out)
  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 4.2);
  };

  // Generar partículas de celebración al detenerse en el ganador
  const spawnCelebrationParticles = (cx: number, cy: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        size: 3 + Math.random() * 4,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    if (!isSpinning) {
      completedRef.current = false;
      lastPegIndexRef.current = -1;
    }
  }, [isSpinning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 380;
      const height = rect.height || 380;

      // Sincronizar resolución física interna con CSS
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const outerRadius = Math.min(cx, cy) - 18;
      const innerRadius = outerRadius - 16;
      const hubRadius = Math.max(34, outerRadius * 0.22);

      // Calcular ángulo actual según estado y marca de tiempo
      let angleDeg = currentAngleRef.current;

      if (isSpinning && spinStartedAt) {
        const elapsed = Math.max(0, Date.now() - spinStartedAt);
        const progress = Math.min(1, elapsed / spinDuration);
        const eased = easeOut(progress);
        angleDeg = targetAngle * eased;
        currentAngleRef.current = angleDeg;

        // Comprobación de clavijas para reproducir sonido de tick y sacudir la aguja
        const currentPeg = Math.floor((angleDeg / (360 / TOTAL_PEGS)));
        if (currentPeg !== lastPegIndexRef.current) {
          lastPegIndexRef.current = currentPeg;
          // Modular tono ligeramente según velocidad
          const speedFactor = Math.max(0.6, 1.2 - progress * 0.5);
          soundService.playRouletteTick(speedFactor);
          needleWobbleRef.current = 12 * (1 - progress * 0.7);
        }

        // Fin de la animación
        if (progress >= 1 && !completedRef.current) {
          completedRef.current = true;
          soundService.playVictory();
          spawnCelebrationParticles(cx, cy);
          if (onSpinComplete) {
            onSpinComplete();
          }
        }
      } else if (!isSpinning && targetAngle && completedRef.current) {
        angleDeg = targetAngle;
      }

      // Amortiguar oscilación de la aguja hacia el centro
      needleWobbleRef.current *= 0.82;

      const angleRad = (angleDeg * Math.PI) / 180;

      // ==========================================
      // 1. DIBUJAR RESPLANDOR AMBIENTAL DE LA RULETA
      // ==========================================
      const ambientGlow = ctx.createRadialGradient(cx, cy, outerRadius * 0.7, cx, cy, outerRadius + 14);
      ambientGlow.addColorStop(0, 'rgba(139, 92, 246, 0)');
      ambientGlow.addColorStop(0.85, 'rgba(139, 92, 246, 0.08)');
      ambientGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius + 14, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // 2. DIBUJAR ANILLO EXTERIOR METÁLICO (BEZEL)
      // ==========================================
      const bezelGrad = ctx.createLinearGradient(cx - outerRadius, cy - outerRadius, cx + outerRadius, cy + outerRadius);
      bezelGrad.addColorStop(0, '#2d2d3f');
      bezelGrad.addColorStop(0.3, '#121218');
      bezelGrad.addColorStop(0.7, '#383850');
      bezelGrad.addColorStop(1, '#181822');

      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = bezelGrad;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4c4c6a';
      ctx.stroke();

      // ==========================================
      // 3. DIBUJAR PORCIONES (SLICES) DE LA RULETA
      // ==========================================
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      const totalCount = options.reduce((acc, curr) => acc + (curr.count || 1), 0);
      let startAngle = 0;

      if (options.length === 0) {
        // Estado vacío por defecto
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1e2d';
        ctx.fill();
      } else {
        options.forEach((opt, idx) => {
          const sliceFraction = totalCount > 0 ? (opt.count || 1) / totalCount : 1 / options.length;
          const sliceAngle = sliceFraction * Math.PI * 2;
          const endAngle = startAngle + sliceAngle;

          // Dibujar sector
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, innerRadius, startAngle, endAngle);
          ctx.closePath();

          // Gradiente sutil hacia el borde exterior de la porción
          const sliceGrad = ctx.createRadialGradient(0, 0, hubRadius, 0, 0, innerRadius);
          const baseColor = opt.color || getOptionColor(idx);
          sliceGrad.addColorStop(0, '#101018');
          sliceGrad.addColorStop(0.25, baseColor);
          sliceGrad.addColorStop(1, baseColor);

          ctx.fillStyle = sliceGrad;
          ctx.fill();

          // Separador de porciones
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#09090e';
          ctx.stroke();

          // Dibujo de texto y porcentaje dentro del sector
          ctx.save();
          const midAngle = startAngle + sliceAngle / 2;
          ctx.rotate(midAngle);

          // Posición radial del texto
          const textRadius = innerRadius * 0.65;
          ctx.translate(textRadius, 0);

          // Alinear texto para lectura natural
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Limitar ancho según el tamaño angular de la porción
          const maxTextWidth = Math.max(40, (innerRadius * sliceAngle) * 0.85);

          // Truncar título
          let title = opt.gameTitle;
          ctx.font = '900 11px Inter, system-ui, sans-serif';
          let titleWidth = ctx.measureText(title).width;
          if (titleWidth > maxTextWidth) {
            while (title.length > 3 && ctx.measureText(title + '...').width > maxTextWidth) {
              title = title.substring(0, title.length - 1);
            }
            title += '...';
          }

          // Sombra oscura para contraste
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillStyle = '#ffffff';
          ctx.fillText(title, 0, -5);

          // Porcentaje de probabilidad
          ctx.font = '800 9px Inter, system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          const pctText = `${(opt.percentage || (sliceFraction * 100)).toFixed(0)}%`;
          ctx.fillText(pctText, 0, 8);

          ctx.restore();

          startAngle = endAngle;
        });
      }

      // ==========================================
      // 4. CLAVIJAS PERIMETRALES (PEGS / RIVETS)
      // ==========================================
      for (let i = 0; i < TOTAL_PEGS; i++) {
        const pegAngle = (i * (Math.PI * 2)) / TOTAL_PEGS;
        const px = Math.cos(pegAngle) * (outerRadius - 8);
        const py = Math.sin(pegAngle) * (outerRadius - 8);

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; // Dorado brillante
        ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
        ctx.shadowBlur = 5;
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#78350f';
        ctx.stroke();
      }

      ctx.restore(); // Restaurar rotación del disco

      // ==========================================
      // 5. EJE CENTRAL (HUB GAMER)
      // ==========================================
      // Anillo exterior del centro
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius + 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0f14';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fbbf24'; // Borde dorado
      ctx.stroke();

      // Disco del centro con degradado metálico
      const hubGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, hubRadius);
      hubGrad.addColorStop(0, '#2d2d38');
      hubGrad.addColorStop(0.8, '#14141a');
      hubGrad.addColorStop(1, '#09090d');

      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
      ctx.fillStyle = hubGrad;
      ctx.fill();

      // Insignia interior / Logo
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.stroke();

      // Texto/Icono central "TL" (TeamLobby)
      ctx.font = '900 13px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#a78bfa';
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('TL', cx, cy);

      // ==========================================
      // 6. AGUJA INDICADORA (POINTER SUPERIOR)
      // ==========================================
      ctx.save();
      ctx.translate(cx, cy - outerRadius + 8);
      // Aplicar rebote táctil en la aguja al pasar por las clavijas
      ctx.rotate((needleWobbleRef.current * Math.PI) / 180);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Forma triangular apuntando hacia abajo
      ctx.beginPath();
      ctx.moveTo(0, 16); // Punta que entra a la ruleta
      ctx.lineTo(-12, -18);
      ctx.arc(0, -18, 12, Math.PI, 0, false);
      ctx.lineTo(12, -18);
      ctx.closePath();

      const needleGrad = ctx.createLinearGradient(0, -30, 0, 16);
      needleGrad.addColorStop(0, '#fef08a');
      needleGrad.addColorStop(0.5, '#f59e0b');
      needleGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = needleGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Remache de la aguja
      ctx.beginPath();
      ctx.arc(0, -18, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1e2d';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      ctx.restore();

      // ==========================================
      // 7. RENDERIZADO DE PARTÍCULAS DE CONFETI
      // ==========================================
      if (particlesRef.current.length > 0) {
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // Gravedad
          p.rotation += p.vRot;
          p.alpha -= 0.012;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [options, isSpinning, targetAngle, spinStartedAt, spinDuration, onSpinComplete]);

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto select-none flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter drop-shadow-[0_0_35px_rgba(139,92,246,0.25)]"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default RouletteWheel;
