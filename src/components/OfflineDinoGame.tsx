import React, { useState, useEffect, useRef } from 'react';
import {
  WifiOff,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Car,
  ChevronRight,
  Globe,
  Maximize2,
} from 'lucide-react';
import { t } from '../data/languages.ts';

interface OfflineDinoGameProps {
  onRetry?: () => void;
  onNavigateToCarGame?: () => void;
  currentLang?: string;
  targetFailedUrl?: string;
}

export const OfflineDinoGame: React.FC<OfflineDinoGameProps> = ({
  onRetry,
  onNavigateToCarGame,
  currentLang = 'tr',
  targetFailedUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('nova_dino_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [runnerSkin, setRunnerSkin] = useState<'dino' | 'car'>('dino');
  const [isNightMode, setIsNightMode] = useState(false);

  // Audio Context for authentic retro 8-bit sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq: number, type: OscillatorType = 'square', duration = 0.08) => {
    if (isSoundMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted yet
    }
  };

  // Game Engine State Refs (to avoid React re-render lag at 60 FPS)
  const engineRef = useRef({
    score: 0,
    speed: 5.5,
    groundY: 160,
    player: {
      x: 40,
      y: 120,
      w: 36,
      h: 40,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      legFrame: 0,
    },
    obstacles: [] as Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      type: 'cactus_small' | 'cactus_large' | 'bird';
      frame?: number;
    }>,
    clouds: [] as Array<{ x: number; y: number; speed: number }>,
    groundOffset: 0,
    animId: 0,
    lastTime: 0,
  });

  // Jump Action
  const triggerJump = () => {
    const engine = engineRef.current;
    if (!isPlaying) {
      startGame();
      return;
    }
    if (isGameOver) {
      restartGame();
      return;
    }

    if (engine.player.isGrounded) {
      engine.player.vy = -11.5;
      engine.player.isGrounded = false;
      playBeep(520, 'square', 0.1);
    }
  };

  // Duck Action
  const setDucking = (ducking: boolean) => {
    const engine = engineRef.current;
    engine.player.isDucking = ducking;
    if (ducking && !engine.player.isGrounded) {
      // fast drop
      engine.player.vy += 4;
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    const engine = engineRef.current;
    engine.score = 0;
    engine.speed = 5.5;
    engine.obstacles = [];
    engine.clouds = [
      { x: 150, y: 30, speed: 0.8 },
      { x: 380, y: 45, speed: 0.6 },
      { x: 550, y: 20, speed: 1.0 },
    ];
    engine.player.y = 120;
    engine.player.vy = 0;
    engine.player.isGrounded = true;
    setScore(0);
    playBeep(440, 'triangle', 0.08);
  };

  const restartGame = () => {
    startGame();
  };

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        triggerJump();
      }
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setDucking(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setDucking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = (time: number) => {
      const engine = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Night mode background when score hits hundreds
      const currentScoreInt = Math.floor(engine.score);
      const isNight = isPlaying && Math.floor(currentScoreInt / 100) % 2 === 1;
      setIsNightMode(isNight);

      ctx.fillStyle = isNight ? '#1e293b' : '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw Ground Line
      ctx.strokeStyle = isNight ? '#475569' : '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, engine.groundY);
      ctx.lineTo(width, engine.groundY);
      ctx.stroke();

      // Ground bumps/pebbles
      ctx.fillStyle = isNight ? '#64748b' : '#475569';
      engine.groundOffset = (engine.groundOffset + (isPlaying && !isGameOver ? engine.speed : 1)) % 40;
      for (let x = -engine.groundOffset; x < width; x += 30) {
        ctx.fillRect(x + 5, engine.groundY + 4, 3, 1.5);
        ctx.fillRect(x + 18, engine.groundY + 8, 4, 1.5);
      }

      // Draw Clouds
      ctx.fillStyle = isNight ? '#334155' : '#1e293b';
      engine.clouds.forEach((cloud) => {
        if (isPlaying && !isGameOver) {
          cloud.x -= cloud.speed;
          if (cloud.x < -60) cloud.x = width + Math.random() * 80;
        }
        // Pixel Cloud
        ctx.fillRect(cloud.x, cloud.y, 40, 10);
        ctx.fillRect(cloud.x + 8, cloud.y - 6, 24, 6);
        ctx.fillRect(cloud.x + 14, cloud.y - 10, 14, 4);
      });

      // Physics & Updates
      if (isPlaying && !isGameOver) {
        engine.score += 0.15;
        setScore(Math.floor(engine.score));

        // Speed increases gradually
        engine.speed = Math.min(13, 5.5 + engine.score * 0.003);

        // Player physics
        engine.player.vy += 0.58; // gravity
        engine.player.y += engine.player.vy;

        const effectiveH = engine.player.isDucking ? 24 : 40;
        const targetFloor = engine.groundY - effectiveH;

        if (engine.player.y >= targetFloor) {
          engine.player.y = targetFloor;
          engine.player.vy = 0;
          engine.player.isGrounded = true;
        }

        // Spawn Obstacles
        const lastObs = engine.obstacles[engine.obstacles.length - 1];
        if (!lastObs || width - lastObs.x > 180 + Math.random() * 220) {
          const rand = Math.random();
          if (rand < 0.45) {
            // Small cactus
            engine.obstacles.push({
              x: width + 10,
              y: engine.groundY - 30,
              w: 16,
              h: 30,
              type: 'cactus_small',
            });
          } else if (rand < 0.8) {
            // Large/Double cactus
            engine.obstacles.push({
              x: width + 10,
              y: engine.groundY - 42,
              w: 26,
              h: 42,
              type: 'cactus_large',
            });
          } else if (engine.score > 80) {
            // Flying Pterodactyl Bird
            const birdY = Math.random() < 0.5 ? engine.groundY - 35 : engine.groundY - 60;
            engine.obstacles.push({
              x: width + 10,
              y: birdY,
              w: 32,
              h: 22,
              type: 'bird',
              frame: 0,
            });
          }
        }

        // Move Obstacles & Collision Check
        for (let i = engine.obstacles.length - 1; i >= 0; i--) {
          const obs = engine.obstacles[i];
          obs.x -= engine.speed;

          if (obs.type === 'bird') {
            obs.frame = ((obs.frame || 0) + 0.15) % 2;
          }

          // Collision Box (with small forgiveness padding)
          const px = engine.player.x + 4;
          const py = engine.player.y + 4;
          const pw = (engine.player.isDucking ? 44 : engine.player.w) - 8;
          const ph = (engine.player.isDucking ? 24 : engine.player.h) - 8;

          const ox = obs.x + 2;
          const oy = obs.y + 2;
          const ow = obs.w - 4;
          const oh = obs.h - 4;

          if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
            // Crash!
            setIsGameOver(true);
            playBeep(180, 'sawtooth', 0.25);
            if (engine.score > highScore) {
              setHighScore(Math.floor(engine.score));
              try {
                localStorage.setItem('nova_dino_highscore', String(Math.floor(engine.score)));
              } catch {}
            }
          }

          if (obs.x < -60) {
            engine.obstacles.splice(i, 1);
          }
        }
      }

      // Draw Obstacles
      engine.obstacles.forEach((obs) => {
        if (obs.type === 'cactus_small' || obs.type === 'cactus_large') {
          ctx.fillStyle = '#22c55e'; // Green Retro Pixel Cactus
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          // Cactus arms
          ctx.fillRect(obs.x - 4, obs.y + 6, 4, 10);
          ctx.fillRect(obs.x + obs.w, obs.y + 12, 4, 10);
        } else if (obs.type === 'bird') {
          // Bird
          ctx.fillStyle = '#f59e0b'; // Amber Pterodactyl
          ctx.fillRect(obs.x + 8, obs.y + 6, 20, 10);
          ctx.fillRect(obs.x, obs.y + 2, 10, 6);
          // Wing animation
          if (Math.floor(obs.frame || 0) === 0) {
            ctx.fillRect(obs.x + 12, obs.y - 8, 8, 8); // Up wing
          } else {
            ctx.fillRect(obs.x + 12, obs.y + 12, 8, 8); // Down wing
          }
        }
      });

      // Draw Player (Dino or Mini Car)
      const p = engine.player;
      engine.player.legFrame = (engine.player.legFrame + 0.2) % 2;

      if (runnerSkin === 'dino') {
        // Pixel Dino
        ctx.fillStyle = isGameOver ? '#ef4444' : '#e2e8f0';
        if (p.isDucking) {
          // Crawling Dino
          ctx.fillRect(p.x, p.y + 8, 38, 16);
          ctx.fillRect(p.x + 28, p.y + 2, 14, 12);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(p.x + 36, p.y + 4, 3, 3); // eye
        } else {
          // Standing / Running Dino
          ctx.fillRect(p.x + 10, p.y, 22, 16); // Head
          ctx.fillRect(p.x + 6, p.y + 14, 20, 18); // Body
          ctx.fillRect(p.x, p.y + 18, 10, 10); // Tail
          ctx.fillRect(p.x + 24, p.y + 20, 6, 4); // Arms
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(p.x + 24, p.y + 4, 3, 3); // Eye
          // Legs
          ctx.fillStyle = isGameOver ? '#ef4444' : '#e2e8f0';
          if (p.isGrounded && isPlaying && !isGameOver) {
            if (Math.floor(p.legFrame) === 0) {
              ctx.fillRect(p.x + 10, p.y + 32, 4, 8);
              ctx.fillRect(p.x + 18, p.y + 32, 4, 4);
            } else {
              ctx.fillRect(p.x + 10, p.y + 32, 4, 4);
              ctx.fillRect(p.x + 18, p.y + 32, 4, 8);
            }
          } else {
            ctx.fillRect(p.x + 10, p.y + 32, 4, 8);
            ctx.fillRect(p.x + 18, p.y + 32, 4, 8);
          }
        }
      } else {
        // Mini Car Skin
        ctx.fillStyle = isGameOver ? '#ef4444' : '#3b82f6';
        ctx.fillRect(p.x, p.y + 14, 40, 16); // Car body
        ctx.fillRect(p.x + 8, p.y + 4, 24, 12); // Cabin
        // Windows
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(p.x + 12, p.y + 6, 8, 8);
        ctx.fillRect(p.x + 22, p.y + 6, 8, 8);
        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x + 6, p.y + 28, 8, 8);
        ctx.fillRect(p.x + 26, p.y + 28, 8, 8);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(p.x + 8, p.y + 30, 4, 4);
        ctx.fillRect(p.x + 28, p.y + 30, 4, 4);
      }

      // Draw Start / Game Over Overlay on Canvas
      if (!isPlaying) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          t('dino_press_space_to_start', currentLang, 'BOŞLUK VEYA DOKUNARAK BAŞLA'),
          width / 2,
          80
        );
      } else if (isGameOver) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t('game_over', currentLang, 'OYUN BİTTİ (GAME OVER)'), width / 2, 70);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(
          t('press_space_to_retry', currentLang, 'Tekrar oynamak için Boşluk tuşuna basın'),
          width / 2,
          95
        );
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, isGameOver, runnerSkin]);

  return (
    <div
      id="offline-dino-page-container"
      className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-200 select-none overflow-y-auto"
      onClick={triggerJump}
    >
      <div className="max-w-2xl w-full space-y-6">
        {/* Chrome-Style No Internet Header */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {t('no_internet_title', currentLang, 'İnternet bağlantısı yok')}
                </h1>
                <p className="text-xs font-mono text-slate-400">
                  ERR_INTERNET_DISCONNECTED
                </p>
              </div>
            </div>

            {/* Skin & Sound Switcher */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setRunnerSkin((s) => (s === 'dino' ? 'car' : 'dino'))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Karakter Değiştir"
              >
                <span>{runnerSkin === 'dino' ? '🦖 Dinozor' : '🏎️ Araba'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSoundMuted((m) => !m)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title={isSoundMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {t(
              'no_internet_desc',
              currentLang,
              'Kablolarınızı, modeminizi ve yönlendiricinizi kontrol edin ya da Wi-Fi ağına yeniden bağlanın.'
            )}
          </p>

          {targetFailedUrl && (
            <div className="text-[11px] font-mono text-slate-500 truncate bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Hedef: {targetFailedUrl}
            </div>
          )}
        </div>

        {/* Dino Game Canvas Box */}
        <div
          className="relative bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl overflow-hidden group cursor-pointer"
          onClick={triggerJump}
        >
          {/* Top Score HUD */}
          <div className="flex items-center justify-between px-2 pb-2 text-xs font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              HI {String(highScore).padStart(5, '0')}
            </span>
            <span className="text-white text-sm bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
              {String(score).padStart(5, '0')}
            </span>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800/80"
          />

          {/* Touch / Click Hint */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              {t('controls_hint', currentLang, 'Kontroller: [Boşluk / Yukarı Ok] = Zıpla | [Aşağı Ok] = Eğil')}
            </span>
            <span className="text-blue-400 font-medium animate-pulse">
              {!isPlaying ? t('tap_to_play', currentLang, 'Tıkla veya Zıpla!') : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons: Retry & Switch to Full ApexDrive Car Game */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Retry Reload Button */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t('retry_connection', currentLang, 'Yeniden Dene')}</span>
            </button>
          )}

          {/* Launch Full Car Game in Offline or Embed Mode */}
          {onNavigateToCarGame && (
            <button
              type="button"
              onClick={onNavigateToCarGame}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer group"
            >
              <Car className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{t('launch_apexdrive_offline', currentLang, 'ApexDrive Araba Oyununa Geç (Çevrimdışı/Embed)')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
