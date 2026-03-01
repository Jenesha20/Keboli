import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const features = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.573.097a21.79 21.79 0 01-7.124 0l-.573-.097c-1.718-.293-2.3-2.379-1.067-3.61L12 15" />
            </svg>
        ),
        title: 'AI Skill Assessment',
        desc: 'Dynamically generated questions based on job description and candidate performance in real-time.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        ),
        title: 'Real-Time Voice Interview',
        desc: 'Natural voice-based conversations powered by advanced speech recognition and synthesis.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        title: 'Automated Evaluation Reports',
        desc: 'Comprehensive scoring with AI-generated summaries, skill breakdowns, and hiring recommendations.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: 'Bias-Free Scoring',
        desc: 'Objective, rubric-based evaluation eliminates unconscious bias for fairer hiring decisions.',
    },
];

const steps = [
    { num: '01', title: 'Upload Job Description', desc: 'Hiring manager creates an assessment with role requirements.' },
    { num: '02', title: 'Invite Candidates', desc: 'Send personalized interview links to candidates via email.' },
    { num: '03', title: 'AI Conducts Interview', desc: 'Candidates take an adaptive voice interview at their convenience.' },
    { num: '04', title: 'Review Reports', desc: 'Get detailed evaluation reports with scores and recommendations.' },
];

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">K</span>
                        </div>
                        <span className="text-xl font-bold text-primary-700 tracking-tight">Keboli</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                            Sign In
                        </Button>
                        <Button size="sm" onClick={() => navigate('/register')}>
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="gradient-hero">
                    <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
                        <div className="max-w-3xl animate-[slide-up_0.6s_ease-out]">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-[pulse-soft_2s_ease-in-out_infinite]"></span>
                                <span className="text-sm text-white/80 font-medium">Now with real-time voice AI</span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                                AI-Powered Interview<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Platform</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
                                Automate skill-based interviews with adaptive AI that evaluates candidates
                                in real-time. Unbiased, consistent, and scalable technical screening.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" onClick={() => navigate('/register')}
                                    className="!bg-white !text-primary-700 hover:!bg-white/90 !shadow-lg"
                                >
                                    For Hiring Managers
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => navigate('/interview/welcome')}
                                    className="!border-white/30 !text-white hover:!bg-white/10"
                                >
                                    Take Interview
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative wave bottom */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" className="w-full text-surface">
                        <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 64C1200 64 1320 48 1380 40L1440 32V80H0Z" fill="currentColor" />
                    </svg>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-text-primary mb-4">Why choose Keboli?</h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Enterprise-grade interview automation that saves time and improves hiring quality.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="group bg-surface rounded-xl border border-border p-6 hover:shadow-lg
                         hover:border-primary-200 transition-all duration-300
                         animate-[slide-up_0.5s_ease-out] cursor-default"
                            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center
                              justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                {f.icon}
                            </div>
                            <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-surface-tertiary py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">How it works</h2>
                        <p className="text-lg text-text-secondary">Four simple steps to smarter hiring</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((s, i) => (
                            <div key={i} className="relative">
                                <div className="text-5xl font-bold text-primary-100 mb-3">{s.num}</div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">{s.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 -right-4 w-8 text-primary-200">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="gradient-primary rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
                    <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                        Join organizations using AI to conduct fair, consistent, and scalable interviews.
                    </p>
                    <Button size="lg" onClick={() => navigate('/register')}
                        className="!bg-white !text-primary-700 hover:!bg-white/90"
                    >
                        Get Started Free
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-surface">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-xs">K</span>
                            </div>
                            <span className="text-lg font-bold text-primary-700">Keboli</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-text-secondary">
                            <a href="#" className="hover:text-text-primary transition-colors">About</a>
                            <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
                            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
                        </div>
                        <p className="text-xs text-text-tertiary">© 2026 Keboli. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
