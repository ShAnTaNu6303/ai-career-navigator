import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, User, BarChart2, Map, Briefcase,
  Users, MessageSquare, Bot, LogOut, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile Setup' },
  { to: '/analysis', icon: BarChart2, label: 'Skill Analysis' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/jobs', icon: Briefcase, label: 'Job Match' },
  { to: '/mentors', icon: Users, label: 'Mentors' },
  { to: '/community', icon: MessageSquare, label: 'Community' },
  { to: '/chat', icon: Bot, label: 'AI Assistant' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="font-mono text-accent text-xs font-bold tracking-widest">AI CAREER NAV</div>
          <div className="text-slate-600 text-[10px] tracking-wider mt-0.5">POWERED BY CLAUDE AI</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 border-l-2 ${
                isActive
                  ? 'text-accent bg-accent/8 border-accent'
                  : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/3'
              }`
            }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2.5 bg-bg rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-slate-600 truncate">{user?.role || 'user'}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-600 hover:text-red-400 transition-colors p-1">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-bg">
        <div className="max-w-6xl mx-auto p-8 animate-slide-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
