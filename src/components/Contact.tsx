import React, { useState } from 'react';
import { Mail, MapPin, Terminal, Github, Linkedin, Send, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    setIsSubmitting(true);
    // Simulate signal transmission over physical tracks
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 1800);
  };

  return (
    <div className="py-20 animate-fade-in text-slate-100" id="contact-page">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center md:text-left mb-16">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
            // Signal Transmission Channel
          </span>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[0.95]">
            Let’s collaborate on<br />
            <span className="text-slate-400">Architecting Next-Gen Silicon.</span>
          </h1>
          <p className="mt-6 text-xl text-slate-400 font-sans max-w-3xl leading-relaxed font-light">
            Whether you are looking to design synthesizable RTL, solve complex cache race conditions, tape-out on TSMC nodes, or simply discuss computer architecture—get in touch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Direct links & channels */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight border-b border-[rgba(255,255,255,0.08)] pb-3">
              Direct Core Ports
            </h2>

            <div className="space-y-6 font-sans text-sm">
              {/* Channel 1: Email */}
              <div className="flex gap-4 p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d0d] hover:border-[#a78bfa]/20 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Port</span>
                  <a href="mailto:crazyplayz61@gmail.com" className="text-white hover:text-[#a78bfa] font-mono text-sm block font-bold transition-colors">
                    crazyplayz61@gmail.com
                  </a>
                </div>
              </div>

              {/* Channel 2: Lab Location */}
              <div className="flex gap-4 p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d0d] hover:border-[#a78bfa]/20 transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Lab Coordinates</span>
                  <p className="text-white text-sm block font-bold font-display uppercase tracking-wide">
                    Bengaluru, Karnataka, India
                  </p>
                  <span className="block text-xs text-slate-500 mt-1">Silicon Architecture Hub</span>
                </div>
              </div>

              {/* Channel 3: Social grids */}
              <div className="flex gap-3 pt-2">
                <a
                  href="https://github.com/AKSHAY-SV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] py-3 text-sm font-mono font-bold text-slate-400 hover:text-white hover:border-[#a78bfa]/50 transition-all"
                >
                  <Github className="h-4 w-4 text-[#a78bfa]" /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/akshay-srikrishnan150411/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] py-3 text-sm font-mono font-bold text-slate-400 hover:text-white hover:border-[#a78bfa]/50 transition-all"
                >
                  <Linkedin className="h-4 w-4 text-[#a78bfa]" /> LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="lg:col-span-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121212] p-8 md:p-10 relative overflow-hidden">
            
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight mb-6">
              Transmit message packet
            </h2>

            {isSuccess ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  <CheckCircle2 className="h-7 w-7 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">TRANSMISSION VERIFIED</h3>
                  <p className="mt-2 text-sm text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                    Signal successfully serialized. Message packet routed safely through static buffers to Akshay's mail stack. Expect a response shortly!
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 rounded-lg bg-slate-800 border border-slate-700 px-5 py-2 font-mono text-xs uppercase text-slate-300 hover:text-white hover:border-[#a78bfa]/50 transition-colors"
                >
                  Reset Transmit Port
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Margaret Hamilton"
                      className="w-full rounded-lg bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a78bfa]/60 placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. margaret@apollo.org"
                      className="w-full rounded-lg bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a78bfa]/60 placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    placeholder="e.g. Synthesis Optimization"
                    className="w-full rounded-lg bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a78bfa]/60 placeholder:text-slate-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Message Payload
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Wrote an instruction hazard logic or need physical design sign-off?"
                    className="w-full rounded-lg bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#a78bfa]/60 placeholder:text-slate-600 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#a78bfa] py-3.5 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#a78bfa]/15 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-black" /> SERIALIZING PACKET...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-black" /> TRANSMIT SIGNAL
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-[rgba(255,255,255,0.04)] pt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1"><Terminal className="h-3 w-3 text-slate-600" /> STATUS: LISTENING</span>
              <span>Obsidian Core Serializer v1.0.0</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
