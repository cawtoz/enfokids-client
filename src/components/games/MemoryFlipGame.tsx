"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import type { Assignment } from "@/types/assignment"
import { AssignmentStatus } from "@/types/assignment"

const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

// ─── Data ────────────────────────────────────────────────────────────────────
const CARD_DATA = [
  { emoji: "🧠", color: "#a78bfa", label: "cerebro" },
  { emoji: "⭐", color: "#fbbf24", label: "estrella" },
  { emoji: "🎯", color: "#f87171", label: "diana"   },
  { emoji: "🦋", color: "#f472b6", label: "mariposa"},
  { emoji: "🌈", color: "#60a5fa", label: "arcoíris"},
  { emoji: "🔮", color: "#c084fc", label: "bola"    },
  { emoji: "🎨", color: "#34d399", label: "paleta"  },
  { emoji: "🏆", color: "#fbbf24", label: "trofeo"  },
]

interface Card {
  id: number
  emoji: string
  color: string
  flipped: boolean
  matched: boolean
  wrong: boolean   // brief red flash on mismatch
}

interface Particle {
  id: number; x: number; y: number
  vx: number; vy: number
  color: string; size: number; life: number
}

interface Props {
  assignment: Assignment
  onFinished: () => void
  onWon?: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}


function buildCards(): Card[] {
  return shuffle(
    CARD_DATA.flatMap((d, i) => [
      { id: i * 2,     emoji: d.emoji, color: d.color, flipped: false, matched: false, wrong: false },
      { id: i * 2 + 1, emoji: d.emoji, color: d.color, flipped: false, matched: false, wrong: false },
    ])
  )
}

// ─── Particle hook ────────────────────────────────────────────────────────────
function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([])
  const next = useRef(0)

  const burst = useCallback((x: number, y: number, color: string, n = 14) => {
    const ps: Particle[] = Array.from({ length: n }, () => ({
      id: next.current++, x, y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.9) * 7,
      color, size: 4 + Math.random() * 5, life: 1,
    }))
    setParticles(p => [...p, ...ps])
  }, [])

  useEffect(() => {
    if (!particles.length) return
    const id = requestAnimationFrame(() =>
      setParticles(p =>
        p.map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, vy: pt.vy + 0.35, life: pt.life - 0.045 }))
         .filter(pt => pt.life > 0)
      )
    )
    return () => cancelAnimationFrame(id)
  }, [particles])

  return { particles, burst }
}

