import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
    { id: 'assessments', label: 'Assessments', icon: 'assignment', path: '/assessments' },
    { id: 'candidates', label: 'Candidates', icon: 'group', path: '/candidates' },
    { id: 'interviews', label: 'Interviews', icon: 'videocam', path: '/interviews' },
]

export default function Sidebar() {
    const { user } = useAuth()
    const location = useLocation()

    return (
        <aside className="w-[260px] fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm transition-all duration-300">
            <div className="p-8 flex items-center gap-3">
                <div className="bg-primary rounded-xl p-2 text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-2xl leading-none">psychology</span>
                </div>
                <span className="font-black text-xl tracking-tighter text-slate-900">Keboli <span className="text-primary tracking-normal">AI</span></span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/')
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {item.icon}
                            </span>
                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                        </Link>
                    )
                })}

                <div className="pt-8 mt-8 border-t border-slate-100">
                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all duration-200"
                    >
                        <span className="material-symbols-outlined text-slate-400">settings</span>
                        <span className="font-bold text-sm tracking-tight">Settings</span>
                    </Link>
                </div>
            </nav>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shadow-inner flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">person</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-slate-900 truncate">{user?.email?.split('@')[0] || 'User'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Hiring Manager</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
