import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Parallax Background */}
            <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb-img-1_1770580497000_na1fn_aGVyby1zcXVhbWlzaC1tb3VudGFpbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczI4Sk52dDdGTmJxQkRjdmtlaVh3NS9zYW5kYm94LzV4eU5mVXRqMkQ4QUxXNjlZS3c4amItaW1nLTFfMTc3MDU4MDQ5NzAwMF9uYTFmbl9hR1Z5YnkxemNYVmhiV2x6YUMxdGIzVnVkR0ZwYmcucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=SE~uxSvE3adfcuA1DTsiUjz1v1U0eqOcUuFvOV2VEtO-ltH1eN8bYwoEY0CkU941QFqqh5UXGqRIQL0xb~R8K5WI4eJVAaIJXlnaitlmLVCSmQ7Zpjreo1eGwCEq9x2aeVkuubrHk6HyaqqymQgtROYrDJrq4WXAIBEVKSnR7zEsFH1rRIMk0Urh1jYVYgdikeh5ibEaBrTSjyRkDCKiBbyZ4-biRcZlwCBl0EuX1IaFFD5eKZGguaUYrW6D4jYSa5keetSWbAJjBBeDyG2-P7QOOhIVupR2h~PAcbXU4iujO1RUt7zn3jb6tJA-Wty9H~z0fydNm7NhwR4DGEVHXA__)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateY(${scrollY * 0.5}px)`,
            }}
            />
        
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background z-10" />

            {/* Hero Content */}
            <div className="container relative z-20 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
                Ready to Call Squamish Home?
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Discover mountain-view properties, modern townhomes, and luxury estates in BC’s outdoor paradise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                <Button size="lg" className="h-14 px-8 text-lg">
                Explore Properties
                <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/90 hover:bg-white">
                Schedule a Tour
                </Button>
            </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white/50 rounded-full" />
            </div>
            </div>
        </section>
    );
}