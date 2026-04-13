"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" />
      <header className="fixed top-0 w-full z-50 bg-transparent">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white font-['DM_Sans'] group cursor-pointer transition-colors">
            <span className="text-gray-500 group-hover:text-white transition-colors">//</span> SecretTunnel
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      <main className="bg-[#0a0a0f]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <section className="relative flex flex-col items-center justify-center min-h-screen pt-24 pb-20 overflow-hidden px-6">
          {/* Subtle Background Detail */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03]"></div>
            {/* Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,75,0.12)_0%,transparent_50%)]"></div>
          </div>

          <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center mt-12">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d4a84b]/20 bg-white/5 backdrop-blur-md mb-8 text-[13px] font-medium text-[#d4a84b]">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Zero-knowledge encryption · Open source
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.05] text-white mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Share .env secrets<br />
              without <span className="text-[#d4a84b]">fear.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-[20px] text-gray-400 max-w-2xl mx-auto mb-16">
              Paste your secrets. Get a one-time link. The server never sees your plaintext — ever.
            </p>

            {/* The Visual / Centerpiece */}
            <div className="w-full max-w-4xl mx-auto mb-16 relative group perspective-[1000px]">
              <div className="absolute -inset-0.5 bg-[#d4a84b]/20 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-500"></div>
              <div className="relative bg-[#111116] border border-white/10 rounded-xl p-6 md:p-8 font-['DM_Mono'] text-[13px] md:text-sm text-left overflow-x-auto terminal-shadow">
                
                <div className="flex justify-between text-gray-500 mb-6 pb-4 border-b border-white/10 select-none px-4">
                  <span className="w-1/4 text-center">[ You ]</span>
                  <span className="w-1/2 text-center">[ Server ]</span>
                  <span className="w-1/4 text-center">[ Them ]</span>
                </div>

                <div className="space-y-4 text-gray-300 min-w-[700px] px-8 pb-4">
                  {/* Step 1 */}
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_forwards]">
                     <div className="w-1/4 text-center">Paste .env content</div>
                     <div className="w-1/2"></div>
                     <div className="w-1/4"></div>
                  </div>
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_0.5s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center text-gray-500">│</div>
                     <div className="w-1/2"></div>
                     <div className="w-1/4"></div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_1s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center"><span className="mr-2">🔐</span>AES-256-GCM encrypt<br/><span className="text-gray-500 text-xs mt-1 block">(in your browser)</span></div>
                     <div className="w-1/2"></div>
                     <div className="w-1/4"></div>
                  </div>
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_1.5s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center text-gray-500">│</div>
                     <div className="w-1/2 text-[#d4a84b]/70 text-xs flex items-center justify-center pt-2">stores only ciphertext</div>
                     <div className="w-1/4"></div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_2s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center">POST /api/secrets</div>
                     <div className="w-1/2 flex items-center justify-center text-[#d4a84b]">──────►</div>
                     <div className="w-1/4 text-center">◄── GET /api/secrets/:id</div>
                  </div>
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_2.5s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center text-gray-500">│</div>
                     <div className="w-1/2"></div>
                     <div className="w-1/4 text-center text-gray-500">│</div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex items-start animate-[fadeIn_0.5s_ease-out_3s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                     <div className="w-1/4 text-center">Receive shareable link<br/><span className="text-gray-500 text-xs mt-1 block leading-relaxed">(key stays in URL hash,<br/>never sent to server)</span></div>
                     <div className="w-1/2"></div>
                     <div className="w-1/4 text-center">
                        <div className="mb-3"><span className="mr-2">🔓</span>Decrypt in browser</div>
                        <div className="text-gray-500 mb-3">│</div>
                        <div className="mb-3">Plaintext shown once</div>
                        <div className="text-gray-500 text-xs">► Link self-destructs</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full z-10 relative">
              <Link href="/dashboard" className="bg-white text-black font-semibold px-8 py-3.5 rounded-md hover:bg-gray-100 transition-colors text-[15px] sm:w-auto w-full max-w-[280px]">
                Share a Secret
              </Link>
              <a href="https://github.com/itS-dev-sharma/secrettunnel" target="_blank" rel="noopener noreferrer" className="bg-transparent border border-white/20 text-white font-semibold px-8 py-3.5 rounded-md hover:bg-white/5 transition-colors text-[15px] flex items-center justify-center gap-2 sm:w-auto w-full max-w-[280px]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                View on GitHub
              </a>
            </div>

            {/* Trust Line */}
            <p className="text-[13px] text-gray-500 font-medium flex items-center justify-center gap-2">
              <span className="text-gray-400">🔒</span> Your plaintext never leaves your browser. Encrypted with AES-256-GCM via the Web Crypto API.
            </p>

          </div>
        </section>

        <section className="relative w-full py-24 md:py-32 bg-[#0a0a0f] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 items-start">
            
            {/* Left side */}
            <div className="w-full">
              <div className="font-['DM_Mono'] text-[#d4a84b] text-sm uppercase tracking-widest">
                // CLI Tool
              </div>
              <h2 className="font-['DM_Sans'] font-bold text-3xl md:text-4xl text-white mt-4 mb-6">
                Automate from your terminal
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                No browser required. Push and pull encrypted secrets directly from your workflow — CI pipelines, shell scripts, onboarding flows.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-[#d4a84b]">→</span> Push your .env file with one command
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-[#d4a84b]">→</span> Pull directly into a file — never touches clipboard
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="text-[#d4a84b]">→</span> Burn-after-read. One view, then gone forever
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="w-full relative group perspective-[1000px]">
              <div className="absolute -inset-0.5 bg-[#d4a84b]/15 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-500"></div>
              
              <div className="relative flex flex-col gap-6">
                {/* First terminal card */}
                <div className="bg-[#0d0d0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-[#131315]">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    </div>
                    <div className="font-['DM_Mono'] text-xs text-slate-500 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
                      terminal
                    </div>
                  </div>
                  <div className="p-6 font-['DM_Mono'] text-sm leading-8 overflow-x-auto text-left">
                    <div>
                      <span className="text-slate-500">$</span>
                      <span className="text-[#d4a84b]">  npx secrettnl push</span>
                      <span className="text-white"> .env</span>
                      <span className="text-slate-400">  --ttl 24h</span>
                    </div>
                    <div className="h-4"></div>
                    <div className="flex items-center">
                      <span className="text-slate-500">  Encrypting...</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4a84b] animate-pulse ml-2"></span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-emerald-400">  ✓ Secret created</span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-slate-500">  Share URL:</span>
                    </div>
                    <div>
                      <span className="text-[#d4a84b] underline decoration-1 underline-offset-4">  https://secrettunnel.app/s/x9k2m</span>
                      <span className="text-slate-500">  #key=aB3...</span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-slate-500 text-xs">  ⚑ Burn-after-read · Expires in 24h</span>
                    </div>
                    
                    <div className="border-t border-white/5 mt-4 pt-4">
                      <div className="text-slate-600 text-xs">
                        Secret not found. It may have expired or already been viewed.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second terminal card */}
                <div className="bg-[#0d0d0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-[#131315]">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                       <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    </div>
                    <div className="font-['DM_Mono'] text-xs text-slate-500 uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
                      terminal
                    </div>
                  </div>
                  <div className="p-6 font-['DM_Mono'] text-sm leading-8 overflow-x-auto text-left">
                    <div>
                      <span className="text-slate-500">$</span>
                      <span className="text-[#d4a84b]">  npx secrettnl pull</span>
                      <span className="text-slate-300"> "https://secrettunnel.app/s/x9k2m#key=aB3..."</span>
                      <span className="text-slate-400">  --output .env</span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-slate-500">  Fetching...</span>
                    </div>
                    <div>
                      <span className="text-slate-500">  Decrypting in browser...</span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-emerald-400">  ✓ Written to .env</span>
                    </div>
                    <div className="h-4"></div>
                    <div>
                      <span className="text-slate-500 text-xs">  ⚑ Token consumed. Secret permanently deleted.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </section>

        <section id="features" className="py-24 md:py-32 bg-[#131314] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-20 space-y-4">
              <h2 className="text-4xl font-['DM_Sans'] font-bold text-white"><span className="text-[#d4a84b]">//</span> Advanced Capabilities</h2>
              <p className="text-slate-400 text-lg max-w-2xl">Beyond just sharing. Manage the lifecycle, history, and notifications for all your critical data seamlessly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
              <div className="order-2 lg:order-1 relative rounded-xl border border-white/10 bg-[#0e0e0f] overflow-hidden terminal-shadow p-6 group">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-white/20"></div>
                     <div className="w-3 h-3 rounded-full bg-white/20"></div>
                     <div className="w-3 h-3 rounded-full bg-white/20"></div>
                   </div>
                   <div className="font-['DM_Mono'] text-xs text-slate-500 uppercase tracking-widest">Diff Editor</div>
                </div>
                <div className="font-['DM_Mono'] text-sm leading-relaxed overflow-x-auto text-left">
                  <div className="flex bg-transparent py-1">
                    <span className="w-8 text-slate-600 select-none text-right pr-4">12</span>
                    <span className="text-slate-300">DATABASE_URL="postgresql://user:***@host:5432/db"</span>
                  </div>
                  <div className="flex bg-red-500/10 py-1 border-l-2 border-red-500">
                    <span className="w-8 text-red-400/60 select-none text-right pr-4">13</span>
                    <span className="text-red-400">- API_KEY="sk_old_8f29d2k..."</span>
                  </div>
                  <div className="flex bg-[#d4a84b]/10 py-1 border-l-2 border-[#d4a84b]">
                    <span className="w-8 text-[#d4a84b]/60 select-none text-right pr-4">14</span>
                    <span className="text-[#d4a84b]">+ API_KEY="sk_new_931ms0q..." <span className="opacity-50">// updated</span></span>
                  </div>
                  <div className="flex bg-transparent py-1">
                    <span className="w-8 text-slate-600 select-none text-right pr-4">15</span>
                    <span className="text-slate-300">NEXT_PUBLIC_URL="https://app.example.com"</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#d4a84b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              <div className="order-1 lg:order-2 space-y-6">
                <div className="w-14 h-14 rounded-xl bg-[#d4a84b]/10 flex items-center justify-center text-[#d4a84b] mb-2 border border-[#d4a84b]/20">
                  <span className="material-symbols-outlined text-2xl">history</span>
                </div>
                <h3 className="text-3xl font-['DM_Sans'] font-bold text-white tracking-tight">Version Tracking & Diffing</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Never lose context on changes to your configuration files. Track multiple versions of your shared secrets, complete with an integrated, secure diffing algorithm.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#d4a84b] text-xl mt-0.5">check_circle</span>
                    <p className="text-slate-300 text-base">Visualize precise additions and removals between states.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#d4a84b] text-xl mt-0.5">check_circle</span>
                    <p className="text-slate-300 text-base">Roll back to previous secure encryptions immediately.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-xl bg-[#d4a84b]/10 flex items-center justify-center text-[#d4a84b] mb-2 border border-[#d4a84b]/20">
                  <span className="material-symbols-outlined text-2xl">webhook</span>
                </div>
                <h3 className="text-3xl font-['DM_Sans'] font-bold text-white tracking-tight">Real-Time Webhook Events</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Attach custom webhooks to your vaults. Build automated, developer-friendly workflows by receiving HTTP POST events whenever critical actions occur.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="px-4 py-2 border border-white/5 bg-[#1a191a] rounded text-sm font-['DM_Mono'] text-slate-300"><span className="text-[#d4a84b] mr-2">●</span> secret.accessed</div>
                  <div className="px-4 py-2 border border-white/5 bg-[#1a191a] rounded text-sm font-['DM_Mono'] text-slate-300"><span className="text-[#d4a84b] mr-2">●</span> secret.expired</div>
                </div>
              </div>
              
              <div className="relative rounded-xl border border-white/10 bg-[#0e0e0f] overflow-hidden terminal-shadow p-6 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-[#1a191a] border border-white/5 rounded">
                  <div className="px-2 py-1 bg-[#d4a84b]/20 text-[#d4a84b] text-xs font-['DM_Mono'] font-bold rounded">POST</div>
               <div className="text-sm font-['DM_Mono'] text-slate-400 truncate">https://api.yoursite.com/webhooks/stnl</div>
                </div>
                <div className="bg-[#1a191a] border border-white/5 rounded px-6 py-5 font-['DM_Mono'] text-sm leading-relaxed scrollbar-hide overflow-x-auto text-left">
                  <span className="text-slate-500">{"{"}</span><br />
                  &nbsp;&nbsp;<span className="text-[#d4a84b]/80">"event"</span>: <span className="text-[#e5e2e3]">"secret.accessed"</span>,<br />
                  &nbsp;&nbsp;<span className="text-[#d4a84b]/80">"data"</span>: <span className="text-slate-500">{"{"}</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d4a84b]/80">"vault_id"</span>: <span className="text-[#e5e2e3]">"v_8f29d2k..."</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d4a84b]/80">"timestamp"</span>: <span className="text-[#e5e2e3]">"2025-01-15T09:41:00Z"</span><br />
                  &nbsp;&nbsp;<span className="text-slate-500">{"}"}</span><br />
                  <span className="text-slate-500">{"}"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full py-16 bg-[#0e0e0f] border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            <div className="space-y-6 lg:col-span-2 pr-8">
              <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-['DM_Sans']">
                <span className="text-[#d4a84b]">//</span> SecretTunnel
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                The terminal vault for digital identity and secret management. Built for developers requiring uncompromising AES-256-GCM encryption.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-['DM_Sans'] font-semibold text-white tracking-wide">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">Features</Link></li>
                <li><Link href="#features" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">Architecture & Pipeline</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-['DM_Sans'] font-semibold text-white tracking-wide">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">CLI Reference</Link></li>
                <li><Link href="#" className="text-slate-400 text-sm hover:text-[#d4a84b] transition-colors">Contact Support</Link></li>
              </ul>
            </div>

          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 font-['DM_Mono'] text-xs uppercase tracking-widest">
              © {new Date().getFullYear()} SecretTunnel
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-500 hover:text-[#d4a84b] transition-colors">
                 <span className="sr-only">GitHub</span>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </Link>
              <Link href="#" className="text-slate-500 hover:text-[#d4a84b] transition-colors">
                 <span className="sr-only">Twitter</span>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
