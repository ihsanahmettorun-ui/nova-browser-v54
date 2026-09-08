import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Globe,
  Wifi,
  WifiOff,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ShieldCheck,
  Flame,
  Check,
  Play,
  Pause,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ALL_LANGUAGES, getLanguageName, getLanguageFlag, t } from '../data/languages.ts';
import { BrowserThemeConfig } from '../types.ts';

interface ApexDriveViewProps {
  url?: string;
  onNavigateUrl?: (url: string) => void;
  onUpdateTabTitle?: (title: string) => void;
  theme: BrowserThemeConfig;
  currentLang?: string;
}

// Multi-language title & labels dictionary for ApexDrive
const APEX_TRANSLATIONS: Record<string, { title: string; subtitle: string; controls: string; offlineMode: string; embedMode: string }> = {
  tr: {
    title: 'ApexDrive: Küresel Araba Sürme Oyunu',
    subtitle: 'Gerçek Zamanlı 3D Sürüş Simülasyonu & Çevrimdışı Fizik Motoru',
    controls: 'Kontroller: [W/Yukarı] Gaz | [S/Aşağı] Fren | [A-D/Sol-Sağ] Direksiyon | [Shift] Nitro | [Boşluk] El Freni/Drift | [H] Korna',
    offlineMode: 'Çevrimdışı Motor (İnternetsiz)',
    embedMode: 'Çevrimiçi Sunucu (AI Studio Embed)',
  },
  en: {
    title: 'ApexDrive: Global Car Driving Game',
    subtitle: 'Real-Time 3D Driving Simulation & Offline Physics Engine',
    controls: 'Controls: [W/Up] Gas | [S/Down] Brake | [A-D/Left-Right] Steer | [Shift] Nitro | [Space] Handbrake/Drift | [H] Horn',
    offlineMode: 'Offline Engine (No Internet)',
    embedMode: 'Online Server (AI Studio Embed)',
  },
  de: {
    title: 'ApexDrive: Globales Autofahrspiel',
    subtitle: 'Echtzeit-3D-Fahrsimulation & Offline-Physik-Engine',
    controls: 'Steuerung: [W/Hoch] Gas | [S/Runter] Bremse | [A-D/Links-Rechts] Lenken | [Shift] Nitro | [Leertaste] Handbremse/Drift | [H] Hupe',
    offlineMode: 'Offline-Engine (Ohne Internet)',
    embedMode: 'Online-Server (AI Studio Embed)',
  },
  fr: {
    title: 'ApexDrive: Jeu de Conduite Automobile Mondial',
    subtitle: 'Simulation de Conduite 3D en Temps Réel & Moteur Physique Hors Ligne',
    controls: 'Commandes : [W/Haut] Accélérateur | [S/Bas] Frein | [A-D/Gauche-Droite] Direction | [Shift] Nitro | [Espace] Frein à main | [H] Klaxon',
    offlineMode: 'Moteur Hors Ligne (Sans Internet)',
    embedMode: 'Serveur En Ligne (AI Studio Embed)',
  },
  es: {
    title: 'ApexDrive: Juego Global de Conducción',
    subtitle: 'Simulación de Conducción 3D en Tiempo Real y Motor Físico Sin Conexión',
    controls: 'Controles: [W/Arriba] Acelerar | [S/Abajo] Frenar | [A-D/Izq-Der] Girar | [Shift] Nitro | [Espacio] Freno de mano | [H] Bocina',
    offlineMode: 'Motor Sin Conexión (Sin Internet)',
    embedMode: 'Servidor En Línea (AI Studio Embed)',
  },
  ru: {
    title: 'ApexDrive: Глобальная Игра Вождения Автомобиля',
    subtitle: '3D Симулятор Вождения в Реальном Времени и Офлайн Физический Движок',
    controls: 'Управление: [W/Вверх] Газ | [S/Вниз] Тормоз | [A-D/Влево-Вправо] Руль | [Shift] Нитро | [Пробел] Ручник | [H] Сигнал',
    offlineMode: 'Офлайн Движок (Без Интернета)',
    embedMode: 'Онлайн Сервер (AI Studio Embed)',
  },
  ar: {
    title: 'ApexDrive: لعبة قيادة السيارات العالمية',
    subtitle: 'محاكاة قيادة ثلاثية الأبعاد في الوقت الفعلي ومحرك فيزيائي دون اتصال',
    controls: 'التحكم: [W/أعلى] بنزين | [S/أسفل] فرامل | [A-D/يسار-يمين] توجيه | [Shift] نيترو | [مسافة] فرامل يد | [H] بوق',
    offlineMode: 'المحرك غير المتصل (بدون إنترنت)',
    embedMode: 'الخادم المتصل (AI Studio Embed)',
  },
  zh: {
    title: 'ApexDrive: 全球赛车驾驶游戏',
    subtitle: '实时 3D 驾驶模拟与离线物理引擎',
    controls: '控制：[W/上] 油门 | [S/下] 刹车 | [A-D/左-右] 转向 | [Shift] 氮气加速 | [空格] 手刹漂移 | [H] 鸣笛',
    offlineMode: '离线引擎（无网络）',
    embedMode: '在线服务器（AI Studio Embed）',
  },
  ja: {
    title: 'ApexDrive: グローバル・カー・ドライビング・ゲーム',
    subtitle: 'リアルタイム3Dドライビングシミュレーション＆オフライン物理エンジン',
    controls: '操作方法：[W/上] アクセル | [S/下] ブレーキ | [A-D/左右] ステアリング | [Shift] ニトロ | [Space] ハンドブレーキ | [H] クラクション',
    offlineMode: 'オフラインエンジン（インターネット不要）',
    embedMode: 'オンラインサーバー（AI Studio Embed）',
  },
  az: {
    title: 'ApexDrive: Qlobal Avtomobil Sürmə Oyunu',
    subtitle: 'Real Vaxtda 3D Sürüş Simulyasiyası və Oflayn Fizika Mühərriki',
    controls: 'İdarəetmə: [W/Yuxarı] Qaz | [S/Aşağı] Əyləc | [A-D/Sol-Sağ] Sükan | [Shift] Nitro | [Boşluq] Əl Əyləci | [H] Siqnal',
    offlineMode: 'Oflayn Mühərrik (İnternetsiz)',
    embedMode: 'Onlayn Server (AI Studio Embed)',
  },
};

