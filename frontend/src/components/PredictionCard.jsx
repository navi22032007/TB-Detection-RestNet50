export default function PredictionCard({ result }) {
  const isTB = result.prediction === 'Tuberculosis'
  const confidencePct = Math.round(result.confidence * 100)

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (confidencePct / 100) * circumference

  return (
    <div className={`glass-card-solid p-6 space-y-5 border-2 ${
      isTB ? 'border-red-500/30' : 'border-emerald-500/30'
    }`}>
      {/* Status Banner */}
      <div className={`rounded-xl p-4 text-center ${
        isTB ? 'bg-red-500/10' : 'bg-emerald-500/10'
      }`}>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${
          isTB ? 'bg-red-500/20 text-red-300 border border-red-500/30'
               : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isTB ? 'bg-red-400' : 'bg-emerald-400'}`} />
          {isTB ? 'Positive' : 'Negative'}
        </div>
        <h3 className={`text-2xl font-bold ${isTB ? 'text-red-200' : 'text-emerald-200'}`}>
          {result.prediction}
        </h3>
      </div>

      {/* Confidence Ring */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Confidence Score</p>
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={isTB ? '#f87171' : '#34d399'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${isTB ? 'text-red-300' : 'text-emerald-300'}`}>
              {confidencePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Clinical interpretation */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Interpretation</p>
        <div className={`text-sm leading-relaxed ${isTB ? 'text-red-300/80' : 'text-emerald-300/80'}`}>
          {isTB ? (
            <p>
              The model detects radiological patterns consistent with Tuberculosis infection.
              Clinical correlation and further testing recommended.
            </p>
          ) : (
            <p>
              No significant TB-associated patterns detected in this radiograph.
              Routine follow-up as clinically indicated.
            </p>
          )}
        </div>
      </div>

      {/* Class Info */}
      <div className="flex justify-between text-xs text-slate-600 bg-slate-800/50 rounded-lg px-3 py-2">
        <span>Class index</span>
        <span className="text-slate-400 font-mono">{result.class_index}</span>
      </div>
    </div>
  )
}
