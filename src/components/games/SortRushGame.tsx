"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import type { Assignment } from "@/types/assignment"
import { AssignmentStatus } from "@/types/assignment"

const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

// ─── Game data ────────────────────────────────────────────────────────────────
const ROUNDS = [
  {
    leftLabel:  "🐾 ANIMALES",
    rightLabel: "🍎 FRUTAS",
    leftItems:  ["🐶","🐱","🦋","🐸","🐦","🐠","🐘","🦊"],
    rightItems: ["🍎","🍊","🍋","🍇","🍓","🍑","🥭","🍉"],
    color: "#34d399",
  },
  {
    leftLabel:  "🚗 VEHÍCULOS",
    rightLabel: "👕 ROPA",
    leftItems:  ["🚗","✈️","🚂","🚢","🚁","🏍️","🚌","🚀"],
    rightItems: ["👕","👗","👟","🧢","🧣","👒","👔","🧤"],
    color: "#60a5fa",
  },
  {
    leftLabel:  "🍕 COMIDA",
    rightLabel: "🔧 OBJETOS",
    leftItems:  ["🍕","🍔","🍟","🌮","🍜","🍣","🍩","🍦"],
    rightItems: ["🔧","📱","💻","🎸","📚","⚽","🔑","✂️"],
    color: "#f472b6",
  },
]

const ITEMS_PER_ROUND = 8
const MAX_LIVES       = 3
const FALL_DURATIONS  = [5, 3.5, 2.5]  // seconds per item, gets faster

interface Item { emoji: string; side: "left" | "right" }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildItems(roundIdx: number): Item[] {
  const r     = ROUNDS[roundIdx]
  const left  = shuffle(r.leftItems).slice(0, ITEMS_PER_ROUND / 2).map(e => ({ emoji: e, side: "left"  as const }))
  const right = shuffle(r.rightItems).slice(0, ITEMS_PER_ROUND / 2).map(e => ({ emoji: e, side: "right" as const }))
  return shuffle([...left, ...right])
}

// ─── Particles ───────────────────────────────────────────────────────────────
interface Particle { id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }

function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([])
  const next = useRef(0)

  const burst = useCallback((x: number, y: number, color: string, n = 14) => {
    const ps = Array.from({ length: n }, () => ({
      id: next.current++, x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.9) * 7,
      color, size: 4 + Math.random() * 5, life: 1,
    }))
    setParticles(p => [...p, ...ps])
  }, [])

  useEffect(() => {
    if (!particles.length) return
    const id = requestAnimationFrame(() =>
      setParticles(p =>
        p.map(pt => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, vy: pt.vy + 0.3, life: pt.life - 0.04 }))
         .filter(pt => pt.life > 0)
      )
    )
    return () => cancelAnimationFrame(id)
  }, [particles])

  return { particles, burst }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  assignment: Assignment
  onFinished: () => void
  onWon?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────
