import PredictionCard from './PredictionCard'
import PreprocessingSteps from './PreprocessingSteps'
import GradCamSection from './GradCamSection'

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
        {number}
      </span>
      <div>
        <h3 className="text-white font-semibold text-base">{title}</h3>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function ResultPanel({ result }) {
  const originalSrc = result.preprocessing_steps?.original
    ? `data:image/png;base64,${result.preprocessing_steps.original}`
    : null

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Section 1: Input */}
      <section>
        <SectionHeader number="1" title="Input" subtitle="Uploaded chest radiograph" />
        <div className="glass-card-solid border border-slate-700/50 overflow-hidden inline-block">
          <div className="max-w-sm">
            {originalSrc ? (
              <img src={originalSrc} alt="Uploaded X-ray" className="w-full" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-700">No image</div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-white/5 bg-slate-800/30">
            <p className="text-slate-400 text-xs">Original uploaded image — unmodified baseline</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Section 2: Preprocessing */}
      <section>
        <SectionHeader
          number="2"
          title="Preprocessing Pipeline"
          subtitle="Each transformation shown as before & after — outputs stored at every step"
        />
        <PreprocessingSteps steps={result.preprocessing_steps} />
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Section 3: Prediction */}
      <section>
        <SectionHeader
          number="3"
          title="Prediction"
          subtitle="Model classification output with confidence score"
        />
        <div className="max-w-md">
          <PredictionCard result={result} />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Section 4: Explainability */}
      <section>
        <SectionHeader
          number="4"
          title="Explainability — Grad-CAM"
          subtitle="Visual explanation of which regions influenced the model's decision"
        />
        <GradCamSection result={result} />
      </section>
    </div>
  )
}
