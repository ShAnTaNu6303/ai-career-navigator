import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisAPI, profileAPI } from '../api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react'

const SkillBar = ({ name, current, required, showGap }) => {
  const gap = (required || 0) - (current || 0)
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{name}</span>
        <span className="text-slate-500 font-mono text-xs">{current}% {showGap && required ? `→ ${required}%` : ''}</span>
      </div>
      <div className="skill-bar h-2.5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${current}%`, background: `linear-gradient(90deg, #7c3aed, #00d4ff)` }} />
      </div>
      {showGap && gap > 0 && <div className="text-xs text-red-400 mt-1">+{gap}% gap to close</div>}
      {showGap && gap <= 0 && <div className="text-xs text-accent3 mt-1">✓ Meets requirement</div>}
    </div>
  )
}

const ReadinessRing = ({ score }) => {
  const r = 52, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1a2a4a" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-slate-500 text-xs">/ 100</div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [targetRole, setTargetRole] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['analysis'],
    queryFn: () => analysisAPI.getLatest().then(r => r.data.analysis),
    retry: false
  })

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.get().then(r => r.data.profile),
    retry: false
  })

  const generateMutation = useMutation({
    mutationFn: (overrides) => analysisAPI.generate(overrides),
    onSuccess: (res) => {
      qc.setQueryData(['analysis'], res.data.analysis)
      toast.success('Analysis complete! 🎉')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Analysis failed — check your profile is complete')
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-accent" />
    </div>
  )

  if (generateMutation.isPending) return (
    <div>
      <div className="mb-8 page-header"><h1>Skill Analysis</h1><p>Claude AI is working on your profile…</p></div>
      <div className="card max-w-lg mx-auto text-center py-16">
        <Loader2 size={56} className="animate-spin text-accent mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2">Analyzing Your Profile…</h2>
        <p className="text-slate-500 text-sm">Claude AI is comparing your skills against market requirements.<br/>This takes about 15–25 seconds.</p>
        <div className="mt-6 flex justify-center gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!data) {
    const hasProfile = profileData?.isComplete
    return (
      <div>
        <div className="mb-8 page-header"><h1>Skill Analysis</h1><p>AI-powered gap analysis for your career</p></div>
        <div className="card max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <TrendingUp size={32} className="text-accent" />
          </div>
          {hasProfile ? (
            <>
              <h2 className="text-xl font-bold mb-2">Profile Saved! ✅</h2>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                Your profile is ready. Click below and Claude AI will analyze your skills, find gaps, and calculate your job readiness score.
              </p>
              <button
                onClick={() => generateMutation.mutate({})}
                className="btn-primary px-10 py-3.5 text-base flex items-center gap-2 mx-auto"
              >
                <Zap size={18} /> Run AI Analysis Now
              </button>
              <p className="text-xs text-slate-600 mt-4">Takes ~15–25 seconds · Powered by Claude AI</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">No Profile Yet</h2>
              <p className="text-slate-500 text-sm mb-6">Complete your profile first, then run Claude AI analysis to get personalized insights.</p>
              <button onClick={() => navigate('/profile')} className="btn-primary px-8 py-3">
                Set Up Profile First
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const analysis = generateMutation.data?.data?.analysis || data

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="page-header mb-0">
          <h1>Skill Analysis</h1>
          <p>AI analysis for <span className="text-accent">{analysis?.targetRole || 'your target role'}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              className="input w-52 text-sm"
              placeholder="Override target role…"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
            <button
              onClick={() => generateMutation.mutate(targetRole ? { targetRole } : {})}
              className="btn-outline flex items-center gap-2 text-sm py-2"
            >
              <RefreshCw size={14} /> Re-run
            </button>
          </div>
          <button onClick={() => navigate('/roadmap')} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            Generate Roadmap <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_160px] gap-5 mb-6">
        <div className="card">
          <div className="section-title">Your Current Skills</div>
          {analysis.currentSkills?.map((s, i) => <SkillBar key={i} name={s.name} current={s.level} />)}
        </div>
        <div className="card">
          <div className="section-title">Skill Gap Analysis</div>
          {analysis.currentSkills?.map((s, i) => {
            const req = analysis.requiredSkills?.find(r => r.name === s.name)
            return <SkillBar key={i} name={s.name} current={s.level} required={req?.level} showGap />
          })}
        </div>
        <div className="card flex flex-col items-center justify-center text-center">
          <div className="text-xs text-slate-500 mb-3">Readiness Score</div>
          <ReadinessRing score={analysis.readinessScore || 0} />
          <div className="text-xs text-slate-600 mt-3">{analysis.estimatedTimeToReady}</div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="section-title">AI Summary</div>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{analysis.summary}</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-bg rounded-xl p-3 border border-border/60">
            <div className="text-xs text-slate-500 mb-1">Target Role</div>
            <div className="font-semibold text-accent">{analysis.targetRole}</div>
          </div>
          <div className="bg-bg rounded-xl p-3 border border-border/60">
            <div className="text-xs text-slate-500 mb-1">Salary Insight</div>
            <div className="font-semibold">{analysis.salaryInsight?.slice(0, 60)}</div>
          </div>
          <div className="bg-bg rounded-xl p-3 border border-border/60">
            <div className="text-xs text-slate-500 mb-1">Time to Ready</div>
            <div className="font-semibold text-accent3">{analysis.estimatedTimeToReady}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="section-title mb-0">Critical Gaps</span>
          </div>
          {analysis.gaps?.map((g, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="font-medium text-sm">{g.skill}</div>
                <div className="text-xs text-slate-500 mt-0.5">{g.tip}</div>
              </div>
              <span className="ml-3 flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  color: g.priority === 'critical' ? '#ef4444' : g.priority === 'high' ? '#f59e0b' : '#94a3b8',
                  background: g.priority === 'critical' ? '#ef444415' : g.priority === 'high' ? '#f59e0b15' : '#ffffff10'
                }}>
                {g.priority}
              </span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-accent3" />
            <span className="section-title mb-0">Your Strengths</span>
          </div>
          {analysis.strengths?.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent3 flex-shrink-0" />
              <span className="text-sm text-slate-300">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
