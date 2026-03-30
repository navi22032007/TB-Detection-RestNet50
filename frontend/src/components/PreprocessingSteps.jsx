import { useState } from 'react'

const PIPELINE = [
  {
    step: '6.2',
    before: 'original',
    after: 'resized',
    label: 'Resize',
    purpose: 'Ensure uniform input size for the model',
    desc: 'Image scaled to 256×256 pixels for consistent neural network input',
    beforeLabel: 'Original',
    afterLabel: 'Resized (256×256)',
    color: 'violet',
  },
  {
    step: '6.4',
    before: 'resized',
    after: 'enhanced',
    label: 'Contrast Enhancement (CLAHE)',
    purpose: 'Enhance local contrast in X-ray images',
    desc: 'Adaptive histogram equalization improves visibility of subtle patterns such as lesions',
    beforeLabel: 'Resized',
    afterLabel: 'CLAHE Enhanced',
    color: 'cyan',
  },
  {
    step: '6.5',
    before: 'enhanced',
    after: 'denoised',
    label: 'Denoising (Optional)',
    purpose: 'Reduce noise while preserving important edges',
    desc: 'Gaussian blur (3×3 kernel) smooths high-frequency noise — useful for DIP demonstration',
    beforeLabel: 'Enhanced',
    afterLabel: 'Denoised',
    color: 'teal',
    optional: true,
  },
  {
    step: '6.3',
    before: 'denoised',
    after: 'normalized',
    label: 'Normalization',
    purpose: 'Scale pixel values to a consistent range',
    desc: 'Pixel values converted from [0, 255] to [0, 1] for stable neural network input',
    beforeLabel: 'Denoised',
    afterLabel: 'Normalized [0, 1]',
    color: 'emerald',
  },
]

const COLOR_MAP = {
  violet:  { border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  text: 'text-violet-300',  accent: 'bg-violet-500' },
  cyan:    { border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10',    text: 'text-cyan-300',    accent: 'bg-cyan-500' },
  teal:    { border: 'border-teal-500/30',    bg: 'bg-teal-500/10',    text: 'text-teal-300',    accent: 'bg-teal-500' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300', accent: 'bg-emerald-500' },
}

export default function PreprocessingSteps({ steps }) {
  const [enlarged, setEnlarged] = useState(null)

  return (
    <div className="space-y-5">
      {/* Pipeline flow indicator */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {['Original', 'Resize', 'CLAHE', 'Denoise', 'Normalize', 'Model Input'].map((name, i, arr) => (
          <span key={name} className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md font-medium ${
              i === 0 || i === arr.length - 1
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {name}
            </span>
            {i < arr.length - 1 && (
              <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        ))}
      </div>

      {/* Before/After cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {PIPELINE.map((step, idx) => {
          const c = COLOR_MAP[step.color]
          const beforeSrc = steps[step.before] ? `data:image/png;base64,${steps[step.before]}` : null
          const afterSrc = steps[step.after] ? `data:image/png;base64,${steps[step.after]}` : null

          return (
            <div key={idx} className={`glass-card-solid border ${c.border} overflow-hidden`}>
              {/* Step header */}
              <div className={`${c.bg} px-4 py-3 flex items-center gap-3`}>
                <span className={`w-6 h-6 rounded-md ${c.accent} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${c.text}`}>{step.label}</p>
                    {step.optional && (
                      <span className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700 px-1.5 py-0.5 rounded">
                        optional
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs leading-tight mt-0.5">{step.purpose}</p>
                </div>
                <span className="text-slate-600 text-xs font-mono shrink-0">Step {step.step}</span>
              </div>

              {/* Before / After images */}
              <div className="p-4">
                <div className="flex items-stretch gap-3">
                  {/* Before */}
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={() => beforeSrc && setEnlarged({ src: beforeSrc, label: step.beforeLabel, step: step.label })}
                  >
                    <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      Before
                    </div>
                    <div className="aspect-square bg-black/40 rounded-xl overflow-hidden relative">
                      {beforeSrc ? (
                        <>
                          <img src={beforeSrc} alt={step.beforeLabel} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1.5 text-center">{step.beforeLabel}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center justify-center pt-5 shrink-0">
                    <div className={`w-0.5 flex-1 ${c.accent} opacity-20 rounded-full`} />
                    <div className={`my-2 w-8 h-8 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                      <svg className={`w-4 h-4 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className={`w-0.5 flex-1 ${c.accent} opacity-20 rounded-full`} />
                  </div>

                  {/* After */}
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={() => afterSrc && setEnlarged({ src: afterSrc, label: step.afterLabel, step: step.label })}
                  >
                    <div className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.accent}`} />
                      After
                    </div>
                    <div className={`aspect-square bg-black/40 rounded-xl overflow-hidden relative ring-1 ring-inset ${c.border}`}>
                      {afterSrc ? (
                        <>
                          <img src={afterSrc} alt={step.afterLabel} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                      )}
                    </div>
                    <p className={`text-xs mt-1.5 text-center ${c.text}`}>{step.afterLabel}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs mt-3 leading-relaxed border-t border-white/5 pt-3">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox modal */}
      {enlarged && (
        <LightboxModal
          src={enlarged.src}
          label={enlarged.label}
          step={enlarged.step}
          onClose={() => setEnlarged(null)}
        />
      )}
    </div>
  )
}

function LightboxModal({ src, label, step, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-card-solid max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h4 className="text-white font-semibold">{label}</h4>
            <p className="text-slate-500 text-xs">{step}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 bg-black/30">
          <img src={src} alt={label} className="w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
