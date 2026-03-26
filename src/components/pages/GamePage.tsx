"use client"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import type { Assignment } from "@/types/assignment"
import { MemoryFlipGame }   from "@/components/games/MemoryFlipGame"
import { MatchingPairsGame } from "@/components/games/MatchingPairsGame"
import { SortRushGame }      from "@/components/games/SortRushGame"

const GAME_IDS = { MEMORY_FLIP: 2, MATCHING_PAIRS: 3, SORT_RUSH: 4 }

const GAME_META: Record<number, { icon: string; color: string; title: string; subtitle: string }> = {
  [GAME_IDS.MEMORY_FLIP]:    { icon: "🧠", color: "#a78bfa", title: "MEMORIA",    subtitle: "ENCUENTRA LOS PARES OCULTOS"   },
  [GAME_IDS.MATCHING_PAIRS]: { icon: "🔗", color: "#34d399", title: "CONEXIÓN",   subtitle: "UNE CADA ELEMENTO CON SU PAREJA" },
  [GAME_IDS.SORT_RUSH]:      { icon: "⚡", color: "#f472b6", title: "ORDENA YA",  subtitle: "CLASIFICA ANTES DE QUE CAIGA"  },
}

interface Props {
  assignmentId: number
}

// ─── Star field ───────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top:  `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  dur:   `${2 + Math.random() * 3}s`,
  size:  Math.random() > 0.7 ? "3px" : "2px",
}))

