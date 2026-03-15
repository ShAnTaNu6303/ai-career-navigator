import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { analysisAPI, roadmapAPI, jobsAPI } from '../api'
import { BarChart2, Map, Briefcase, Zap, ArrowRight, Trophy, TrendingUp } from 'lucide-react'

const ReadinessRing = ({ score }) => {
  const r = 45, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1a2a4a" strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold" style={{ color }}>{score}</div>
        <div className="text-slate-500 text-[10px]">/ 100</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: analysisData } = useQuery({ queryKey: ['analysis'], queryFn: () => analysisAPI.getLatest().then(r => r.data.analysis), retry: false })
  const { data: roadmapData } = useQuery({ queryKey: ['roadmap'], queryFn: () => roadmapAPI.getActive().then(r => r.data.roadmap), retry: false })
  const { data: jobsData } = useQuery({ queryKey: ['jobs-preview'], queryFn: () => jobsAPI.getAll({ limit: 4 }).then(r => r.data) })

  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{greeting}, <span className="text-accent">{firstName}</span> 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your career overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Job Readiness', val: analysisData ? `${analysisData.readinessScore}%` : '--', icon: Zap, color: '#f59e0b', sub: analysisData ? analysisData.targetRole : 'Run analysis first' },
          { label: 'Skills Gap', val: analysisData ? `${analysisData.gaps?.length || 0}` : '--', icon: BarChart2, color: '#00d4ff', sub: 'gaps to close' },
          { label: 'Roadmap', val: roadmapData ? `${roadmapData.progressPercent}%` : '--', icon: Map, color: '#7c3aed', sub: roadmapData ? `${roadmapData.duration} plan` : 'Not started' },
          { label: 'Points', val: `${user?.points || 0}`, icon: Trophy, color: '#10b981', sub: 'career XP' },
        ].map(({ label, val, icon: Icon, color, sub }) => (
          <div key={label} className="card-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="font-mono text-2xl font-bold mb-1" style={{ color }}>{val}</div>
            <div className="text-xs text-slate-600 truncate">{sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Readiness + Analysis CTA */}
        <div className="card">
          <div className="flex items-center gap-4 mb-5">
            <ReadinessRing score={analysisData?.readinessScore || 0} />
            <div>
              <div className="font-semibold text-lg">{analysisData ? 'Job Readiness Score' : 'No Analysis Yet'}</div>
              <div className="text-sm text-slate-500 mt-1">
                {analysisData ? analysisData.summary?.slice(0, 100) + '…' : 'Complete your profile and run AI analysis to get your personalized career insights.'}
              </div>
            </div>
          </div>
          {!analysisData ? (
            <button onClick={() => navigate('/profile')} className="btn-primary w-full text-sm">
              Set Up Profile → Run Analysis
            </button>
          ) : (
            <button onClick={() => navigate('/analysis')} className="btn-outline w-full text-sm flex items-center justify-center gap-2">
              View Full Analysis <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Roadmap preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Active Roadmap</span>
            {roadmapData && (
              <span className="badge-blue">{roadmapData.duration === 'week' ? '1 Week' : roadmapData.duration === 'month' ? '1 Month' : '3 Months'}</span>
            )}
          </div>
          {roadmapData ? (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Overall Progress</span><span>{roadmapData.progressPercent}%</span>
                </div>
                <div className="skill-bar">
                  <div className="h-full bg-gradient-to-r from-accent2 to-accent rounded-full transition-all" style={{ width: `${roadmapData.progressPercent}%` }} />
                </div>
              </div>
              {roadmapData.phases?.slice(0, 3).map((phase, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${phase.status === 'done' ? 'bg-accent3' : phase.status === 'active' ? 'bg-accent' : 'bg-border'}`} />
                  <span className={`text-sm ${phase.status === 'active' ? 'text-accent' : phase.status === 'done' ? 'text-accent3' : 'text-slate-600'}`}>{phase.weekLabel}: {phase.title}</span>
                </div>
              ))}
              <button onClick={() => navigate('/roadmap')} className="btn-outline w-full text-sm mt-4 flex items-center justify-center gap-2">
                Open Full Roadmap <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <Map size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">No roadmap yet. Generate your analysis first.</p>
              <button onClick={() => navigate('/analysis')} className="btn-outline text-sm">Go to Analysis</button>
            </div>
          )}
        </div>
      </div>

      {/* Job matches preview */}
      {jobsData?.jobs?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Latest Job Matches</span>
            <button onClick={() => navigate('/jobs')} className="text-accent text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {jobsData.jobs.slice(0, 4).map(j => (
              <div key={j._id} className="bg-bg rounded-xl p-4 border border-border/60 hover:border-border transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-sm">{j.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{j.company} · {j.location}</div>
                  </div>
                </div>
                <div className="text-accent text-sm font-semibold">{j.salaryDisplay}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