export function SortRushGame({ assignment, onFinished, onWon }: Props) {
  const [round,      setRound]      = useState(0)
  const [items,      setItems]      = useState<Item[]>(() => buildItems(0))
  const [itemIdx,    setItemIdx]    = useState(0)
  const [itemKey,    setItemKey]    = useState(0)   // forces CSS animation restart
  const [lives,      setLives]      = useState(MAX_LIVES)
  const [score,      setScore]      = useState(0)
  const [combo,      setCombo]      = useState(0)
  const [bestCombo,  setBestCombo]  = useState(0)
  const [timer,      setTimer]      = useState(0)
  const [phase,      setPhase]      = useState<"playing" | "switch" | "finished">("playing")
  const [gameWon,    setGameWon]    = useState(false)   // true = completed all rounds
  const [feedback,   setFeedback]   = useState<"correct" | "wrong" | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const coinAudio    = useRef<HTMLAudioElement | null>(null)
  const handledRef   = useRef(false)   // prevent double-fire on onAnimationEnd
  const { particles, burst } = useParticles()

  useEffect(() => {
    const a = new Audio("/music/coin.mp3")
    a.volume = 0.8; a.load()
    coinAudio.current = a
  }, [])

  // Game timer
  useEffect(() => {
    if (phase !== "playing") return
    const t = setInterval(() => setTimer(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // Auto-save when finished
  useEffect(() => {
    if (phase !== "finished") return
    if (gameWon) onWon?.()
    setSaving(true)
    const today = new Date().toISOString().split("T")[0]
    api.post("progress", {
      assignmentId: assignment.id,
      notes: gameWon ? "" : "Intento sin completar",
      date: `${today}T00:00:00`,
      completed: gameWon,
    })
      .then(() => api.get<{ id: number }[]>("progress", { params: { assignmentId: assignment.id } }))
      .then(res => {
        const count = res.data.length
        const newStatus = count >= assignment.repetitions
          ? AssignmentStatus.COMPLETED
          : AssignmentStatus.IN_PROGRESS
        return api.put(`assignments/${assignment.id}`, {
          therapistId:       assignment.therapistId,
          childId:           assignment.childId,
          activityId:        assignment.activityId,
          startDate:         assignment.startDate,
          endDate:           assignment.endDate,
          frequencyUnit:     assignment.frequencyUnit,
          frequencyCount:    assignment.frequencyCount,
          repetitions:       assignment.repetitions,
          estimatedDuration: assignment.estimatedDuration,
          status:            newStatus,
        })
      })
      .then(() => { setSaving(false); setTimeout(onFinished, 2500) })
      .catch(() => { setSaving(false); setSaveError(true) })
  }, [phase])

  const currentItem  = items[itemIdx]
  const roundData    = ROUNDS[round]
  const fallDuration = FALL_DURATIONS[Math.min(round, FALL_DURATIONS.length - 1)]

  // Advance to next item (or next round / finish)
  const advance = useCallback((currentRound: number, currentItemIdx: number, currentItems: Item[]) => {
    handledRef.current = false
    const nextIdx = currentItemIdx + 1
    setItemKey(k => k + 1)

    if (nextIdx >= currentItems.length) {
      const nextRound = currentRound + 1
      if (nextRound >= ROUNDS.length) {
        setGameWon(true)
        setPhase("finished")
      } else {
        setPhase("switch")
        setTimeout(() => {
          setRound(nextRound)
          setItems(buildItems(nextRound))
          setItemIdx(0)
          setItemKey(k => k + 1)
          setPhase("playing")
        }, 2200)
      }
    } else {
      setItemIdx(nextIdx)
    }
  }, [])

  // Called when item reaches bottom (miss)
  const handleMiss = useCallback(() => {
    if (handledRef.current || phase !== "playing") return
    handledRef.current = true
    setCombo(0)
    setFeedback("wrong")
    setTimeout(() => setFeedback(null), 500)
    setLives(l => {
      const newL = l - 1
      if (newL <= 0) { setPhase("finished"); return newL }
      advance(round, itemIdx, items)
      return newL
    })
  }, [phase, round, itemIdx, items, advance])

  // Called when player clicks a bin
  const handleChoice = useCallback((side: "left" | "right") => {
    if (handledRef.current || phase !== "playing" || !currentItem) return
    handledRef.current = true

    if (side === currentItem.side) {
      // ✅ Correct
      if (coinAudio.current) { coinAudio.current.currentTime = 0; coinAudio.current.play().catch(() => {}) }
      const newCombo = combo + 1
      setCombo(newCombo)
      if (newCombo > bestCombo) setBestCombo(newCombo)
      setScore(s => s + (newCombo >= 3 ? 2 : 1))
      setFeedback("correct")
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect()
        burst(r.width / 2, r.height * 0.45, roundData.color, 18)
      }
      setTimeout(() => setFeedback(null), 400)
    } else {
      // ❌ Wrong
      setCombo(0)
      setFeedback("wrong")
      setTimeout(() => setFeedback(null), 500)
      setLives(l => {
        const newL = l - 1
        if (newL <= 0) { setPhase("finished"); return newL }
        return newL
      })
    }
    advance(round, itemIdx, items)
  }, [phase, currentItem, combo, bestCombo, round, itemIdx, items, roundData, burst, advance])

  const mm = String(Math.floor(timer / 60)).padStart(2, "0")
  const ss = String(timer % 60).padStart(2, "0")

  // ── FINISHED ───────────────────────────────────────────────────────────────
  if (phase === "finished") {
    const stars = !gameWon ? 0 : lives === MAX_LIVES ? 3 : lives >= 2 ? 2 : 1
    const borderColor = gameWon ? "#22c55e" : "#ef4444"
    return (
      <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          @keyframes starPop { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.4)} 100%{transform:scale(1);opacity:1} }
          @keyframes winFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
        <div style={{
          background: "linear-gradient(135deg,#0d0d2b,#1a0a2e)",
          border: `3px solid ${borderColor}`,
          boxShadow: `0 0 40px ${borderColor}30`,
          padding: "1.5rem", textAlign: "center",
        }}>
          <div style={{ fontSize: 52, animation: "winFloat 2s ease-in-out infinite", marginBottom: "0.75rem" }}>
            {gameWon ? "🏆" : "💀"}
          </div>
          <div style={{ color: borderColor, fontSize: "clamp(10px,2.5vw,13px)", marginBottom: "1rem", textShadow: `0 0 20px ${borderColor}` }}>
            {gameWon ? "¡CLASIFICADO!" : "¡SIN VIDAS!"}
          </div>
          <div style={{ fontSize: 28, letterSpacing: 10, marginBottom: "1rem" }}>
            {gameWon
              ? Array.from({ length: 3 }, (_, i) => (
                  <span key={i} style={{
                    color: i < stars ? "#fbbf24" : "#1f2937",
                    display: "inline-block",
                    animation: i < stars ? `starPop ${0.3 + i * 0.18}s ease both` : "none",
                    filter: i < stars ? "drop-shadow(0 0 6px #fbbf24)" : "none",
                  }}>★</span>
                ))
              : <span style={{ color: "#ef4444", fontSize: "clamp(12px,3vw,18px)" }}>GAME OVER</span>
            }
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1.25rem" }}>
            {[
              { label: "TIEMPO", value: `${mm}:${ss}`, color: "#60a5fa" },
              { label: "PUNTOS", value: score,          color: "#34d399" },
              { label: "COMBO",  value: `×${bestCombo}`,color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${s.color}40`, padding: "0.6rem 0.4rem" }}>
                <div style={{ color: s.color, fontSize: "clamp(6px,1.5vw,8px)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: "white", fontSize: "clamp(11px,3vw,16px)" }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div>
            {saving && (
              <div style={{ color: "#a78bfa", fontSize: "clamp(7px,1.8vw,9px)", textShadow: "0 0 10px #a78bfa" }}>GUARDANDO PROGRESO...</div>
            )}
            {!saving && !saveError && (
              <div style={{ color: "#22c55e", fontSize: "clamp(7px,1.8vw,9px)", textShadow: "0 0 10px #22c55e" }}>✓ PROGRESO GUARDADO — VOLVIENDO...</div>
            )}
            {saveError && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ color: "#f87171", fontSize: "clamp(7px,1.8vw,9px)" }}>✗ ERROR AL GUARDAR</div>
                <button onClick={onFinished} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(7px,1.8vw,9px)", background: "#7c3aed", color: "white", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}>
                  CONTINUAR →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── ROUND SWITCH ───────────────────────────────────────────────────────────
  if (phase === "switch") {
    const next = ROUNDS[Math.min(round + 1, ROUNDS.length - 1)]
    return (
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        textAlign: "center", padding: "2.5rem 1rem",
        background: "linear-gradient(135deg,#0d0d2b,#1a0a2e)",
        border: `2px solid ${next.color}`,
        boxShadow: `0 0 40px ${next.color}30`,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          @keyframes flash { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>
        <div style={{ fontSize: 52, marginBottom: "1rem", animation: "flash 0.6s ease 3" }}>⚡</div>
        <div style={{ color: "#fbbf24", fontSize: "clamp(10px,2.5vw,14px)", marginBottom: "1.2rem", textShadow: "0 0 20px #fbbf24" }}>
          ¡CAMBIO DE REGLA!
        </div>
        <div style={{ color: next.color, fontSize: "clamp(8px,2vw,11px)", textShadow: `0 0 12px ${next.color}` }}>
          {next.leftLabel} ↔ {next.rightLabel}
        </div>
        <div style={{ color: "#374151", fontSize: "clamp(6px,1.5vw,8px)", marginTop: "1rem" }}>PREPÁRATE...</div>
      </div>
    )
  }

  // ── GAME ───────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: "'Press Start 2P', monospace", userSelect: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes fallDown {
          from { top: 0%;  opacity: 1; }
          to   { top: 82%; opacity: 0.7; }
        }
        @keyframes deplete {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes correctFlash {
          0%,100% { background: transparent; }
          50%     { background: rgba(34,197,94,0.12); }
        }
        @keyframes wrongFlash {
          0%,100% { background: transparent; }
          50%     { background: rgba(239,68,68,0.12); }
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .xp-bar { background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }
      `}</style>

      {/* Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, overflow: "hidden" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute", left: p.x, top: p.y,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, opacity: p.life, boxShadow: `0 0 3px ${p.color}`,
          }} />
        ))}
      </div>

      {/* HUD */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: 6, marginBottom: "0.5rem",
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(99,102,241,0.35)",
        padding: "0.45rem 0.7rem",
      }}>
        <div style={{ color: "#60a5fa", fontSize: "clamp(7px,1.8vw,10px)" }}>⏱ {mm}:{ss}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: roundData.color, fontSize: "clamp(9px,2.2vw,12px)", textShadow: `0 0 8px ${roundData.color}` }}>
            R{round + 1}/{ROUNDS.length}
          </div>
          <div style={{ color: "#374151", fontSize: "clamp(5px,1.2vw,7px)", marginTop: 1 }}>RONDA</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            color: combo >= 4 ? "#fbbf24" : combo >= 2 ? "#f472b6" : "#4b5563",
            fontSize: "clamp(7px,1.8vw,10px)",
            textShadow: combo >= 2 ? "0 0 8px currentColor" : "none",
          }}>×{combo} COMBO</div>
          <div style={{ color: "#374151", fontSize: "clamp(5px,1.2vw,7px)", marginTop: 1 }}>{score} PTS</div>
        </div>
      </div>

      {/* Lives */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: "0.5rem" }}>
        {Array.from({ length: MAX_LIVES }, (_, i) => (
          <span key={i} style={{ fontSize: 16, filter: i < lives ? "none" : "grayscale(1) opacity(0.25)" }}>❤️</span>
        ))}
      </div>

      {/* Round progress bar */}
      <div style={{ marginBottom: "0.5rem" }}>
        <div style={{ height: 12, background: "rgba(0,0,0,0.6)", border: "2px solid #7c3aed", position: "relative", overflow: "hidden" }}>
          <div className="xp-bar" style={{
            height: "100%",
            width: `${(itemIdx / items.length) * 100}%`,
            transition: "width 0.3s ease",
            background: `linear-gradient(90deg, ${roundData.color}, ${roundData.color}cc, ${roundData.color})`,
          }} />
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace", fontSize: "clamp(5px,1.2vw,6px)",
            color: "white", mixBlendMode: "difference",
          }}>{itemIdx}/{items.length}</span>
        </div>
      </div>

      {/* Category labels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: "0.4rem" }}>
        {[roundData.leftLabel, roundData.rightLabel].map((label, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "0.35rem 0.25rem",
            background: `${roundData.color}15`,
            border: `1px solid ${roundData.color}50`,
            color: roundData.color,
            fontSize: "clamp(7px,1.5vw,9px)",
          }}>{label}</div>
        ))}
      </div>

      {/* Fall zone */}
      <div style={{
        position: "relative",
        height: 160,
        background: "rgba(0,0,0,0.35)",
        border: `1px solid rgba(99,102,241,0.2)`,
        marginBottom: "0.5rem",
        overflow: "hidden",
        animation: feedback === "correct"
          ? "correctFlash 0.35s ease"
          : feedback === "wrong"
          ? "wrongFlash 0.4s ease"
          : "none",
      }}>
        {/* Time depletion bar */}
        <div
          key={`bar-${itemKey}`}
          style={{
            position: "absolute", top: 0, left: 0,
            height: 4,
            background: roundData.color,
            boxShadow: `0 0 8px ${roundData.color}`,
            animation: `deplete ${fallDuration}s linear forwards`,
          }}
        />

        {/* Danger line */}
        <div style={{
          position: "absolute", bottom: 18, left: 0, right: 0, height: 2,
          background: "rgba(239,68,68,0.45)",
          boxShadow: "0 0 6px #ef444450",
        }} />

        {/* Falling item */}
        {currentItem && (
          <div
            key={`item-${itemKey}`}
            onAnimationEnd={handleMiss}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "clamp(40px,9vw,56px)",
              animation: `fallDown ${fallDuration}s linear forwards`,
              willChange: "top",
              filter: feedback === "correct"
                ? `drop-shadow(0 0 16px ${roundData.color})`
                : feedback === "wrong"
                ? "drop-shadow(0 0 16px #ef4444)"
                : "none",
            }}
          >
            {currentItem.emoji}
          </div>
        )}
      </div>

      {/* Choice buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {(["left", "right"] as const).map((side, i) => (
          <button
            key={side}
            onClick={() => handleChoice(side)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(8px,1.8vw,10px)",
              padding: "1rem 0.5rem",
              background: `${roundData.color}18`,
              border: `2px solid ${roundData.color}`,
              color: roundData.color,
              cursor: "pointer",
              boxShadow: `0 0 16px ${roundData.color}20`,
              transition: "background 0.1s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${roundData.color}35` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${roundData.color}18` }}
          >
            {i === 0 ? roundData.leftLabel : roundData.rightLabel}
          </button>
        ))}
      </div>
    </div>
  )
}
