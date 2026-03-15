import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '../api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Upload, FileText, Loader2, CheckCircle, User, Github, Linkedin } from 'lucide-react'

const FIELDS = ['Software Engineering', 'Data Science', 'Machine Learning', 'Product Management', 'DevOps', 'Mobile Development', 'UI/UX Design', 'Cybersecurity', 'Cloud Engineering', 'Blockchain']

export default function ProfileSetupPage() {
  const [mode, setMode] = useState('upload')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [form, setForm] = useState({ field: '', currentRole: '', targetRole: '', yearsExperience: '', education: '', location: '', desiredSalary: '', skills: '', careerGoal: '', challenges: '', githubUrl: '', linkedinUrl: '' })
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: profileData } = useQuery({ queryKey: ['profile'], queryFn: () => profileAPI.get().then(r => r.data.profile) })

  const uploadMutation = useMutation({
    mutationFn: (file) => { const fd = new FormData(); fd.append('resume', file); return profileAPI.uploadResume(fd) },
    onSuccess: (res) => {
      qc.invalidateQueries(['profile'])
      const ext = res.data.extracted
      if (ext) {
        setForm(p => ({ ...p, field: ext.field || p.field, currentRole: ext.currentRole || p.currentRole, location: ext.location || p.location, education: ext.education || p.education, yearsExperience: ext.yearsExperience || p.yearsExperience, skills: ext.skills?.join(', ') || p.skills }))
      }
      toast.success('Resume uploaded and parsed! Review the extracted info below.')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Upload failed')
  })

  const saveMutation = useMutation({
    mutationFn: (data) => profileAPI.updateManual(data),
    onSuccess: () => { qc.invalidateQueries(['profile']); toast.success('Profile saved!'); navigate('/analysis') },
    onError: (e) => toast.error(e.response?.data?.error || 'Save failed')
  })

  const onDrop = useCallback((files) => {
    if (files[0]) { setUploadedFile(files[0]); uploadMutation.mutate(files[0]) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 1
  })

  const handleSave = (e) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  return (
    <div>
      <div className="mb-8 page-header">
        <h1>Profile Setup</h1>
        <p>Tell us about you so we can personalize your career path</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-8">
        {[{ id: 'upload', label: '◈ Upload Resume', icon: Upload }, { id: 'manual', label: '◉ Manual Entry', icon: User }].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${mode === tab.id ? 'bg-accent/10 border-accent text-accent' : 'border-border text-slate-500 hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {mode === 'upload' && (
              <div>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-white/2'}`}>
                  <input {...getInputProps()} />
                  {uploadMutation.isPending ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="animate-spin text-accent" />
                      <p className="text-sm text-slate-400">Uploading & parsing with AI…</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle size={32} className="text-accent3" />
                      <p className="text-sm font-medium text-accent3">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-500">Click or drop to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={32} className="text-slate-600" />
                      <p className="font-medium">Drop your resume here</p>
                      <p className="text-xs text-slate-500">PDF or DOCX · Max 10MB</p>
                      <span className="btn-outline text-xs px-4 py-2">Browse File</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">GitHub Profile URL</label>
              <div className="relative"><Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input className="input pl-8" placeholder="https://github.com/yourname" value={form.githubUrl} onChange={e => setForm(p => ({...p, githubUrl: e.target.value}))} /></div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">LinkedIn Profile URL</label>
              <div className="relative"><Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input className="input pl-8" placeholder="https://linkedin.com/in/yourname" value={form.linkedinUrl} onChange={e => setForm(p => ({...p, linkedinUrl: e.target.value}))} /></div>
            </div>

            {/* Core fields */}
            {[
              { label: 'Field / Domain', key: 'field', type: 'select', opts: FIELDS },
              { label: 'Current Role', key: 'currentRole', placeholder: 'e.g. Frontend Developer' },
              { label: 'Target Role', key: 'targetRole', placeholder: 'e.g. Senior Full Stack Engineer at a product startup' },
              { label: 'Years of Experience', key: 'yearsExperience', placeholder: '3', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1.5">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="input" value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}>
                    <option value="">Select field…</option>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} className="input" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} />
                )}
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {[
              { label: 'Highest Education', key: 'education', placeholder: 'e.g. B.Tech Computer Science, IIT Delhi' },
              { label: 'Location', key: 'location', placeholder: 'e.g. Bangalore, India' },
              { label: 'Desired Salary (LPA)', key: 'desiredSalary', placeholder: 'e.g. 20', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1.5">{f.label}</label>
                <input type={f.type || 'text'} className="input" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} />
              </div>
            ))}

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Current Skills (comma-separated)</label>
              <input className="input" placeholder="React, JavaScript, Node.js, Python…" value={form.skills} onChange={e => setForm(p => ({...p, skills: e.target.value}))} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Career Goal (open-ended)</label>
              <textarea rows={3} className="input resize-none" placeholder="Describe your dream role, where you want to be in 2 years, what kind of company…" value={form.careerGoal} onChange={e => setForm(p => ({...p, careerGoal: e.target.value}))} />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Biggest Challenge Right Now</label>
              <textarea rows={3} className="input resize-none" placeholder="What's blocking you? Interview skills, salary negotiation, skill gaps, switching fields…" value={form.challenges} onChange={e => setForm(p => ({...p, challenges: e.target.value}))} />
            </div>

            <button type="submit" disabled={saveMutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {saveMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : '⬡ Save & Run AI Analysis →'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
