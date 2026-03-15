// JobMatchPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jobsAPI } from '../api'
import { Search, MapPin, Briefcase, DollarSign, Loader2, ExternalLink } from 'lucide-react'

export function JobMatchPage() {
  const [filters, setFilters] = useState({ field: '', role: '', exp: '', location: '', page: 1 })
  const [applied, setApplied] = useState(filters)

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', applied],
    queryFn: () => jobsAPI.getAll(applied).then(r => r.data),
  })

  return (
    <div>
      <div className="mb-8 page-header"><h1>Job Match</h1><p>Real opportunities matched to your profile</p></div>

      <div className="card mb-6">
        <div className="grid grid-cols-4 gap-3 items-end">
          {[
            { key: 'field', placeholder: 'Field (e.g. Frontend)' },
            { key: 'role', placeholder: 'Role (e.g. Engineer)' },
            { key: 'location', placeholder: 'Location' },
            { key: 'exp', placeholder: 'Years exp', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-500 block mb-1.5 capitalize">{f.key}</label>
              <input type={f.type || 'text'} className="input text-sm" placeholder={f.placeholder} value={filters[f.key]}
                onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button onClick={() => setApplied({ ...filters, page: 1 })} className="btn-primary mt-4 flex items-center gap-2 text-sm">
          <Search size={14} /> Search Jobs
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-accent" /></div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">{data?.total || 0} jobs found</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data?.jobs?.map(j => (
              <div key={j._id} className="card hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-base">{j.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{j.company} · {j.location}</div>
                  </div>
                  <span className="badge-green text-xs flex-shrink-0">{j.type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm mb-3">
                  <span className="text-accent font-bold">{j.salaryDisplay}</span>
                  <span className="text-slate-500">{j.experienceMin}-{j.experienceMax} yrs</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-4">
                  {j.requiredSkills?.slice(0, 4).map(s => <span key={s} className="tag text-[10px]">{s}</span>)}
                </div>
                <div className="flex gap-2">
                  {j.applyUrl ? (
                    <a href={j.applyUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-center text-sm flex items-center justify-center gap-1.5">
                      Apply Now <ExternalLink size={12} />
                    </a>
                  ) : <button className="btn-primary flex-1 text-sm">Apply Now</button>}
                  <button className="btn-outline text-sm px-4">Save</button>
                </div>
              </div>
            ))}
          </div>
          {!data?.jobs?.length && (
            <div className="text-center py-16 text-slate-600">No jobs found. Try different filters or seed the database.</div>
          )}
        </>
      )}
    </div>
  )
}

export default JobMatchPage
