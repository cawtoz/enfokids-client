"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { AssignmentStatus, FrequencyUnit } from "@/types/assignment"
import type { Assignment } from "@/types/assignment"
import { ActivityType } from "@/types/activity"
import type { Activity } from "@/types/activity"
import type { Progress } from "@/types/progress"
import { Gamepad2, Star, Zap, Shield, Sword, Trophy, Play } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProgressForm } from "@/components/crud/progress/assignment-progress-sheet"

interface UserData {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface EnrichedAssignment extends Assignment {
  activityType?: ActivityType
  activityDescription?: string
  activityImageUrl?: string
  activityResourceUrl?: string
  completedSessions: number
  totalSessions: number
  progressPercent: number
}

interface ChildHomeProps {
  user: UserData
}

const STATUS_CONFIG: Record<AssignmentStatus, { emoji: string; label: string; color: string }> = {
  [AssignmentStatus.PENDING]: { emoji: "💤", label: "EN ESPERA", color: "#f59e0b" },
  [AssignmentStatus.IN_PROGRESS]: { emoji: "⚔️", label: "EN BATALLA", color: "#ef4444" },
  [AssignmentStatus.COMPLETED]: { emoji: "🏆", label: "¡COMPLETADO!", color: "#22c55e" },
}

// Pixel star particles
const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  size: Math.random() > 0.7 ? "3px" : "2px",
}))