// ─── Rating logic ─────────────────────────────────────────────────────────────
function getRating(moves: number, total: number) {
  const ratio = moves / total          // moves per pair
  if (ratio <= 1.4) return { stars: 3, label: "¡PERFECTO!", color: "#fbbf24" }
  if (ratio <= 2.2) return { stars: 2, label: "¡MUY BIEN!", color: "#60a5fa" }
  return { stars: 1, label: "¡LO LOGRASTE!", color: "#a78bfa" }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MemoryFlipGame({ assignment, onFinished, onWon }: Props) {
  const [cards, setCards] = useState<Card[]>(buildCards)
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [finished, setFinished] = useState(false)
  const [lastMatch, setLastMatch] = useState<string | null>(null)  // emoji flash
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const coinAudio    = useRef<HTMLAudioElement | null>(null)
  const { particles, burst } = useParticles()

  useEffect(() => {
    const a = new Audio("/music/coin.mp3")
    a.volume = 0.8
    a.load()
    coinAudio.current = a
  }, [])

  const total = CARD_DATA.length
  const matched = cards.filter(c => c.matched).length / 2

  // Timer
  useEffect(() => {
    if (finished) return
    const t = setInterval(() => setTimer(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [finished])

  // Finish check
  useEffect(() => {
    if (matched === total && total > 0) setTimeout(() => { setFinished(true); onWon?.() }, 600)
  }, [matched, total])

  // Auto-save progress when finished
  useEffect(() => {
    if (!finished) return
    setSaving(true)
    const today = new Date().toISOString().split("T")[0]
    api.post("progress", {
      assignmentId: assignment.id,
      notes: "",
      date: `${today}T00:00:00`,
      completed: true,
    })
      .then(() => api.get<{ id: number; completed: boolean }[]>("progress", { params: { assignmentId: assignment.id } }))
      .then(res => {
        const count = res.data.length
        const newStatus = count >= assignment.repetitions
          ? AssignmentStatus.COMPLETED
          : AssignmentStatus.IN_PROGRESS
        return api.put(`assignments/${assignment.id}`, {
          therapistId: assignment.therapistId,
          childId: assignment.childId,
          activityId: assignment.activityId,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          frequencyUnit: assignment.frequencyUnit,
          frequencyCount: assignment.frequencyCount,
          repetitions: assignment.repetitions,
          estimatedDuration: assignment.estimatedDuration,
          status: newStatus,
        })
      })
      .then(() => { setSaving(false); setTimeout(onFinished, 2500) })
      .catch(() => { setSaving(false); setSaveError(true) })
  }, [finished])

  const getCardCenter = (id: number): { x: number; y: number } => {
    if (!containerRef.current) return { x: 150, y: 200 }
    const el = containerRef.current.querySelector(`[data-cid="${id}"]`)
    if (!el) return { x: 150, y: 200 }
    const r = el.getBoundingClientRect()
    const c = containerRef.current.getBoundingClientRect()
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 }
  }

  const flip = useCallback((id: number) => {
    if (locked) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    const newSel = [...selected, id]
    setCards(newCards)

    if (newSel.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [a, b] = newSel.map(sid => newCards.find(c => c.id === sid)!)

      if (a.emoji === b.emoji) {
        // ✅ Match
        if (coinAudio.current) { coinAudio.current.currentTime = 0; coinAudio.current.play().catch(() => {}) }
        const newCombo = combo + 1
        setCombo(newCombo)
        if (newCombo > bestCombo) setBestCombo(newCombo)
        setLastMatch(a.emoji)
        setTimeout(() => setLastMatch(null), 900)

        // Burst from both
        const pa = getCardCenter(newSel[0])
        const pb = getCardCenter(newSel[1])
        burst(pa.x, pa.y, a.color, 18)
        burst(pb.x, pb.y, a.color, 18)

        setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c))
        setSelected([])
        setLocked(false)
      } else {
        // ❌ Miss
        setCombo(0)
        setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, wrong: true } : c))
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSel.includes(c.id) ? { ...c, flipped: false, wrong: false } : c
          ))
          setSelected([])
          setLocked(false)
        }, 900)
      }
    } else {
      setSelected(newSel)
    }
  }, [cards, selected, locked, combo, bestCombo, burst])

  const restart = () => {
    setCards(buildCards())
    setSelected([])
    setMoves(0)
    setTimer(0)
    setLocked(false)
    setFinished(false)
    setCombo(0)
    setBestCombo(0)
    setLastMatch(null)
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const pct = Math.round((matched / total) * 100)
  const rating = getRating(moves, total)

  // ─── FINISHED ───────────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          @keyframes starPop { 0%{transform:scale(0) rotate(-30deg);opacity:0} 70%{transform:scale(1.4) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
          @keyframes winFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        <div style={{
          background: "linear-gradient(135deg, #0d0d2b 0%, #1a0a2e 100%)",
          border: "3px solid #22c55e",
          boxShadow: "0 0 40px #22c55e30, inset 0 0 60px rgba(0,0,0,0.5)",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 52, animation: "winFloat 2s ease-in-out infinite", marginBottom: "0.75rem" }}>
            🏆
          </div>

          <div style={{ color: rating.color, fontSize: "clamp(10px,2.5vw,13px)", marginBottom: "0.4rem", textShadow: `0 0 20px ${rating.color}` }}>
            {rating.label}
          </div>

          {/* Stars */}
          <div style={{ fontSize: 28, letterSpacing: 10, marginBottom: "1rem" }}>
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} style={{
                color: i < rating.stars ? "#fbbf24" : "#1f2937",
                display: "inline-block",
                animation: i < rating.stars ? `starPop ${0.3 + i * 0.18}s ease both` : "none",
                filter: i < rating.stars ? "drop-shadow(0 0 6px #fbbf24)" : "none",
              }}>★</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1.25rem" }}>
            {[
              { label: "TIEMPO",  value: `${mm}:${ss}`, color: "#60a5fa" },
              { label: "MOVS",    value: moves,          color: "#f472b6" },
              { label: "COMBO",   value: `×${bestCombo}`,color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${s.color}40`,
                padding: "0.6rem 0.4rem",
              }}>
                <div style={{ color: s.color, fontSize: "clamp(6px,1.5vw,8px)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "white", fontSize: "clamp(11px,3vw,16px)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Auto-save status */}
          <div style={{ marginBottom: "1rem" }}>
            {saving && (
              <div style={{ color: "#a78bfa", fontSize: "clamp(7px,1.8vw,9px)", textAlign: "center", textShadow: "0 0 10px #a78bfa" }}>
                GUARDANDO PROGRESO...
              </div>
            )}
            {!saving && !saveError && (
              <div style={{ color: "#22c55e", fontSize: "clamp(7px,1.8vw,9px)", textAlign: "center", textShadow: "0 0 10px #22c55e" }}>
                ✓ PROGRESO GUARDADO — VOLVIENDO...
              </div>
            )}
            {saveError && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ color: "#f87171", fontSize: "clamp(7px,1.8vw,9px)", textAlign: "center" }}>
                  ✗ ERROR AL GUARDAR
                </div>
                <button
                  onClick={onFinished}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(7px,1.8vw,9px)", background: "#7c3aed", color: "white", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  CONTINUAR →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    )
  }

  // ─── GAME ───────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: "'Press Start 2P', monospace", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .mem-card-wrap {
          perspective: 500px;
          aspect-ratio: 1;
          cursor: pointer;
        }
        .mem-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mem-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .mem-card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-width: 2px;
          border-style: solid;
          border-radius: 4px;
          overflow: hidden;
        }
        .mem-card-back {
          /* shown when not flipped */
        }
        .mem-card-front {
          transform: rotateY(180deg);
        }

        /* Back pattern */
        .mem-card-back::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px);
        }
        /* Shine on front */
        .mem-card-front::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Scanlines */
        .mem-card-front::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
          pointer-events: none;
          z-index: 1;
        }

        @keyframes wrongShake {
          0%,100% { transform: rotateY(180deg) translateX(0); }
          25%      { transform: rotateY(180deg) translateX(-5px) rotate(-2deg); }
          75%      { transform: rotateY(180deg) translateX(5px) rotate(2deg); }
        }
        .shake { animation: wrongShake 0.45s ease; }

        @keyframes matchGlow {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
          60%  { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .matched-pulse { animation: matchGlow 0.7s ease forwards; }

        @keyframes emojiPop {
          0%   { transform: scale(0.3) translateY(10px); opacity: 0; }
          60%  { transform: scale(1.3) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .emoji-pop { animation: emojiPop 0.35s ease forwards; }

        @keyframes lastMatchFade {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.6); }
        }
        .last-match-flash { animation: lastMatchFade 0.9s ease forwards; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .xp-bar {
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
      `}</style>

      {/* Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: p.x, top: p.y,
            width: p.size, height: p.size,
            borderRadius: p.id % 2 === 0 ? "50%" : "2px",
            background: p.color,
            opacity: p.life,
            transform: `rotate(${p.life * 540}deg)`,
            boxShadow: `0 0 3px ${p.color}`,
          }} />
        ))}
      </div>

      {/* Last match emoji float */}
      {lastMatch && (
        <div className="last-match-flash" style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 48,
          zIndex: 60,
          pointerEvents: "none",
        }}>
          {lastMatch}
        </div>
      )}

      {/* ── HUD ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 6,
        marginBottom: "0.6rem",
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(99,102,241,0.35)",
        padding: "0.45rem 0.7rem",
      }}>
        <div style={{ color: "#60a5fa", fontSize: "clamp(7px,1.8vw,10px)" }}>
          ⏱ {mm}:{ss}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#22c55e", fontSize: "clamp(9px,2.2vw,12px)", textShadow: "0 0 8px #22c55e" }}>
            {matched}/{total}
          </div>
          <div style={{ color: "#374151", fontSize: "clamp(5px,1.2vw,7px)", marginTop: 1 }}>PARES</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            color: combo >= 4 ? "#fbbf24" : combo >= 2 ? "#f472b6" : "#4b5563",
            fontSize: "clamp(7px,1.8vw,10px)",
            transition: "color 0.3s",
            textShadow: combo >= 2 ? "0 0 8px currentColor" : "none",
          }}>
            ×{combo} COMBO
          </div>
          <div style={{ color: "#374151", fontSize: "clamp(5px,1.2vw,7px)", marginTop: 1 }}>
            {moves} MOVS
          </div>
        </div>
      </div>

      {/* ── XP bar ── */}
      <div style={{ marginBottom: "0.6rem" }}>
        <div style={{
          height: 18,
          background: "rgba(0,0,0,0.6)",
          border: "2px solid #7c3aed",
          position: "relative",
          overflow: "hidden",
        }}>
          <div className="xp-bar" style={{
            height: "100%",
            width: `${pct}%`,
            transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            background: pct >= 80
              ? "linear-gradient(90deg,#22c55e,#86efac,#22c55e)"
              : pct >= 50
              ? "linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)"
              : "linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)",
          }} />
          <span style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(6px,1.4vw,7px)",
            color: "white", mixBlendMode: "difference",
          }}>{pct}%</span>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "clamp(4px, 1.2vw, 8px)",
      }}>
        {cards.map(card => {
          const isFlipped = card.flipped || card.matched
          return (
            <div
              key={card.id}
              data-cid={card.id}
              className="mem-card-wrap"
              onClick={() => flip(card.id)}
            >
              <div className={`mem-card-inner ${isFlipped ? "flipped" : ""} ${card.wrong ? "shake" : ""} ${card.matched ? "matched-pulse" : ""}`}>

                {/* Back face */}
                <div className="mem-card-face mem-card-back" style={{
                  background: "#0d0d2b",
                  borderColor: "rgba(99,102,241,0.5)",
                  boxShadow: "inset 0 0 12px rgba(99,102,241,0.1)",
                }}>
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "clamp(10px,2.5vw,14px)",
                    color: "rgba(99,102,241,0.5)",
                  }}>?</span>
                </div>

                {/* Front face */}
                <div className={`mem-card-face mem-card-front ${card.matched ? "matched-pulse" : ""}`} style={{
                  background: card.matched
                    ? `${card.color}18`
                    : card.wrong
                    ? "#ef444420"
                    : `${card.color}15`,
                  borderColor: card.matched
                    ? card.color
                    : card.wrong
                    ? "#ef4444"
                    : card.color,
                  boxShadow: card.matched
                    ? `0 0 14px ${card.color}60`
                    : card.wrong
                    ? "0 0 14px #ef444450"
                    : `0 0 8px ${card.color}30`,
                }}>
                  {/* Matched checkmark badge */}
                  {card.matched && (
                    <span style={{
                      position: "absolute",
                      top: 3, right: 4,
                      fontSize: 9,
                      color: card.color,
                      fontFamily: "system-ui",
                      zIndex: 2,
                    }}>✓</span>
                  )}

                  <span
                    className={card.matched ? "emoji-pop" : ""}
                    style={{
                      fontSize: "clamp(20px, 5vw, 30px)",
                      filter: card.matched ? `drop-shadow(0 0 6px ${card.color})` : "none",
                      zIndex: 2,
                      position: "relative",
                    }}
                  >
                    {card.emoji}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stars indicator */}
      <div style={{ textAlign: "center", marginTop: "0.6rem", letterSpacing: 8, fontSize: 16 }}>
        {Array.from({ length: 3 }, (_, i) => {
          const earned = getRating(moves || 999, total).stars
          const lit = moves === 0 ? true : i < earned
          return (
            <span key={i} style={{
              color: lit ? "#fbbf24" : "#1f2937",
              transition: "color 0.5s",
              filter: lit ? "drop-shadow(0 0 4px #fbbf24)" : "none",
            }}>★</span>
          )
        })}
      </div>

      {/* Restart */}
      <button
        onClick={restart}
        style={{
          display: "block",
          width: "100%",
          marginTop: "0.5rem",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(6px,1.5vw,8px)",
          background: "transparent",
          color: "#374151",
          border: "1px solid #1f2937",
          padding: "0.5rem",
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.color = "#6b7280"; (e.target as HTMLElement).style.borderColor = "#374151" }}
        onMouseLeave={e => { (e.target as HTMLElement).style.color = "#374151"; (e.target as HTMLElement).style.borderColor = "#1f2937" }}
      >
        ↺ REINICIAR
      </button>
    </div>
  )
}