export const ApexDriveView: React.FC<ApexDriveViewProps> = ({
  url = 'https://apexdrive-global-driving-0000.ai.studio',
  onNavigateUrl,
  onUpdateTabTitle,
  theme,
  currentLang = 'tr',
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(currentLang || 'tr');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [gameMode, setGameMode] = useState<'embed' | 'offline'>(() => {
    return navigator.onLine ? 'embed' : 'offline';
  });
  const [iframeError, setIframeError] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [carColor, setCarColor] = useState<'red' | 'blue' | 'gold' | 'neon'>('red');

  // Canvas Offline Engine Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineSoundRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Offline Game State
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudScore, setHudScore] = useState(0);
  const [hudNitro, setHudNitro] = useState(100);
  const [hudHealth, setHudHealth] = useState(100);
  const [hudDistance, setHudDistance] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Synchronize Tab Title with translated Game Name
  const activeTrans =
    APEX_TRANSLATIONS[selectedLang] ||
    APEX_TRANSLATIONS[selectedLang.split('-')[0]] ||
    APEX_TRANSLATIONS.en ||
    APEX_TRANSLATIONS.tr;

  useEffect(() => {
    if (onUpdateTabTitle) {
      onUpdateTabTitle(`🏎️ ${activeTrans.title}`);
    }
  }, [selectedLang, activeTrans.title]);

  // Network State Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setGameMode('offline'); // Automatically switch to built-in offline engine when internet goes down
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Web Audio Synth for Realistic Engine RPM & Sound FX
  const initEngineSound = () => {
    if (isSoundMuted || engineSoundRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(60, ctx.currentTime);
      osc2.frequency.setValueAtTime(120, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      engineSoundRef.current = { osc1, osc2, gain };
    } catch {
      // Audio context restricted until user interaction
    }
  };

  const updateEngineSoundPitch = (speedKmh: number, isNitroActive: boolean) => {
    if (isSoundMuted || !engineSoundRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const baseFreq = 50 + speedKmh * 0.9 + (isNitroActive ? 80 : 0);
      engineSoundRef.current.osc1.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.05);
      engineSoundRef.current.osc2.frequency.setTargetAtTime(baseFreq * 1.5, ctx.currentTime, 0.05);
    } catch {}
  };

  const playSfx = (freq: number, type: OscillatorType = 'square', duration = 0.1) => {
    if (isSoundMuted) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
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
    } catch {}
  };

  // Stop Engine Sound on unmount
  useEffect(() => {
    return () => {
      if (engineSoundRef.current) {
        try {
          engineSoundRef.current.osc1.stop();
          engineSoundRef.current.osc2.stop();
        } catch {}
        engineSoundRef.current = null;
      }
    };
  }, []);

  // Offline 3D Pseudo Highway Driving Engine Logic
  const carStateRef = useRef({
    x: 0, // -1 (left) to 1 (right)
    speed: 0,
    maxSpeed: 280,
    nitroSpeed: 360,
    accel: 1.2,
    brake: 2.2,
    friction: 0.985,
    distance: 0,
    score: 0,
    nitro: 100,
    isNitroActive: false,
    health: 100,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      nitro: false,
      handbrake: false,
    },
    traffic: [
      { x: -0.4, y: 300, speed: 80, color: '#3b82f6', type: 'car' },
      { x: 0.3, y: 600, speed: 70, color: '#eab308', type: 'car' },
      { x: -0.1, y: 900, speed: 60, color: '#10b981', type: 'truck' },
      { x: 0.5, y: 1300, speed: 90, color: '#ec4899', type: 'car' },
    ],
    roadCurves: 0,
  });

  // Offline Engine Keyboard Handlers
  useEffect(() => {
    if (gameMode !== 'offline') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      initEngineSound();
      const k = carStateRef.current.keys;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') k.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') k.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') k.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') k.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyN') {
        k.nitro = true;
        playSfx(880, 'sawtooth', 0.15); // Turbo boost sound
      }
      if (e.code === 'Space') {
        e.preventDefault();
        k.handbrake = true;
        playSfx(220, 'triangle', 0.1); // Drift screech sound
      }
      if (e.code === 'KeyH') {
        playSfx(440, 'sine', 0.2); // Horn
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = carStateRef.current.keys;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') k.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') k.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') k.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') k.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyN') k.nitro = false;
      if (e.code === 'Space') k.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode]);

  // Main 60 FPS Canvas Game Loop for Offline Engine
  useEffect(() => {
    if (gameMode !== 'offline') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderGame = () => {
      const state = carStateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Physics Calculations
      if (!isGamePaused) {
        // Acceleration / Deceleration
        if (state.keys.up) {
          const top = state.keys.nitro && state.nitro > 0 ? state.nitroSpeed : state.maxSpeed;
          state.speed = Math.min(top, state.speed + state.accel);
          if (state.keys.nitro && state.nitro > 0) {
            state.nitro = Math.max(0, state.nitro - 0.4);
            state.isNitroActive = true;
          } else {
            state.isNitroActive = false;
          }
        } else if (state.keys.down) {
          state.speed = Math.max(-20, state.speed - state.brake);
          state.isNitroActive = false;
        } else {
          state.speed *= state.friction;
          state.isNitroActive = false;
        }

        // Handbrake / Drift
        if (state.keys.handbrake) {
          state.speed *= 0.96;
        }

        // Steer
        if (state.speed !== 0) {
          const steerRate = (state.speed / 180) * 0.025;
          if (state.keys.left) state.x = Math.max(-0.85, state.x - steerRate);
          if (state.keys.right) state.x = Math.min(0.85, state.x + steerRate);
        }

        // Nitro regeneration over time
        if (!state.keys.nitro && state.nitro < 100) {
          state.nitro = Math.min(100, state.nitro + 0.15);
        }

        // Distance & Score
        state.distance += state.speed * 0.0002;
        state.score += Math.floor(state.speed * 0.05);

        // Update sound
        updateEngineSoundPitch(state.speed, state.isNitroActive);

        // Update React HUD states periodically
        setHudSpeed(Math.max(0, Math.floor(state.speed)));
        setHudScore(state.score);
        setHudNitro(Math.floor(state.nitro));
        setHudHealth(Math.floor(state.health));
        setHudDistance(Number(state.distance.toFixed(1)));

        // Traffic Movement & Collision
        state.traffic.forEach((car) => {
          car.y -= (state.speed - car.speed) * 0.05;

          // Wrap around traffic
          if (car.y < -50) {
            car.y = 800 + Math.random() * 400;
            car.x = (Math.random() - 0.5) * 1.5;
            car.speed = 60 + Math.random() * 60;
          } else if (car.y > 1400) {
            car.y = -20;
            car.x = (Math.random() - 0.5) * 1.5;
          }

          // Collision Check
          if (car.y > 60 && car.y < 140 && Math.abs(car.x - state.x) < 0.2) {
            // Collision!
            state.speed = Math.max(20, state.speed * 0.6);
            state.health = Math.max(0, state.health - 0.5);
            playSfx(140, 'sawtooth', 0.2);
          }
        });
      }

      // 2. Draw Graphics (3D Perspective Road)
      ctx.clearRect(0, 0, w, h);

      // Sky gradient (Sunset / Cyber Highway)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.6, '#1e1b4b');
      skyGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Distant Mountains & City Skyline
      ctx.fillStyle = '#1e1b4b';
      for (let mx = 0; mx < w; mx += 60) {
        ctx.fillRect(mx + 10, h * 0.38 - (mx % 35), 45, 60);
      }

      // Sun / Moon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.22, 28, 0, Math.PI * 2);
      ctx.fill();

      // Road Grass / Ground
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // 3D Road Perspective Trapezoid
      const horizonY = h * 0.45;
      const roadTopW = w * 0.15;
      const roadBottomW = w * 0.85;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(w / 2 - roadTopW / 2, horizonY);
      ctx.lineTo(w / 2 + roadTopW / 2, horizonY);
      ctx.lineTo(w / 2 + roadBottomW / 2, h);
      ctx.lineTo(w / 2 - roadBottomW / 2, h);
      ctx.closePath();
      ctx.fill();

      // Road Red & White Curbs
      const segments = 24;
      const timeOffset = (state.distance * 80) % 2;

      for (let i = 0; i < segments; i++) {
        const p1 = i / segments;
        const p2 = (i + 1) / segments;
        const y1 = horizonY + (h - horizonY) * (p1 * p1);
        const y2 = horizonY + (h - horizonY) * (p2 * p2);

        const curW1 = roadTopW + (roadBottomW - roadTopW) * (p1 * p1);
        const curW2 = roadTopW + (roadBottomW - roadTopW) * (p2 * p2);

        const isEven = (i + Math.floor(timeOffset)) % 2 === 0;
        ctx.fillStyle = isEven ? '#ef4444' : '#ffffff';

        // Left curb
        ctx.beginPath();
        ctx.moveTo(w / 2 - curW1 / 2 - 8, y1);
        ctx.lineTo(w / 2 - curW1 / 2, y1);
        ctx.lineTo(w / 2 - curW2 / 2, y2);
        ctx.lineTo(w / 2 - curW2 / 2 - 12, y2);
        ctx.fill();

        // Right curb
        ctx.beginPath();
        ctx.moveTo(w / 2 + curW1 / 2, y1);
        ctx.lineTo(w / 2 + curW1 / 2 + 8, y1);
        ctx.lineTo(w / 2 + curW2 / 2 + 12, y2);
        ctx.lineTo(w / 2 + curW2 / 2, y2);
        ctx.fill();

        // Road Lane Dash Lines
        if (isEven) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(w / 2 - 2, y1, 4, (y2 - y1) * 0.6);
        }
      }

      // Draw Traffic Cars (Sorted by Distance)
      state.traffic
        .slice()
        .sort((a, b) => b.y - a.y)
        .forEach((tCar) => {
          if (tCar.y < 0 || tCar.y > 700) return;
          const normY = 1 - tCar.y / 700; // 0 (horizon) to 1 (near)
          if (normY <= 0) return;

          const carScreenY = horizonY + (h - horizonY) * (normY * normY);
          const roadWidthAtY = roadTopW + (roadBottomW - roadTopW) * (normY * normY);
          const carScreenX = w / 2 + (tCar.x * roadWidthAtY) / 2;

          const scale = normY * 0.9 + 0.2;
          const carW = 50 * scale;
          const carH = 28 * scale;

          // Traffic car shadow
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(carScreenX - carW / 2, carScreenY + carH / 2 - 4, carW, 8);

          // Traffic car body
          ctx.fillStyle = tCar.color;
          ctx.fillRect(carScreenX - carW / 2, carScreenY - carH / 2, carW, carH);

          // Tail lights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(carScreenX - carW / 2 + 4, carScreenY + carH / 2 - 6, 6 * scale, 4 * scale);
          ctx.fillRect(carScreenX + carW / 2 - 10, carScreenY + carH / 2 - 6, 6 * scale, 4 * scale);
        });

      // 3. Draw Player Car (Bottom Center with Steering Tilt & Nitro Flame)
      const playerScreenX = w / 2 + (state.x * roadBottomW) / 2;
      const playerScreenY = h - 65;
      const pW = 84;
      const pH = 48;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(playerScreenX, playerScreenY + pH / 2, pW * 0.55, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nitro Flame Exhaust Effect
      if (state.isNitroActive && state.speed > 80) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(playerScreenX - 22, playerScreenY + pH / 2);
        ctx.lineTo(playerScreenX - 16, playerScreenY + pH / 2 + 25 + Math.random() * 15);
        ctx.lineTo(playerScreenX - 10, playerScreenY + pH / 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(playerScreenX + 10, playerScreenY + pH / 2);
        ctx.lineTo(playerScreenX + 16, playerScreenY + pH / 2 + 25 + Math.random() * 15);
        ctx.lineTo(playerScreenX + 22, playerScreenY + pH / 2);
        ctx.fill();
      }

      // Player Car Color
      let mainColor = '#ef4444'; // Red GT
      if (carColor === 'blue') mainColor = '#3b82f6';
      if (carColor === 'gold') mainColor = '#f59e0b';
      if (carColor === 'neon') mainColor = '#10b981';

      // Chassis
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.roundRect(playerScreenX - pW / 2, playerScreenY - pH / 2, pW, pH, 10);
      ctx.fill();

      // Cabin / Roof
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(playerScreenX - pW * 0.32, playerScreenY - pH * 0.42, pW * 0.64, pH * 0.55, 6);
      ctx.fill();

      // Rear Windshield Glass
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(playerScreenX - pW * 0.26, playerScreenY - pH * 0.12, pW * 0.52, pH * 0.22);

      // Tail Lights (Brake light glows bright red on braking)
      ctx.fillStyle = state.keys.down ? '#ff0000' : '#b91c1c';
      ctx.fillRect(playerScreenX - pW / 2 + 6, playerScreenY + pH / 2 - 10, 14, 7);
      ctx.fillRect(playerScreenX + pW / 2 - 20, playerScreenY + pH / 2 - 10, 14, 7);

      // Spoiler
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(playerScreenX - pW * 0.46, playerScreenY + pH / 2 - 4, pW * 0.92, 5);

      animId = requestAnimationFrame(renderGame);
    };

    animId = requestAnimationFrame(renderGame);
    return () => cancelAnimationFrame(animId);
  }, [gameMode, carColor, isGamePaused]);

  return (
    <div
      id="apexdrive-view-container"
      className="w-full h-full flex flex-col bg-slate-950 text-slate-200 select-none relative overflow-hidden"
    >
      {/* Top Professional Game Bar */}
      <div className="h-11 px-3 sm:px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Game Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md">
            🏎️
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{activeTrans.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">
                v1.0 3D
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Mode Switcher (Embed AI Studio vs Offline Engine) */}
        <div className="hidden md:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setGameMode('embed')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === 'embed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{activeTrans.embedMode}</span>
          </button>
          <button
            type="button"
            onClick={() => setGameMode('offline')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === 'offline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{activeTrans.offlineMode}</span>
          </button>
        </div>

        {/* Right: Actions, 145+ Language Picker & Controls */}
        <div className="flex items-center gap-2">
          {/* Network Indicator Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          {/* 145+ Languages Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="btn-apexdrive-lang-picker"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Oyun Dilini Değiştir (145+ Dil)"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{getLanguageFlag(selectedLang)}</span>
              <span className="uppercase text-[11px] font-mono">{selectedLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div
                id="apexdrive-lang-dropdown"
                className="absolute right-0 top-full mt-1.5 w-60 max-h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 overflow-y-auto divide-y divide-slate-800"
              >
                <div className="pb-1.5 px-2 text-[10px] font-bold text-slate-400 uppercase">
                  145+ Dünya Dili Çeviri
                </div>
                <div className="pt-1.5 space-y-1">
                  {ALL_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedLang === lang.code
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.nativeName || lang.name}</span>
                      </div>
                      {selectedLang === lang.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundMuted((m) => !m)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title={isSoundMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Controls Modal Open */}
          <button
            type="button"
            onClick={() => setShowControlsModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Kontroller ve İpuçları"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Direct Open in New Tab */}
          <button
            type="button"
            onClick={() => window.open(url, '_blank')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Harici Sekmede Aç"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Viewport */}
      <div className="flex-1 relative w-full h-full overflow-hidden bg-slate-950">
        {/* 1. ONLINE EMBED IFRAME MODE */}
        {gameMode === 'embed' && (
          <div className="w-full h-full flex flex-col relative">
            <iframe
              id="apexdrive-embed-frame"
              src={url}
              className="w-full h-full border-none bg-black flex-1"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock allow-orientation-lock allow-storage-access-by-user-activation"
              allow="fullscreen; autoplay; gamepad; pointer-lock; accelerometer; gyroscope; picture-in-picture; web-share; camera; microphone; clipboard-read; clipboard-write; display-capture; xr-spatial-tracking; midi; encrypted-media"
              onError={() => {
                setIframeError(true);
                setGameMode('offline'); // auto fallback to offline engine
              }}
            />

            {/* Offline Fallback Banner if Embed Fails */}
            {iframeError && (
              <div className="absolute top-4 left-4 right-4 p-3 bg-amber-950/90 border border-amber-500/50 rounded-xl text-xs text-amber-200 flex items-center justify-between shadow-2xl z-20">
                <span>{t('embed_offline_fallback', selectedLang, 'Sunucuya ulaşılamadı. Yerel Çevrimdışı Araba Simülatörü devrede!')}</span>
                <button
                  type="button"
                  onClick={() => setGameMode('offline')}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  Çevrimdışı Oyna ⚡
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. OFFLINE CANVAS ENGINE (60 FPS 3D Driving Simulator) */}
        {gameMode === 'offline' && (
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950">
            <canvas
              ref={canvasRef}
              width={900}
              height={550}
              className="w-full h-full max-w-5xl object-contain bg-slate-950 shadow-2xl cursor-crosshair"
            />

            {/* Floating In-Game HUD (Speedometer, Nitro, Score, Distance) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-20 font-mono">
              {/* Speedometer & Gear */}
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{hudSpeed}</span>
                <span className="text-xs font-bold text-slate-400">KM/H</span>
                <span className="text-xs text-blue-400 font-bold ml-2">
                  VİTES {hudSpeed > 240 ? '6' : hudSpeed > 180 ? '5' : hudSpeed > 120 ? '4' : hudSpeed > 60 ? '3' : hudSpeed > 10 ? '2' : '1'}
                </span>
              </div>

              {/* Nitro Bar */}
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-2 rounded-xl shadow-xl flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
                <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-75"
                    style={{ width: `${hudNitro}%` }}
                  />
                </div>
                <span className="text-[11px] text-cyan-300 font-bold">{hudNitro}%</span>
              </div>
            </div>

            {/* Top-Right Score & Distance HUD */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none z-20 font-mono">
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                <span className="text-xs text-slate-400">SKOR</span>
                <span className="text-base font-black text-amber-400">{hudScore}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1 rounded-lg shadow-xl text-xs text-slate-300">
                MESAFE: <span className="font-bold text-white">{hudDistance} KM</span>
              </div>
            </div>

            {/* Bottom Controls Bar for Car Color & Touch */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
              {/* Car Color Picker */}
              <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                {(['red', 'blue', 'gold', 'neon'] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCarColor(color)}
                    className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                      color === 'red'
                        ? 'bg-rose-600'
                        : color === 'blue'
                        ? 'bg-blue-600'
                        : color === 'gold'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    } ${carColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                    title={`${color.toUpperCase()} Araba`}
                  />
                ))}
              </div>

              {/* Touch Controls for Mobile/Tablet */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => {
                    carStateRef.current.keys.left = true;
                    initEngineSound();
                  }}
                  onMouseUp={() => (carStateRef.current.keys.left = false)}
                  onTouchStart={() => {
                    carStateRef.current.keys.left = true;
                    initEngineSound();
                  }}
                  onTouchEnd={() => (carStateRef.current.keys.left = false)}
                  className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-bold text-lg flex items-center justify-center active:bg-blue-600 cursor-pointer select-none"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    carStateRef.current.keys.right = true;
                    initEngineSound();
                  }}
                  onMouseUp={() => (carStateRef.current.keys.right = false)}
                  onTouchStart={() => {
                    carStateRef.current.keys.right = true;
                    initEngineSound();
                  }}
                  onTouchEnd={() => (carStateRef.current.keys.right = false)}
                  className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-bold text-lg flex items-center justify-center active:bg-blue-600 cursor-pointer select-none"
                >
                  ▶
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    carStateRef.current.keys.up = true;
                    initEngineSound();
                  }}
                  onMouseUp={() => (carStateRef.current.keys.up = false)}
                  onTouchStart={() => {
                    carStateRef.current.keys.up = true;
                    initEngineSound();
                  }}
                  onTouchEnd={() => (carStateRef.current.keys.up = false)}
                  className="w-14 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center active:scale-95 cursor-pointer select-none shadow-lg"
                >
                  GAZ
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    carStateRef.current.keys.down = true;
                    initEngineSound();
                  }}
                  onMouseUp={() => (carStateRef.current.keys.down = false)}
                  onTouchStart={() => {
                    carStateRef.current.keys.down = true;
                    initEngineSound();
                  }}
                  onTouchEnd={() => (carStateRef.current.keys.down = false)}
                  className="w-12 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center active:scale-95 cursor-pointer select-none shadow-lg"
                >
                  FREN
                </button>
                <button
                  type="button"
                  onMouseDown={() => {
                    carStateRef.current.keys.nitro = true;
                    initEngineSound();
                  }}
                  onMouseUp={() => (carStateRef.current.keys.nitro = false)}
                  onTouchStart={() => {
                    carStateRef.current.keys.nitro = true;
                    initEngineSound();
                  }}
                  onTouchEnd={() => (carStateRef.current.keys.nitro = false)}
                  className="w-12 h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center active:scale-95 cursor-pointer select-none shadow-lg"
                >
                  NITRO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Help Modal */}
      {showControlsModal && (
        <div
          onClick={() => setShowControlsModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {t('car_controls_title', selectedLang, 'ApexDrive Sürüş Kontrolleri')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowControlsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">W / Yukarı Ok (↑)</span>
                <span className="text-emerald-400 font-medium">Gaz & İleri Hızlanma</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">S / Aşağı Ok (↓)</span>
                <span className="text-rose-400 font-medium">Fren & Geri Vites</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">A - D / Sol - Sağ (← →)</span>
                <span className="text-blue-400 font-medium">Direksiyon Sağa/Sola Dönüş</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">Shift / N</span>
                <span className="text-cyan-400 font-medium">Nitro Turbo Boost ⚡</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">Boşluk (Space)</span>
                <span className="text-amber-400 font-medium">El Freni & Viraj Drift</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-white">H Tuşu</span>
                <span className="text-purple-400 font-medium">Korna Çal 🔊</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200">
              ⚡ <strong>Çevrimdışı Motor:</strong> İnternet bağlantınız kopsa bile oyun yerel Canvas fizik motoruyla kesintisiz olarak çalışır.
            </div>

            <button
              type="button"
              onClick={() => setShowControlsModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Tamam, Oyuna Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
