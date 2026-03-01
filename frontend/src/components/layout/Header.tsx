
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function Header() {
    const { logout } = useAuth()

    return (
        <header className="h-[72px] fixed top-0 right-0 left-[260px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 z-10 transition-all duration-300">
            <div className="flex items-center gap-4 w-1/2">
                <div className="relative w-full max-w-md group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-primary">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                        placeholder="Search resources, candidates, assessments..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-6 mr-4">
                    <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-xl transition-all text-xs border border-slate-200 hover:border-rose-100 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                </button>
            </div>
        </header>
    )
}
