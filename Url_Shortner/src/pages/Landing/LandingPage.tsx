import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Copy,
  Clock,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [input, Setinput] = useState("");

  const handleShortenClick = () => {
    if (input.trim()) {
      navigate("/dashboard", { state: { initialUrl: input.trim() } });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-sky-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 bg-clip-text text-transparent">
                UrlShortner
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium -mt-1 hidden sm:inline">
                Fast & Scalable
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => navigate("/sign-in")}
              variant="ghost"
              className="px-3 sm:px-4 text-sm sm:text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer rounded-lg transition-colors"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="px-4 sm:px-5 text-sm sm:text-base font-medium bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/25 cursor-pointer rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Get Started Free
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Next-Gen URL Shortening & Real-Time Analytics</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          Shorten your links,{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            broaden your reach
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          The enterprise-grade link management platform. Create custom branded
          links, track detailed click analytics, and control expiration — in
          milliseconds.
        </p>

        {/* Shortener Box */}
        <div className="mt-8 sm:mt-10 w-full max-w-3xl">
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/60 border border-sky-100 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
            <div className="relative w-full flex items-center">
              <Link2 className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <Input
                className="w-full h-13 sm:h-14 pl-12 pr-4 bg-transparent border-0 text-slate-900 placeholder:text-slate-400 text-base sm:text-lg focus-visible:ring-0 shadow-none"
                placeholder="Paste your long URL here (e.g., https://example.com/very-long-link)"
                type="url"
                value={input}
                onChange={(e) => Setinput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleShortenClick();
                }}
              />
            </div>
            <Button
              className="w-full sm:w-auto h-13 sm:h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer rounded-xl shrink-0 flex items-center justify-center gap-2 group transition-all"
              onClick={handleShortenClick}
            >
              <span>Shorten Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom Slugs
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mt-16 sm:mt-24 md:mt-32 w-full">
          <div className="flex flex-col items-center mb-10 sm:mb-14">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
              How it works
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Three simple steps to maximize your digital impact
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Copy className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                Step 1
              </span>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Paste Link</h4>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Drop your long, messy link into our secure shortening engine with zero hassle.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">
                Step 2
              </span>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Customize Slug</h4>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Customize your unique alias, choose expiration times, or generate memorable slugs instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <BarChart3 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                Step 3
              </span>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Track & Share</h4>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Distribute across any platform and inspect live visitor analytics, devices, and countries.
              </p>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="mt-16 sm:mt-24 w-full">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Engineered for speed, built for scale
              </h3>
              <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
                Whether you need a quick link for social media or manage millions of enterprise redirects, UrlShortner gives you the precision tools you need.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-indigo-800/60 pt-8">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1">
                    <Zap className="w-5 h-5" />
                    <span>Sub-millisecond</span>
                  </div>
                  <p className="text-sm text-slate-400">Ultra-low latency URL redirections worldwide</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1">
                    <Shield className="w-5 h-5" />
                    <span>Protected</span>
                  </div>
                  <p className="text-sm text-slate-400">Secure link expiration and account isolation</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1">
                    <Globe className="w-5 h-5" />
                    <span>Deep Insights</span>
                  </div>
                  <p className="text-sm text-slate-400">Full device, OS, and referer intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-sky-100 bg-white/60 backdrop-blur-xs py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">UrlShortner</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            © {new Date().getFullYear()} UrlShortner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
