"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import type { Assignment } from "@/types/assignment"
import { AssignmentStatus } from "@/types/assignment"

const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

// ─── Data ────────────────────────────────────────────────────────────────────
const PAIRS = [
  { left: "🐶 Perro",     right: "Mascota fiel",     color: "#f472b6" },
  { left: "🌞 Sol",       right: "Da luz y calor",   color: "#fbbf24" },
  { left: "📚 Libro",     right: "Para aprender",    color: "#60a5fa" },
  { left: "🎵 Música",    right: "Sonidos bonitos",  color: "#a78bfa" },
  { left: "🍎 Manzana",   right: "Fruta roja",       color: "#f87171" },
  { left: "🚀 Cohete",    right: "Viaja al espacio", color: "#34d399" },
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface Card {
  id: string        // "left-0" | "right-0" etc.
  pairId: number
  text: string
  side: "left" | "right"
  color: string
  state: "idle" | "selected" | "matched" | "wrong"
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

interface Props {
  assignment: Assignment
  onFinished: () => void
  onWon?: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}


// ─── Particle system ─────────────────────────────────────────────────────────
function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([])
  const nextId = useRef(0)

  const burst = useCallback((x: number, y: number, color: string, count = 16) => {
    const ps: Particle[] = Array.from({ length: count }, () => ({
      id: nextId.current++,
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.8) * 7,
      color,
      size: 4 + Math.random() * 6,
      life: 1,
      maxLife: 0.7 + Math.random() * 0.5,
    }))
    setParticles(prev => [...prev, ...ps])
  }, [])

  useEffect(() => {
    if (particles.length === 0) return
    const id = requestAnimationFrame(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.3, life: p.life - 0.04 }))
          .filter(p => p.life > 0)
      )
    })
    return () => cancelAnimationFrame(id)
  }, [particles])

  return { particles, burst }
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MatchingPairsGame({ assignment, onFinished, onWon }: Props) {
  const makeCards = (): { left: Card[]; right: Card[] } => ({
    left: PAIRS.map((p, i) => ({
      id: `left-${i}`, pairId: i, text: p.left, side: "left", color: p.color, state: "idle",
    })),
    right: shuffle(PAIRS.map((p, i) => ({
      id: `right-${i}`, pairId: i, text: p.right, side: "right", color: p.color, state: "idle",
    }))),
  })

  const [cards, setCards] = useState(makeCards)
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [finished, setFinished] = useState(false)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [shakeId, setShakeId] = useState<string | null>(null)
  const [stars, setStars] = useState(3)
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

  // Timer
  useEffect(() => {
    if (finished) return
    const t = setInterval(() => setTimer(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [finished])

  // Reduce stars based on time
  useEffect(() => {
    if (timer >= 90) setStars(1)
    else if (timer >= 50) setStars(2)
  }, [timer])

  // Finish check
  useEffect(() => {
    if (score === PAIRS.length) {
      setTimeout(() => { setFinished(true); onWon?.() }, 600)
    }
  }, [score])

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

  const getCardPos = (cardId: string): { x: number; y: number } => {
    if (!containerRef.current) return { x: 300, y: 300 }
    const el = containerRef.current.querySelector(`[data-card-id="${cardId}"]`)
    if (!el) return { x: 300, y: 300 }
    const rect = el.getBoundingClientRect()
    const container = containerRef.current.getBoundingClientRect()
    return {
      x: rect.left - container.left + rect.width / 2,
      y: rect.top - container.top + rect.height / 2,
    }
  }

  const updateCard = (id: string, state: Card["state"]) => {
    setCards(prev => ({
      left: prev.left.map(c => c.id === id ? { ...c, state } : c),
      right: prev.right.map(c => c.id === id ? { ...c, state } : c),
    }))
  }

  const handleLeft = (pairId: number) => {
    const card = cards.left[pairId]
    if (card.state === "matched") return
    // Deselect if already selected
    if (selectedLeft === pairId) {
      setSelectedLeft(null)
      updateCard(card.id, "idle")
      return
    }
    // Clear previous left selection
    if (selectedLeft !== null) {
      updateCard(`left-${selectedLeft}`, "idle")
    }
    setSelectedLeft(pairId)
    updateCard(card.id, "selected")
  }

  const handleRight = (pairId: number) => {
    const card = cards.right.find(c => c.pairId === pairId)
    if (!card || card.state === "matched") return
    if (selectedLeft === null) return

    const leftCard = cards.left[selectedLeft]

    if (selectedLeft === pairId) {
      // ✅ Match!
      if (coinAudio.current) { coinAudio.current.currentTime = 0; coinAudio.current.play().catch(() => {}) }
      const newCombo = combo + 1
      setCombo(newCombo)
      if (newCombo > bestCombo) setBestCombo(newCombo)
      setScore(s => s + 1)

      // Burst from both cards
      const lp = getCardPos(leftCard.id)
      const rp = getCardPos(card.id)
      burst(lp.x, lp.y, card.color, 20)
      burst(rp.x, rp.y, card.color, 20)

      setCards(prev => ({
        left: prev.left.map(c => c.id === leftCard.id ? { ...c, state: "matched" } : c),
        right: prev.right.map(c => c.id === card.id ? { ...c, state: "matched" } : c),
      }))
      setSelectedLeft(null)
    } else {
      // ❌ Wrong
      setCombo(0)
      setShakeId(leftCard.id)
      setCards(prev => ({
        left: prev.left.map(c => c.id === leftCard.id ? { ...c, state: "wrong" } : c),
        right: prev.right.map(c => c.id === card.id ? { ...c, state: "wrong" } : c),
      }))
      setTimeout(() => {
        setCards(prev => ({
          left: prev.left.map(c => c.id === leftCard.id ? { ...c, state: "idle" } : c),
          right: prev.right.map(c => c.id === card.id ? { ...c, state: "idle" } : c),
        }))
        setShakeId(null)
        setSelectedLeft(null)
      }, 700)
    }
  }


  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")
  const progressPct = Math.round((score / PAIRS.length) * 100)

  // ─── FINISHED SCREEN ────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@700;900&display=swap');`}</style>
        <div style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 50%, #0a2e1a 100%)",
          border: "3px solid #22c55e",
          boxShadow: "0 0 40px #22c55e40, inset 0 0 60px rgba(0,0,0,0.5)",
          padding: "2rem",
          textAlign: "center",
        }}>
          {/* Stars */}
          <div style={{ fontSize: 48, marginBottom: "1rem", letterSpacing: 8 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} style={{
                display: "inline-block",
                color: i < stars ? "#fbbf24" : "#374151",
                filter: i < stars ? "drop-shadow(0 0 8px #fbbf24)" : "none",
                animation: i < stars ? `starPop ${0.3 + i * 0.15}s ease both` : "none",
              }}>★</span>
            ))}
          </div>

          <div style={{ color: "#22c55e", fontSize: "clamp(10px, 2.5vw, 14px)", marginBottom: "0.5rem", textShadow: "0 0 20px #22c55e" }}>
            ¡MISIÓN COMPLETADA!
          </div>
          <div style={{ color: "white", fontSize: "clamp(8px, 2vw, 11px)", marginBottom: "1.5rem", opacity: 0.7 }}>
            {assignment.activityTitle}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "1.5rem" }}>
            {[
              { label: "TIEMPO", value: `${mm}:${ss}`, color: "#60a5fa" },
              { label: "PARES", value: `${score}/${PAIRS.length}`, color: "#22c55e" },
              { label: "COMBO", value: `x${bestCombo}`, color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${s.color}40`,
                padding: "0.75rem 0.5rem",
              }}>
                <div style={{ color: s.color, fontSize: "clamp(6px, 1.5vw, 8px)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "white", fontSize: "clamp(12px, 3vw, 18px)" }}>{s.value}</div>
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
        <style>{`
          @keyframes starPop {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            70% { transform: scale(1.3) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // ─── GAME SCREEN ────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: "'Press Start 2P', monospace", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@700;900&display=swap');

        .match-card {
          position: relative;
          width: 100%;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          border-width: 2px;
          border-style: solid;
          padding: 0.65rem 0.5rem;
          text-align: center;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: clamp(11px, 2.2vw, 14px);
          line-height: 1.3;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .match-card:hover:not(.card-matched):not(.card-wrong) {
          transform: scale(1.04);
        }
        .match-card.card-selected {
          transform: scale(1.06);
          z-index: 2;
        }
        .match-card.card-matched {
          cursor: default;
        }
        .match-card.card-wrong {
          animation: cardShake 0.5s ease;
        }
        .match-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Scanline texture */
        .match-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
          pointer-events: none;
        }

        @keyframes cardShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-2deg); }
          40% { transform: translateX(6px) rotate(2deg); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes matchPulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .card-matched-anim {
          animation: matchPulse 0.6s ease forwards;
        }
        @keyframes comboFlash {
          0% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1.6) translateY(-20px); }
        }
        .combo-flash {
          animation: comboFlash 0.8s ease forwards;
        }

        /* XP shimmer */
        .xp-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .hud-glow {
          text-shadow: 0 0 10px currentColor;
        }
      `}</style>

      {/* ── Particle canvas ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: p.color,
              opacity: p.life,
              transform: `rotate(${p.life * 360}deg)`,
              boxShadow: `0 0 4px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* ── HUD ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 8,
        marginBottom: "0.75rem",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(99,102,241,0.4)",
        padding: "0.5rem 0.75rem",
      }}>
        {/* Timer */}
        <div style={{ color: "#60a5fa", fontSize: "clamp(8px, 2vw, 11px)" }} className="hud-glow">
          ⏱ {mm}:{ss}
        </div>

        {/* Score center */}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#fbbf24", fontSize: "clamp(10px, 2.5vw, 13px)" }} className="hud-glow">
            {score}/{PAIRS.length}
          </div>
          <div style={{ color: "#6b7280", fontSize: "clamp(6px, 1.5vw, 8px)", marginTop: 2 }}>PARES</div>
        </div>

        {/* Combo right */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            color: combo >= 3 ? "#fbbf24" : combo >= 2 ? "#f472b6" : "#6b7280",
            fontSize: "clamp(8px, 2vw, 11px)",
            transition: "color 0.3s",
          }} className="hud-glow">
            COMBO x{combo}
          </div>
          <div style={{ color: "#374151", fontSize: "clamp(5px, 1.2vw, 7px)", marginTop: 2 }}>
            BEST x{bestCombo}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{
          height: 20,
          background: "rgba(0,0,0,0.6)",
          border: "2px solid #7c3aed",
          position: "relative",
          overflow: "hidden",
        }}>
          <div
            className="xp-shimmer"
            style={{
              height: "100%",
              width: `${progressPct}%`,
              transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: progressPct >= 80
                ? "linear-gradient(90deg, #22c55e, #86efac, #22c55e)"
                : progressPct >= 50
                ? "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)"
                : "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
            }}
          />
          <span style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(6px, 1.5vw, 8px)",
            color: "white",
            mixBlendMode: "difference",
          }}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* ── Instruction ── */}
      <div style={{
        textAlign: "center",
        color: "#6b7280",
        fontSize: "clamp(6px, 1.5vw, 8px)",
        marginBottom: "0.75rem",
        letterSpacing: 1,
      }}>
        {selectedLeft !== null
          ? "▶ AHORA ELIGE LA COLUMNA DERECHA"
          : "▶ ELIGE UN ELEMENTO DE LA IZQUIERDA"}
      </div>

      {/* ── Cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {cards.left.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              isSelected={selectedLeft === card.pairId}
              onClick={() => handleLeft(card.pairId)}
            />
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {cards.right.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              isSelected={false}
              onClick={() => handleRight(card.pairId)}
            />
          ))}
        </div>
      </div>

      {/* Stars indicator */}
      <div style={{ textAlign: "center", marginTop: "0.75rem", letterSpacing: 6, fontSize: 18 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} style={{
            color: i < stars ? "#fbbf24" : "#1f2937",
            transition: "color 0.5s",
            filter: i < stars ? "drop-shadow(0 0 4px #fbbf24)" : "none",
          }}>
            ★
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Individual card ──────────────────────────────────────────────────────────
function GameCard({
  card,
  isSelected,
  onClick,
}: {
  card: Card
  isSelected: boolean
  onClick: () => void
}) {
  const stateStyles = (): React.CSSProperties => {
    if (card.state === "matched") {
      return {
        background: `${card.color}18`,
        borderColor: card.color,
        color: card.color,
        boxShadow: `0 0 16px ${card.color}50`,
        opacity: 0.75,
      }
    }
    if (card.state === "wrong") {
      return {
        background: "#ef444420",
        borderColor: "#ef4444",
        color: "#fca5a5",
        boxShadow: "0 0 16px #ef444450",
      }
    }
    if (isSelected || card.state === "selected") {
      return {
        background: `${card.color}25`,
        borderColor: card.color,
        color: card.color,
        boxShadow: `0 0 20px ${card.color}60, 0 0 40px ${card.color}20`,
      }
    }
    return {
      background: "rgba(15, 10, 40, 0.8)",
      borderColor: "rgba(99, 102, 241, 0.4)",
      color: "rgba(255,255,255,0.85)",
      boxShadow: "none",
    }
  }

  return (
    <button
      data-card-id={card.id}
      className={`match-card ${card.state === "wrong" ? "card-wrong" : ""} ${card.state === "matched" ? `card-matched card-matched-anim` : ""} ${isSelected ? "card-selected" : ""}`}
      onClick={onClick}
      disabled={card.state === "matched"}
      style={stateStyles()}
    >
      {/* Matched checkmark */}
      {card.state === "matched" && (
        <span style={{
          position: "absolute",
          top: 4,
          right: 6,
          fontSize: 10,
          color: card.color,
          fontFamily: "system-ui",
        }}>✓</span>
      )}

      {/* Wrong X */}
      {card.state === "wrong" && (
        <span style={{
          position: "absolute",
          top: 4,
          right: 6,
          fontSize: 10,
          color: "#ef4444",
          fontFamily: "system-ui",
        }}>✗</span>
      )}

      <span>{card.text}</span>
    </button>
  )
}