export function GamePage({ assignmentId }: Props) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [tapToStart, setTapToStart]     = useState(true)    // waiting for user tap
  const [introVisible, setIntroVisible] = useState(false)   // countdown before game
  const [countdown, setCountdown]       = useState(3)
  const countdownAudio = useRef<HTMLAudioElement | null>(null)
  const musicAudio     = useRef<HTMLAudioElement | null>(null)

  // Create audio elements on mount
  useEffect(() => {
    countdownAudio.current = new Audio("/music/countdown.mp3")
    countdownAudio.current.volume = 0.15
    musicAudio.current = new Audio("/music/music.mp3")
    musicAudio.current.loop = true
    musicAudio.current.volume = 0.15
    return () => {
      countdownAudio.current?.pause()
      musicAudio.current?.pause()
    }
  }, [])

  useEffect(() => {
    axios.get<Assignment>(`/api/assignments/${assignmentId}`)
      .then(res => setAssignment(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [assignmentId])

  // User tapped → unlock audio + start countdown
  const handleTapToStart = () => {
    setTapToStart(false)
    setIntroVisible(true)
    countdownAudio.current?.play().catch(() => {})
  }

  // Switch to music when countdown ends
  useEffect(() => {
    if (introVisible) return
    if (tapToStart) return   // hasn't started yet
    countdownAudio.current?.pause()
    if (musicAudio.current) {
      musicAudio.current.currentTime = 0
      musicAudio.current.play().catch(() => {})
    }
  }, [introVisible])

  // Countdown — only runs after user taps
  useEffect(() => {
    if (!assignment || error || tapToStart || !introVisible) return
    if (countdown <= 0) { setIntroVisible(false); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [assignment, countdown, error, tapToStart, introVisible])

  const isMemory    = assignment?.activityId === GAME_IDS.MEMORY_FLIP
  const isMatching  = assignment?.activityId === GAME_IDS.MATCHING_PAIRS
  const isSortRush  = assignment?.activityId === GAME_IDS.SORT_RUSH
  const meta        = assignment ? GAME_META[assignment.activityId] : null

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Screen>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: "1rem" }}>🎮</div>
          <div style={{ color: "#60a5fa", fontSize: "clamp(9px,2vw,12px)", marginBottom: "1.2rem" }}>
            CARGANDO JUEGO...
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                width: 14, height: 14,
                background: "#7c3aed",
                animation: `pixelBlink 0.8s step-end infinite`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        </div>
      </Screen>
    )
  }

  // ─── ERROR ──────────────────────────────────────────────────────────────────
  if (error || !assignment) {
    return (
      <Screen>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "0.75rem", animation: "shake 0.5s ease" }}>💀</div>
          <div style={{ color: "#ef4444", fontSize: "clamp(9px,2vw,12px)", marginBottom: "0.5rem", textShadow: "0 0 16px #ef4444" }}>
            ERROR DEL SISTEMA
          </div>
          <div style={{ color: "#6b7280", fontSize: "clamp(7px,1.5vw,9px)", marginBottom: "1.5rem" }}>
            NO SE PUDO CARGAR EL JUEGO
          </div>
          <BackBtn />
        </div>
      </Screen>
    )
  }

  // ─── NOT AVAILABLE ──────────────────────────────────────────────────────────
  if (!isMemory && !isMatching && !isSortRush) {
    return (
      <Screen>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "0.75rem", animation: "float 3s ease-in-out infinite" }}>🔒</div>
          <div style={{ color: "#fbbf24", fontSize: "clamp(9px,2vw,12px)", marginBottom: "0.5rem", textShadow: "0 0 16px #fbbf24" }}>
            PRÓXIMAMENTE
          </div>
          <div style={{ color: "#6b7280", fontSize: "clamp(7px,1.5vw,9px)", marginBottom: "1.5rem" }}>
            ESTE JUEGO AÚN NO ESTÁ DISPONIBLE
          </div>
          <BackBtn />
        </div>
      </Screen>
    )
  }

  // ─── TAP TO START ───────────────────────────────────────────────────────────
  if (tapToStart && meta) {
    return (
      <Screen>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: "1.2rem" }}>{meta.icon}</div>
          <div style={{ color: meta.color, fontSize: "clamp(10px,2.5vw,14px)", marginBottom: "0.5rem", textShadow: `0 0 20px ${meta.color}` }}>
            {meta.title}
          </div>
          <div style={{ color: "#4b5563", fontSize: "clamp(7px,1.5vw,9px)", marginBottom: "2.5rem", letterSpacing: 2 }}>
            {meta.subtitle}
          </div>
          <button
            onClick={handleTapToStart}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(9px,2vw,12px)",
              background: `${meta.color}20`,
              color: meta.color,
              border: `2px solid ${meta.color}`,
              padding: "0.9rem 2rem",
              cursor: "pointer",
              boxShadow: `0 0 24px ${meta.color}40`,
              animation: "pixelBlink 1.2s step-end infinite",
            }}
          >
            ▶ INICIAR
          </button>
        </div>
      </Screen>
    )
  }

  // ─── COUNTDOWN INTRO ────────────────────────────────────────────────────────
  if (introVisible && meta) {
    return (
      <Screen>
        <div style={{ textAlign: "center" }}>
          {/* Game badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: `${meta.color}15`,
            border: `2px solid ${meta.color}`,
            padding: "0.5rem 1.2rem",
            marginBottom: "1.5rem",
            boxShadow: `0 0 20px ${meta.color}30`,
          }}>
            <span style={{ fontSize: 22 }}>{meta.icon}</span>
            <span style={{ color: meta.color, fontSize: "clamp(9px,2vw,12px)" }}>{meta.title}</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(7px,1.5vw,9px)", marginBottom: "2rem", letterSpacing: 2 }}>
            {meta.subtitle}
          </div>

          {/* Big countdown number */}
          <div key={countdown} style={{
            fontSize: "clamp(80px,20vw,120px)",
            color: countdown === 0 ? "#22c55e" : meta.color,
            textShadow: `0 0 40px ${countdown === 0 ? "#22c55e" : meta.color}`,
            animation: "countdownPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            lineHeight: 1,
            marginBottom: "1rem",
          }}>
            {countdown === 0 ? "¡YA!" : countdown}
          </div>

          <div style={{ color: "#4b5563", fontSize: "clamp(7px,1.5vw,9px)", letterSpacing: 3 }}>
            {countdown > 0 ? "PREPÁRATE..." : "¡A JUGAR!"}
          </div>
        </div>
      </Screen>
    )
  }

  // ─── GAME ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a1a",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <GlobalStyles />

      {/* Star field */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {STARS.map(s => (
          <div key={s.id} style={{
            position: "absolute",
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            background: "white",
            borderRadius: "50%",
            animation: `starTwinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }} />
        ))}
        {/* Grid floor */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "perspective(400px) rotateX(60deg)",
          transformOrigin: "bottom",
          opacity: 0.3,
        }} />
      </div>

      {/* Scanlines overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {/* ── HEADER ── */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        height: 52,
        background: "rgba(13,13,43,0.95)",
        borderBottom: meta ? `2px solid ${meta.color}` : "2px solid #7c3aed",
        boxShadow: meta ? `0 2px 20px ${meta.color}20` : "0 2px 20px #7c3aed20",
        backdropFilter: "blur(8px)",
      }}>
        {/* Left: back */}
        <a
          href="/inicio-nino"
          style={{
            color: "#6b7280",
            fontSize: "clamp(7px,1.5vw,9px)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "white")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
        >
          ◀ SALIR
        </a>

        {/* Center: game title */}
        {meta && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "center" }}>
            <span style={{ fontSize: 16 }}>{meta.icon}</span>
            <div>
              <div style={{
                color: meta.color,
                fontSize: "clamp(8px,2vw,11px)",
                textShadow: `0 0 12px ${meta.color}`,
              }}>
                {meta.title}
              </div>
              <div style={{ color: "#374151", fontSize: "clamp(5px,1.2vw,7px)", marginTop: 1 }}>
                {assignment.activityTitle.toUpperCase().slice(0, 24)}
              </div>
            </div>
          </div>
        )}

        {/* Right: spacer */}
        <div style={{ width: 60 }} />
      </header>

      {/* ── GAME AREA ── */}
      <main style={{
        flex: 1,
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px,3vw,24px) clamp(8px,3vw,16px)",
        overflowY: "auto",
      }}>
        {/* Cabinet frame */}
        <div style={{
          width: "100%",
          maxWidth: 520,
          position: "relative",
        }}>
          {/* Top bezel */}
          {meta && (
            <div style={{
              background: `linear-gradient(90deg, transparent, ${meta.color}30, transparent)`,
              height: 3,
              borderRadius: "2px 2px 0 0",
              marginBottom: 0,
            }} />
          )}

          {/* Main card */}
          <div style={{
            background: "rgba(13,13,43,0.97)",
            border: meta ? `2px solid ${meta.color}60` : "2px solid #7c3aed60",
            borderTop: "none",
            boxShadow: meta
              ? `0 0 60px ${meta.color}20, 0 0 120px ${meta.color}08, inset 0 0 40px rgba(0,0,0,0.6)`
              : "0 0 60px #7c3aed20",
            padding: "clamp(12px,3vw,20px)",
          }}>
            {isMemory && (
              <MemoryFlipGame
                assignment={assignment}
                onFinished={() => { window.location.href = "/inicio-nino" }}
                onWon={() => {
                  musicAudio.current?.pause()
                  const win = new Audio("/music/win.mp3")
                  win.volume = 0.8
                  win.play().catch(() => {})
                }}
              />
            )}
            {isMatching && (
              <MatchingPairsGame
                assignment={assignment}
                onFinished={() => { window.location.href = "/inicio-nino" }}
                onWon={() => {
                  musicAudio.current?.pause()
                  const win = new Audio("/music/win.mp3")
                  win.volume = 0.8
                  win.play().catch(() => {})
                }}
              />
            )}
            {isSortRush && (
              <SortRushGame
                assignment={assignment}
                onFinished={() => { window.location.href = "/inicio-nino" }}
                onWon={() => {
                  musicAudio.current?.pause()
                  const win = new Audio("/music/win.mp3")
                  win.volume = 0.8
                  win.play().catch(() => {})
                }}
              />
            )}
          </div>

          {/* Bottom bezel */}
          {meta && (
            <div style={{
              background: `linear-gradient(90deg, transparent, ${meta.color}30, transparent)`,
              height: 3,
              borderRadius: "0 0 2px 2px",
            }} />
          )}

          {/* Corner screws */}
          {meta && ["topleft","topright","bottomleft","bottomright"].map(pos => (
            <div key={pos} style={{
              position: "absolute",
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#1f2937",
              border: `1px solid ${meta.color}40`,
              ...(pos === "topleft"     ? { top: 6,    left: 6    } : {}),
              ...(pos === "topright"    ? { top: 6,    right: 6   } : {}),
              ...(pos === "bottomleft"  ? { bottom: 6, left: 6    } : {}),
              ...(pos === "bottomright" ? { bottom: 6, right: 6   } : {}),
            }} />
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Shared screen wrapper for states ─────────────────────────────────────────
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Press Start 2P', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <GlobalStyles />
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {STARS.slice(0, 20).map(s => (
          <div key={s.id} style={{
            position: "absolute", left: s.left, top: s.top,
            width: s.size, height: s.size, background: "white", borderRadius: "50%",
            animation: `starTwinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay, opacity: 0.4,
          }} />
        ))}
      </div>
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  )
}

function BackBtn() {
  return (
    <a href="/inicio-nino" style={{
      display: "inline-block",
      fontFamily: "'Press Start 2P', monospace",
      fontSize: "clamp(7px,1.5vw,9px)",
      color: "#60a5fa",
      textDecoration: "none",
      border: "1px solid #1d4ed8",
      padding: "0.5rem 1rem",
      transition: "all 0.2s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1d4ed820" }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
    >
      ◀ VOLVER AL INICIO
    </a>
  )
}

// ─── Global keyframes injected once ───────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

      @keyframes pixelBlink {
        0%,100% { opacity: 1; }
        50%      { opacity: 0; }
      }
      @keyframes float {
        0%,100% { transform: translateY(0);   }
        50%     { transform: translateY(-10px); }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-8px); }
        40%     { transform: translateX(8px); }
        60%     { transform: translateX(-5px); }
        80%     { transform: translateX(5px); }
      }
      @keyframes starTwinkle {
        0%,100% { opacity: 0.15; transform: scale(1);   }
        50%     { opacity: 0.9;  transform: scale(1.6); }
      }
      @keyframes countdownPop {
        0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
        70%  { transform: scale(1.15) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); }
      }
    `}</style>
  )
}