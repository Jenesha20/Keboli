import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex min-h-screen bg-slate-50/50 font-sans">
            <Sidebar />
            <div className="flex-1 ml-[264px] flex flex-col min-h-screen">
                <Header />
                <main className="mt-[64px] p-8 flex-grow">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
                <footer className="py-6 px-8 text-center text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] border-t border-slate-100">
                    © 2026 Keboli AI • Intelligent Recruitment Platform
                </footer>
            </div>
        </div>
    )
}
