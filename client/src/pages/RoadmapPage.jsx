import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roadmapAPI } from '../api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, Download, CheckSquare, Square, BookOpen, Wrench, Award } from 'lucide-react'
import jsPDF from 'jspdf'

const DURATIONS = [
  { id: 'week', label: '1 Week', sub: 'Intensive sprint' },
  { id: 'month', label: '1 Month', sub: 'Focused pace' },
  { id: 'quarter', label: '3 Months', sub: 'Steady growth' },
]

function exportToPDF(roadmap) {
  const doc = new jsPDF()
  let y = 20
  doc.setFontSize(20)
  doc.setTextColor(0, 180, 255)
  doc.text('AI Career Navigator — Roadmap', 20, y)
  y += 10
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Target: ${roadmap.targetRole} | Duration: ${roadmap.duration}`, 20, y)
  y += 15

  roadmap.phases?.forEach((phase, i) => {
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`${phase.weekLabel}: ${phase.title}`, 20, y)
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    phase.tasks?.forEach(task => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(`• ${task}`, 25, y)
      y += 6
    })
    y += 5
    if (phase.resources?.length) {
      doc.setTextColor(100, 100, 100)
      doc.text('Resources:', 25, y); y += 6
      phase.resources.slice(0, 3).forEach(r => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`  - ${r.title} (${r.platform}) ${r.price}`, 25, y); y += 6
      })
    }
    y += 5
  })

  if (roadmap.certifications?.length) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFontSize(14); doc.setTextColor(0, 0, 0)
    doc.text('Recommended Certifications', 20, y); y += 8
    roadmap.certifications.forEach(c => {
      doc.setFontSize(11); doc.setTextColor(60, 60, 60)
      doc.text(`• ${c.title} — ${c.platform} (${c.price})`, 25, y); y += 6
    })
  }

  doc.save(`career-roadmap-${roadmap.duration}.pdf`)
  toast.success('PDF downloaded!')
}

export default function RoadmapPage() {
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [activeDuration, setActiveDuration] = useState(null)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: roadmapData, isLoading } = useQuery({
    queryKey: ['roadmap', activeDuration],
    queryFn: () => roadmapAPI.getActive(activeDuration).then(r => r.data.roadmap),
    enabled: !!activeDuration,
    retry: false
  })

  const generateMutation = useMutation({
    mutationFn: (dur) => roadmapAPI.generate(dur),
    onSuccess: (res, dur) => {
      qc.setQueryData(['roadmap', dur], res.data.roadmap)
      setActiveDuration(dur)
      toast.success('Roadmap generated!')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Generation failed')
  })

  const progressMutation = useMutation({
    mutationFn: ({ id, phaseId, taskText, completed }) => roadmapAPI.updateProgress(id, { phaseId, taskText, completed }),
    onSuccess: (res, { dur }) => { qc.setQueryData(['roadmap', activeDuration], res.data.roadmap) },
  })

  const roadmap = roadmapData

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-accent" /></div>

  if (!activeDuration && !roadmap) {
    return (
      <div>
        <div className="mb-8 page-header"><h1>Career Roadmap</h1><p>Personalized learning path to your target role</p></div>
        <div className="card max-w-md mx-auto text-center py-12">
          <div className="text-5xl mb-4">⬦</div>
          <h2 className="text-xl font-bold mb-2">Choose Your Timeline</h2>
          <p className="text-slate-500 text-sm mb-8">We'll pace your roadmap based on this</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {DURATIONS.map(d => (
              <div key={d.id} onClick={() => setSelectedDuration(d.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedDuration === d.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}>
                <div className="font-bold">{d.label}</div>
                <div className="text-xs text-slate-500 mt-1">{d.sub}</div>
              </div>
            ))}
          </div>
          <button disabled={!selectedDuration || generateMutation.isPending} onClick={() => generateMutation.mutate(selectedDuration)} className="btn-primary w-full flex items-center justify-center gap-2">
            {generateMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : '⬡ Generate My Roadmap'}
          </button>
          {generateMutation.isPending && <p className="text-xs text-slate-500 mt-3">Claude AI is building your personalized roadmap…</p>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="page-header mb-0">
          <h1>Career Roadmap</h1>
          <p>{roadmap ? `${roadmap.targetRole} · ${roadmap.progressPercent}% complete` : 'Loading…'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Duration switcher */}
          <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
            {DURATIONS.map(d => (
              <button key={d.id} onClick={() => { setSelectedDuration(d.id); setActiveDuration(d.id) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDuration === d.id ? 'bg-accent/15 text-accent' : 'text-slate-500 hover:text-slate-300'}`}>
                {d.label}
              </button>
            ))}
          </div>
          <button onClick={() => generateMutation.mutate(activeDuration || selectedDuration)} className="btn-outline text-sm py-2">
            {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : '↻ Regenerate'}
          </button>
          {roadmap && (
            <button onClick={() => exportToPDF(roadmap)} className="btn-primary text-sm py-2 flex items-center gap-2">
              <Download size={14} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {roadmap && (
        <>
          {/* Progress bar */}
          <div className="card mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="font-mono text-accent">{roadmap.progressPercent}%</span>
            </div>
            <div className="skill-bar h-3">
              <div className="h-full bg-gradient-to-r from-accent2 to-accent rounded-full transition-all duration-500" style={{ width: `${roadmap.progressPercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Phases / Timeline */}
            <div>
              <div className="section-title">📅 Timetable</div>
              {roadmap.phases?.map((phase, pi) => (
                <div key={phase._id || pi} className="card mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-sm font-bold ${phase.status === 'active' ? 'text-accent' : phase.status === 'done' ? 'text-accent3' : 'text-slate-500'}`}>
                        {phase.weekLabel}: {phase.title}
                      </span>
                    </div>
                    <span className={`badge-${phase.status === 'done' ? 'green' : phase.status === 'active' ? 'blue' : 'purple'} text-xs`}
                      style={{ color: phase.status === 'done' ? '#10b981' : phase.status === 'active' ? '#00d4ff' : '#7c3aed', background: phase.status === 'done' ? '#10b98115' : phase.status === 'active' ? '#00d4ff15' : '#7c3aed15' }}>
                      {phase.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 italic">{phase.goal}</p>
                  {phase.tasks?.map((task, ti) => {
                    const done = phase.completedTasks?.includes(task)
                    return (
                      <div key={ti} className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
                        onClick={() => progressMutation.mutate({ id: roadmap._id, phaseId: phase._id, taskText: task, completed: !done })}>
                        {done ? <CheckSquare size={15} className="text-accent3 flex-shrink-0" /> : <Square size={15} className="text-slate-600 group-hover:text-accent flex-shrink-0 transition-colors" />}
                        <span className={`text-sm ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{task}</span>
                      </div>
                    )
                  })}

                  {/* Projects */}
                  {phase.projects?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-accent4 font-semibold mb-2"><Wrench size={12} /> Build This</div>
                      {phase.projects.slice(0, 2).map((p, pi) => (
                        <div key={pi} className="bg-bg rounded-lg p-3 mb-2 border border-border/40">
                          <div className="text-sm font-semibold">{p.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 mb-2">{p.description}</div>
                          <div className="flex gap-1 flex-wrap">{p.tech?.map(t => <span key={t} className="tag text-[10px]">{t}</span>)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <div className="section-title">🎓 Courses & Resources</div>
              {roadmap.phases?.flatMap(p => p.resources || []).slice(0, 8).map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={14} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="text-xs text-slate-500">{r.platform} · ⭐ {r.rating}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${r.isFree ? 'text-accent3' : 'text-accent'}`}>{r.price}</div>
                    {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-accent">→ Open</a>}
                  </div>
                </div>
              ))}

              {roadmap.certifications?.length > 0 && (
                <>
                  <div className="section-title mt-6">🏆 Certifications</div>
                  {roadmap.certifications.map((c, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award size={18} className="text-accent4" />
                        <div>
                          <div className="text-sm font-semibold">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.platform}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${c.isFree ? 'text-accent3' : 'text-accent'}`}>{c.price}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