export function ChildHome({ user }: ChildHomeProps) {
  const [assignments, setAssignments] = useState<EnrichedAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [activeMissionId, setActiveMissionId] = useState<number | null>(null)
  const [missionSecondsLeft, setMissionSecondsLeft] = useState(0)
  const [totalMissionSeconds, setTotalMissionSeconds] = useState(0)

  // Timer en background
  useEffect(() => {
    if (activeMissionId === null || missionSecondsLeft <= 0) return

    const interval = setInterval(() => {
      setMissionSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeMissionId, missionSecondsLeft])

  const handleMissionStart = (assignmentId: number, totalSeconds: number) => {
    setActiveMissionId(assignmentId)
    setMissionSecondsLeft(totalSeconds)
    setTotalMissionSeconds(totalSeconds)
  }

  const handleMissionEnd = () => {
    setActiveMissionId(null)
    setMissionSecondsLeft(0)
    setTotalMissionSeconds(0)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [assignmentsRes, activitiesRes] = await Promise.allSettled([
          axios.get<Assignment[]>("/api/assignments", { params: { childId: user.id } }),
          axios.get<Activity[]>("/api/activities"),
        ])

        let assignmentsList: Assignment[] = []
        let activitiesList: Activity[] = []

        if (assignmentsRes.status === "fulfilled") assignmentsList = assignmentsRes.value.data || []
        if (activitiesRes.status === "fulfilled") activitiesList = activitiesRes.value.data || []

        const progressResponses = await Promise.allSettled(
          assignmentsList.map((a) =>
            axios.get<Progress[]>("/api/progress", { params: { assignmentId: a.id } })
          )
        )

        const progressMap: Record<number, number> = {}
        progressResponses.forEach((res, idx) => {
          const assignmentId = assignmentsList[idx]?.id
          if (res.status === "fulfilled" && assignmentId) {
            // Contar TODOS los progresos registrados, sin filtrar por completado
            const totalProgresos = res.value.data?.length || 0
            progressMap[assignmentId] = totalProgresos
          }
        })

        const enrichedAssignments: EnrichedAssignment[] = assignmentsList.map((assignment) => {
          const activity = activitiesList.find((a) => a.id === assignment.activityId)
          const completedSessions = progressMap[assignment.id] || 0
          const totalSessions = assignment.repetitions || 0
          const progressPercent =
            totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

          return {
            ...assignment,
            activityType: activity?.type,
            activityDescription: activity?.description,
            activityImageUrl: activity?.imageUrl,
            activityResourceUrl: activity?.resourceUrl,
            completedSessions,
            totalSessions,
            progressPercent,
          }
        })

        setAssignments(enrichedAssignments)
        // Compute score from completed
        const pts = enrichedAssignments.reduce((acc, a) => acc + a.completedSessions * 100, 0)
        setScore(pts)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("¡ERROR DEL SISTEMA! Intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  const stats = {
    total: assignments.length,
    inProgress: assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length,
    pending: assignments.filter((a) => a.status === AssignmentStatus.PENDING).length,
    completed: assignments.filter((a) => a.status === AssignmentStatus.COMPLETED).length,
  }

  // Dividir asignaciones por estado
  const inProgress = assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS)
  const pending = assignments.filter((a) => a.status === AssignmentStatus.PENDING)
  const completed = assignments.filter((a) => a.status === AssignmentStatus.COMPLETED)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "BUENOS DÍAS"
    if (hour < 18) return "BUENAS TARDES"
    return "BUENAS NOCHES"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  const formatFrequency = (unit: FrequencyUnit, count: number) => {
    const unitLabel = {
      [FrequencyUnit.DAY]: count === 1 ? "día" : "días",
      [FrequencyUnit.WEEK]: count === 1 ? "semana" : "semanas",
      [FrequencyUnit.MONTH]: count === 1 ? "mes" : "meses",
    }
    return `${count}x/${unitLabel[unit] || unit}`
  }

  // Level based on score
  const level = Math.floor(score / 500) + 1
  const xpInLevel = score % 500
  const xpPercent = (xpInLevel / 500) * 100

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;900&display=swap');

        .font-pixel { font-family: 'Press Start 2P', monospace; }
        .font-game { font-family: 'Nunito', sans-serif; }

        .pixel-border {
          box-shadow:
            0 -4px 0 0 #000,
            0 4px 0 0 #000,
            -4px 0 0 0 #000,
            4px 0 0 0 #000,
            -4px -4px 0 0 #000,
            4px -4px 0 0 #000,
            -4px 4px 0 0 #000,
            4px 4px 0 0 #000;
        }

        .pixel-border-sm {
          box-shadow:
            0 -2px 0 0 #000,
            0 2px 0 0 #000,
            -2px 0 0 0 #000,
            2px 0 0 0 #000;
        }

        .pixel-btn {
          box-shadow:
            0 6px 0 0 rgba(0,0,0,0.4),
            0 -2px 0 0 rgba(255,255,255,0.3) inset;
          transition: all 0.1s;
        }
        .pixel-btn:active {
          box-shadow: 0 2px 0 0 rgba(0,0,0,0.4);
          transform: translateY(4px);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes hp-pulse {
          0%, 100% { box-shadow: 0 0 6px #22c55e, 0 0 12px #22c55e; }
          50% { box-shadow: 0 0 12px #22c55e, 0 0 24px #22c55e; }
        }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes title-glow {
          0%, 100% { text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 40px #d97706; }
          50% { text-shadow: 0 0 20px #fbbf24, 0 0 40px #f59e0b, 0 0 80px #d97706; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .float-anim { animation: float 3s ease-in-out infinite; }
        .blink-anim { animation: blink 1s step-end infinite; }
        .glow-title { animation: title-glow 2s ease-in-out infinite; }
        .hp-bar { animation: hp-pulse 2s ease-in-out infinite; }
        .star-twinkle { animation: star-twinkle ease-in-out infinite; }
        .card-enter { animation: card-enter 0.4s ease forwards; }
        .spin-slow { animation: spin-slow 8s linear infinite; }

        .scanline-overlay::after {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 9999;
        }

        .card-hover {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .xp-bar-fill {
          background: linear-gradient(90deg, #22c55e 0%, #86efac 50%, #22c55e 100%);
          background-size: 200% 100%;
          animation: xp-shimmer 1.5s linear infinite;
        }
        @keyframes xp-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .progress-fill {
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
          background-size: 200% 100%;
          animation: xp-shimmer 2s linear infinite;
        }
      `}</style>

      <div className="scanline-overlay min-h-screen bg-[#0a0a1a] relative overflow-hidden font-game">
        {/* Star field background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {STARS.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full star-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
          {/* Grid floor */}
          <div
            className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              transform: "perspective(500px) rotateX(60deg)",
              transformOrigin: "bottom",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-5 pb-16 pt-4 sm:pt-6">

          {/* ── TOP HUD BAR ── */}
          <div className="flex items-center justify-between mb-6 bg-black/60 rounded-none px-4 py-3 pixel-border-sm border border-indigo-500/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center pixel-border-sm spin-slow">
                <Star className="w-4 h-4 text-black" fill="black" />
              </div>
              <div>
                <div className="font-pixel text-yellow-400 text-[8px] sm:text-[10px] leading-tight">JUGADOR</div>
                <div className="font-pixel text-white text-[10px] sm:text-xs leading-tight">{user.firstName.toUpperCase()}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="font-pixel text-[8px] text-cyan-400 mb-1">LVL {level}</div>
              <div className="w-32 sm:w-48 h-4 bg-black border border-green-500 relative overflow-hidden">
                <div
                  className="xp-bar-fill h-full transition-all duration-1000"
                  style={{ width: `${xpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-white mix-blend-difference">
                  XP {xpInLevel}/500
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-pixel text-[8px] text-yellow-400">PUNTOS</div>
              <div className="font-pixel text-yellow-300 text-xs sm:text-sm">{score.toLocaleString()}</div>
            </div>
          </div>

          {/* ── TITLE ── */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="font-pixel text-[9px] sm:text-xs text-cyan-400 mb-3 blink-anim tracking-widest">
              ▼ {getGreeting()} ▼
            </div>
            <h1
              className="font-pixel text-2xl sm:text-4xl md:text-5xl text-yellow-400 glow-title leading-tight tracking-wide"
              style={{ imageRendering: "pixelated" }}
            >
              MISIÓN<br />ACTIVA
            </h1>
            <p className="font-game font-black text-lg sm:text-2xl text-white/80 mt-3">
              ¡Hola, <span className="text-pink-400">{user.firstName}</span>! 🎮
            </p>
          </div>

          {/* ── STAT SUMMARY ── */}
          <div className="mb-8 grid grid-cols-4 gap-2 sm:gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/40 border-2 border-indigo-500">
              <span className="text-lg">🎯</span>
              <span className="font-pixel text-indigo-300 text-[10px] mt-1">TOTAL</span>
              <span className="font-pixel text-white text-sm font-bold">{stats.total}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/40 border-2 border-yellow-500">
              <span className="text-lg">💤</span>
              <span className="font-pixel text-yellow-300 text-[10px] mt-1">NUEVAS</span>
              <span className="font-pixel text-white text-sm font-bold">{stats.pending}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/40 border-2 border-red-500">
              <span className="text-lg">⚔️</span>
              <span className="font-pixel text-red-300 text-[10px] mt-1">BATALLA</span>
              <span className="font-pixel text-white text-sm font-bold">{stats.inProgress}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-black/40 border-2 border-green-500">
              <span className="text-lg">🏆</span>
              <span className="font-pixel text-green-300 text-[10px] mt-1">GANADAS</span>
              <span className="font-pixel text-white text-sm font-bold">{stats.completed}</span>
            </div>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="bg-red-900/80 border-2 border-red-500 pixel-border-sm p-4 mb-6 text-center">
              <div className="font-pixel text-red-400 text-xs blink-anim">⚠ SYSTEM ERROR ⚠</div>
              <div className="font-game text-red-300 mt-2 font-bold">{error}</div>
            </div>
          )}

          {/* ── LOADING ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="font-pixel text-cyan-400 text-xs sm:text-sm blink-anim">CARGANDO MISIONES...</div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-yellow-400"
                    style={{
                      animation: `blink 0.8s step-end infinite`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <div className="w-64 h-6 bg-black border-2 border-green-500 overflow-hidden">
                <div className="h-full bg-green-500 hp-bar" style={{ width: "60%", transition: "width 0.5s" }} />
              </div>
            </div>
          )}

          {/* ── EMPTY: no assignments ── */}
          {!isLoading && !error && assignments.length === 0 && (
            <div className="text-center py-16">
              <div className="text-8xl float-anim mb-6">😴</div>
              <div className="font-pixel text-yellow-400 text-sm mb-3">SIN MISIONES</div>
              <div className="font-game text-white/60 text-lg">Tu terapeuta te asignará misiones pronto...</div>
              <div className="font-pixel text-cyan-400 text-xs mt-4 blink-anim">ESPERA EN LA SALA DE INICIO</div>
            </div>
          )}

          {/* ── SECCIÓN: EN BATALLA ── */}
          {!isLoading && inProgress.length > 0 && (
            <div className="mb-10">
              <div className="font-pixel text-sm text-red-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                EN BATALLA — {inProgress.length}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {inProgress.map((assignment, idx) =>
                  assignment.activityType === ActivityType.DIGITAL ? (
                    <DigitalActivityCard key={assignment.id} assignment={assignment} index={idx} />
                  ) : (
                    <NonDigitalActivityCard
                      key={assignment.id}
                      assignment={assignment}
                      index={idx}
                      formatDate={formatDate}
                      formatFrequency={formatFrequency}
                      activeMissionId={activeMissionId}
                      onMissionStart={handleMissionStart}
                      onMissionEnd={handleMissionEnd}
                      missionSecondsLeft={missionSecondsLeft}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* ── SECCIÓN: NUEVAS MISIONES ── */}
          {!isLoading && pending.length > 0 && (
            <div className="mb-10">
              <div className="font-pixel text-sm text-yellow-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">💤</span>
                NUEVAS MISIONES — {pending.length}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {pending.map((assignment, idx) =>
                  assignment.activityType === ActivityType.DIGITAL ? (
                    <DigitalActivityCard key={assignment.id} assignment={assignment} index={idx} />
                  ) : (
                    <NonDigitalActivityCard
                      key={assignment.id}
                      assignment={assignment}
                      index={idx}
                      formatDate={formatDate}
                      formatFrequency={formatFrequency}
                      activeMissionId={activeMissionId}
                      onMissionStart={handleMissionStart}
                      onMissionEnd={handleMissionEnd}
                      missionSecondsLeft={missionSecondsLeft}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* ── SECCIÓN: GANADAS (COLAPSABLE) ── */}
          {!isLoading && completed.length > 0 && (
            <div className="mb-10">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full font-pixel text-sm text-green-400 mb-4 flex items-center gap-2 hover:bg-green-400/20 transition-colors p-3 rounded border-2 border-green-500"
              >
                <span className="text-2xl">🏆</span>
                <span>GANADAS — {completed.length}</span>
                <span className="ml-auto text-lg font-bold">{showCompleted ? "▼" : "▶"}</span>
              </button>
              {showCompleted && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {completed.map((assignment, idx) =>
                    assignment.activityType === ActivityType.DIGITAL ? (
                      <DigitalActivityCard key={assignment.id} assignment={assignment} index={idx} />
                    ) : (
                      <NonDigitalActivityCard
                        key={assignment.id}
                        assignment={assignment}
                        index={idx}
                        formatDate={formatDate}
                        formatFrequency={formatFrequency}
                        activeMissionId={activeMissionId}
                        onMissionStart={handleMissionStart}
                        onMissionEnd={handleMissionEnd}
                        missionSecondsLeft={missionSecondsLeft}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── MISSION MODAL ────────────────────────────────────────────────
interface MissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: EnrichedAssignment
  phase: "timer" | "form"
  onPhaseChange: (phase: "timer" | "form") => void
  secondsLeft: number
  totalSeconds: number
  onMissionEnd: () => void
}

function MissionModal({ open, onOpenChange, assignment, phase, onPhaseChange, secondsLeft, totalSeconds, onMissionEnd }: MissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-cyan-500 text-white">
        {phase === "timer" ? (
          <MissionTimer assignment={assignment} onFinish={() => onPhaseChange("form")} secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
        ) : (
          <MissionProgressForm assignment={assignment} onSaved={() => {
            onMissionEnd()
            onOpenChange(false)
          }} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MissionTimerProps {
  assignment: EnrichedAssignment
  onFinish: () => void
}

interface MissionTimerWithStateProps extends MissionTimerProps {
  secondsLeft: number
  totalSeconds: number
}

function MissionTimer({ assignment, onFinish, secondsLeft, totalSeconds }: MissionTimerWithStateProps) {
  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinish()
    }
  }, [secondsLeft, onFinish])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-cyan-400 font-pixel">⚔️ MISIÓN EN PROGRESO</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-6">
        <div className="text-center space-y-4">
          <h2 className="font-pixel text-xl text-white">{assignment.activityTitle.toUpperCase()}</h2>
          <div className="font-pixel text-5xl text-yellow-400 tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-4 bg-black border-2 border-cyan-500 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-center font-pixel text-sm text-cyan-300">
            {Math.round(progressPercent)}%
          </div>
        </div>

        <Button
          onClick={onFinish}
          className="w-full bg-red-600 hover:bg-red-700 font-pixel"
        >
          ⏹ FINALIZAR MISIÓN
        </Button>
      </div>
    </>
  )
}

interface MissionProgressFormProps {
  assignment: EnrichedAssignment
  onSaved: () => void
}

function MissionProgressForm({ assignment, onSaved }: MissionProgressFormProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-green-400 font-pixel">✅ MISIÓN COMPLETADA</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <p className="font-pixel text-sm text-cyan-300">Registra tu progreso</p>
        <ProgressForm
          assignment={assignment}
          onSaved={(newStatus) => {
            onSaved()
          }}
        />
      </div>
    </>
  )
}

// ─── QUEST CARD THEMES ────────────────────────────────────────────
const CARD_THEMES = [
  { bg: "#1a0a2e", border: "#9333ea", accent: "#c084fc", gem: "💜" },
  { bg: "#0a1a2e", border: "#2563eb", accent: "#60a5fa", gem: "💙" },
  { bg: "#0a2e0a", border: "#16a34a", accent: "#4ade80", gem: "💚" },
  { bg: "#2e1a0a", border: "#d97706", accent: "#fbbf24", gem: "🧡" },
  { bg: "#2e0a0a", border: "#dc2626", accent: "#f87171", gem: "❤️" },
  { bg: "#1a2e2e", border: "#0891b2", accent: "#22d3ee", gem: "💎" },
]

// ─── NON-DIGITAL CARD ────────────────────────────────────────────
interface NonDigitalActivityCardProps {
  assignment: EnrichedAssignment
  index: number
  formatDate: (d: string) => string
  formatFrequency: (u: FrequencyUnit, c: number) => string
  activeMissionId: number | null
  onMissionStart: (assignmentId: number, totalSeconds: number) => void
  onMissionEnd: () => void
  missionSecondsLeft: number
}

function NonDigitalActivityCard({
  assignment, index, formatDate, formatFrequency,
  activeMissionId, onMissionStart, onMissionEnd, missionSecondsLeft,
}: NonDigitalActivityCardProps) {
  const theme = CARD_THEMES[index % CARD_THEMES.length]
  const status = STATUS_CONFIG[assignment.status]
  const [missionOpen, setMissionOpen] = useState(false)
  const [phase, setPhase] = useState<"timer" | "form">("timer")

  const isMissionActive = activeMissionId === assignment.id
  const isAnyMissionActive = activeMissionId !== null
  const canStartMission = !isAnyMissionActive && assignment.status !== AssignmentStatus.COMPLETED && assignment.estimatedDuration > 0

  return (
    <div
      className="card-hover card-enter flex flex-col h-full"
      style={{
        animationDelay: `${index * 0.07}s`,
        opacity: 0,
        background: theme.bg,
        border: `3px solid ${theme.border}`,
        boxShadow: `0 0 20px ${theme.border}40, inset 0 0 40px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Card top bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: `${theme.border}30`, borderBottom: `2px solid ${theme.border}` }}
      >
        <span className="font-pixel text-[8px]" style={{ color: theme.accent }}>
          {theme.gem} MISIÓN #{String(index + 1).padStart(3, "0")}
        </span>
        <span
          className="font-pixel text-[8px] px-2 py-1"
          style={{
            background: status.color + "25",
            border: `1px solid ${status.color}`,
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Image area */}
      <div className="h-40 relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.border}20)` }}>
        {assignment.activityImageUrl ? (
          <img
            src={assignment.activityImageUrl}
            alt={assignment.activityTitle}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => { e.currentTarget.style.display = "none" }}
          />
        ) : (
          <div className="text-7xl float-anim">🗡️</div>
        )}
        {/* Scanline overlay on image */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)"
          }}
        />
      </div>

      {/* Card body */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <h3
          className="font-pixel text-[11px] sm:text-xs leading-relaxed"
          style={{ color: theme.accent }}
        >
          {assignment.activityTitle.toUpperCase()}
        </h3>

        {assignment.activityDescription && (
          <p className="font-game text-sm text-white/60 line-clamp-2 leading-snug">
            {assignment.activityDescription}
          </p>
        )}

        {/* HP-style progress bar */}
        {assignment.totalSessions > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between font-pixel text-[8px]">
              <span style={{ color: theme.accent }}>HP</span>
              <span className="text-white/70">{assignment.completedSessions}/{assignment.totalSessions}</span>
            </div>
            <div
              className="h-5 relative overflow-hidden"
              style={{ background: "#000", border: `2px solid ${theme.border}` }}
            >
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${assignment.progressPercent}%`,
                  background: assignment.progressPercent >= 80
                    ? `linear-gradient(90deg, #22c55e, #86efac)`
                    : assignment.progressPercent >= 40
                    ? `linear-gradient(90deg, #f59e0b, #fbbf24)`
                    : `linear-gradient(90deg, #ef4444, #f87171)`,
                  boxShadow: `0 0 8px currentColor`,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-white mix-blend-difference">
                {assignment.progressPercent}%
              </span>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div
          className="grid grid-cols-2 gap-2 font-pixel text-[8px] p-2"
          style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${theme.border}40` }}
        >
          {assignment.estimatedDuration > 0 && (
            <>
              <div style={{ color: theme.accent }}>⏱ TIEMPO</div>
              <div className="text-white/70 text-right">{assignment.estimatedDuration}min</div>
              <div style={{ color: theme.accent }}>🔁 FREQ</div>
              <div className="text-white/70 text-right">{formatFrequency(assignment.frequencyUnit, assignment.frequencyCount)}</div>
            </>
          )}
          <div style={{ color: theme.accent }}>📅 INICIO</div>
          <div className="text-white/70 text-right">{formatDate(assignment.startDate)}</div>
          <div style={{ color: theme.accent }}>🏁 FIN</div>
          <div className="text-white/70 text-right">{formatDate(assignment.endDate)}</div>
        </div>

        <div className="flex-1" />

        {/* INICIAR MISIÓN button */}
        {assignment.estimatedDuration > 0 && assignment.status !== AssignmentStatus.COMPLETED && (
          <button
            onClick={() => {
              if (!isMissionActive) {
                onMissionStart(assignment.id, assignment.estimatedDuration * 60)
              }
              setMissionOpen(true)
              setPhase("timer")
            }}
            disabled={isAnyMissionActive && !isMissionActive}
            className="pixel-btn block w-full text-center font-pixel text-[9px] py-3 px-4 transition-all mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isMissionActive ? "#ef444440" : theme.accent + "40",
              color: isMissionActive ? "#ef4444" : theme.accent,
              border: `2px solid ${isMissionActive ? "#ef4444" : theme.accent}`,
            }}
          >
            {isMissionActive
              ? `⏱ ${String(Math.floor(missionSecondsLeft / 60)).padStart(2, "0")}:${String(missionSecondsLeft % 60).padStart(2, "0")}`
              : "▶ INICIAR MISIÓN"}
          </button>
        )}

        {assignment.activityResourceUrl && (
          <a
            href={assignment.activityResourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn block text-center font-pixel text-[9px] py-3 px-4 transition-all"
            style={{
              background: theme.border,
              color: "white",
              border: `2px solid ${theme.accent}`,
            }}
          >
            ▶ VER RECURSO
          </a>
        )}

        {/* Mission Modal */}
        <MissionModal
          open={missionOpen}
          onOpenChange={setMissionOpen}
          assignment={assignment}
          phase={phase}
          onPhaseChange={setPhase}
          secondsLeft={missionSecondsLeft}
          totalSeconds={assignment.estimatedDuration * 60}
          onMissionEnd={onMissionEnd}
        />
      </div>
    </div>
  )
}

// ─── DIGITAL CARD ─────────────────────────────────────────────────
// IDs de actividades digitales conocidas
const GAME_IDS = { MEMORY_FLIP: 2, MATCHING_PAIRS: 3, SORT_RUSH: 4 }

function DigitalActivityCard({ assignment, index }: { assignment: EnrichedAssignment; index: number }) {
  const hasGame = assignment.activityId === GAME_IDS.MEMORY_FLIP
    || assignment.activityId === GAME_IDS.MATCHING_PAIRS
    || assignment.activityId === GAME_IDS.SORT_RUSH

  return (
    <div
      className="card-hover card-enter flex flex-col h-full"
      style={{
        animationDelay: `${index * 0.07}s`,
        opacity: 0,
        background: "#0d0d2b",
        border: "3px solid #7c3aed",
        boxShadow: "0 0 30px #7c3aed50, inset 0 0 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: "#7c3aed20", borderBottom: "2px solid #7c3aed" }}
      >
        <span className="font-pixel text-[8px] text-purple-300">🎮 JUEGO DIGITAL</span>
        {hasGame
          ? <span className="font-pixel text-[8px] text-green-400">★ DISPONIBLE</span>
          : <span className="font-pixel text-[8px] text-yellow-400 blink-anim">★ PRÓXIMO</span>
        }
      </div>

      {/* Game header */}
      <div
        className="h-40 flex flex-col items-center justify-center gap-3"
        style={{
          background: "linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)",
        }}
      >
        <Gamepad2
          className="w-16 h-16 float-anim"
          style={{ color: "#a78bfa", filter: "drop-shadow(0 0 12px #7c3aed)" }}
        />
        <div className="flex gap-1">
          {[0,1,2,3,4].map(i => (
            <Star
              key={i}
              className="w-4 h-4"
              style={{
                color: i < 3 ? "#fbbf24" : "#374151",
                animationDelay: `${i * 0.2}s`,
              }}
              fill={i < 3 ? "#fbbf24" : "none"}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 gap-3">
        <h3 className="font-pixel text-[11px] text-purple-300 leading-relaxed">
          {assignment.activityTitle.toUpperCase()}
        </h3>

        <div
          className="font-pixel text-[8px] text-yellow-400 px-2 py-1 inline-block"
          style={{ background: "#fbbf2415", border: "1px solid #fbbf24" }}
        >
          ⚡ NIVEL ESPECIAL
        </div>

        {assignment.activityDescription && (
          <p className="font-game text-sm text-white/60 line-clamp-3 leading-snug">
            {assignment.activityDescription}
          </p>
        )}

        {/* HP-style progress bar */}
        {assignment.totalSessions > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between font-pixel text-[8px]">
              <span className="text-purple-300">HP</span>
              <span className="text-white/70">{assignment.completedSessions}/{assignment.totalSessions}</span>
            </div>
            <div className="h-5 relative overflow-hidden" style={{ background: "#000", border: "2px solid #7c3aed" }}>
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${assignment.progressPercent}%`,
                  background: assignment.progressPercent >= 80
                    ? "linear-gradient(90deg, #22c55e, #86efac)"
                    : assignment.progressPercent >= 40
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #7c3aed, #a78bfa)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] text-white mix-blend-difference">
                {assignment.progressPercent}%
              </span>
            </div>
          </div>
        )}

        <div className="flex-1" />

        {hasGame ? (
          <a
            href={`/nino/juego/${assignment.id}`}
            className="pixel-btn block text-center font-pixel text-[9px] py-3 px-4 w-full transition-all"
            style={{
              background: "#7c3aed",
              color: "white",
              border: "2px solid #a78bfa",
              boxShadow: "0 0 12px #7c3aed80",
            }}
          >
            ▶ JUGAR AHORA
          </a>
        ) : (
          <button
            disabled
            className="pixel-btn font-pixel text-[9px] py-3 px-4 w-full opacity-50 cursor-not-allowed"
            style={{
              background: "#7c3aed",
              color: "white",
              border: "2px solid #a78bfa",
            }}
          >
            🔒 BLOQUEADO — EN BREVE
          </button>
        )}
      </div>
    </div>
  )
}