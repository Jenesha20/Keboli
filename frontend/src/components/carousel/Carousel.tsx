import { useState, useEffect } from 'react'


interface Slide {
    title: string
    description: string
    image: string
}

interface CarouselProps {
    slides: Slide[]
    autoPlayInterval?: number
    accentColor?: string
}

export default function Carousel({ slides, autoPlayInterval = 5000, accentColor = 'bg-primary' }: CarouselProps) {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, autoPlayInterval)
        return () => clearInterval(timer)
    }, [slides.length, autoPlayInterval])

    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center p-8 md:p-12 transition-all duration-700">
            <div className="w-full max-w-sm aspect-square relative mb-8 group">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 transform ${index === current ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-8'
                            }`}
                    >
                        <div
                            className="w-full h-full bg-cover bg-center rounded-2xl shadow-lg border border-slate-200/50"
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        />
                    </div>
                ))}
            </div>

            <div className="h-40 flex flex-col items-center">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-500 transform ${index === current ? 'opacity-100 translate-y-0 relative block' : 'opacity-0 translate-y-4 absolute hidden'
                            }`}
                    >
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">{slide.title}</h3>
                        <p className="text-slate-500 max-w-xs leading-relaxed">{slide.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`transition-all duration-300 rounded-full ${index === current ? `w-8 h-1.5 ${accentColor}` : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
