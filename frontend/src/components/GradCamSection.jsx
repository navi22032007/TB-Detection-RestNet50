export default function GradCamSection({ result }) {
  const inputSrc = result.preprocessing_steps?.denoised
    ? `data:image/png;base64,${result.preprocessing_steps.denoised}`
    : null
  const heatmapSrc = result.grad_cam
    ? `data:image/png;base64,${result.grad_cam}`
    : null
  const overlaySrc = result.overlay
    ? `data:image/png;base64,${result.overlay}`
    : null

  return (
    <div className="space-y-6">
      {/* Heatmap scale legend */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-xs">Low activation</span>
        <div
          className="flex-1 h-2.5 rounded-full"
          style={{
            background: 'linear-gradient(to right, #000080, #0000ff, #00ffff, #00ff00, #ffff00, #ff8000, #ff0000)',
          }}
        />
        <span className="text-slate-500 text-xs">High activation</span>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Grad-CAM Heatmap: Before (Input) → After (Heatmap) */}
        <div className="glass-card-solid border border-amber-500/30 overflow-hidden">
          <div className="bg-amber-500/10 px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-amber-500 text-white text-xs font-bold flex items-center justify-center">A</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">Grad-CAM Heatmap</p>
              <p className="text-slate-500 text-xs">Raw class activation map from conv5_block3_out layer</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-stretch gap-3">
              {/* Before: Processed Input */}
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Model Input
                </div>
                <div className="aspect-square bg-black/40 rounded-xl overflow-hidden">
                  {inputSrc ? (
                    <img src={inputSrc} alt="Processed input" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                  )}
                </div>
                <p className="text-slate-600 text-xs mt-1.5 text-center">Preprocessed X-ray</p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center pt-5 shrink-0">
                <div className="w-0.5 flex-1 bg-amber-500 opacity-20 rounded-full" />
                <div className="my-2 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-amber-500 opacity-20 rounded-full" />
              </div>

              {/* After: Heatmap */}
              <div className="flex-1">
                <div className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Heatmap
                </div>
                <div className="aspect-square bg-black/40 rounded-xl overflow-hidden ring-1 ring-inset ring-amber-500/30">
                  {heatmapSrc ? (
                    <img src={heatmapSrc} alt="Grad-CAM heatmap" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                  )}
                </div>
                <p className="text-amber-300 text-xs mt-1.5 text-center">Activation Map</p>
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-3 leading-relaxed border-t border-white/5 pt-3">
              Gradient-weighted activations highlight which spatial regions the model focused on during classification
            </p>
          </div>
        </div>

        {/* Overlay: Before (Input) → After (Overlay) */}
        <div className="glass-card-solid border border-rose-500/30 overflow-hidden">
          <div className="bg-rose-500/10 px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-rose-500 text-white text-xs font-bold flex items-center justify-center">B</span>
            <div>
              <p className="text-sm font-semibold text-rose-300">Overlay Visualization</p>
              <p className="text-slate-500 text-xs">Heatmap superimposed on the processed radiograph</p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-stretch gap-3">
              {/* Before: Processed Input */}
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Model Input
                </div>
                <div className="aspect-square bg-black/40 rounded-xl overflow-hidden">
                  {inputSrc ? (
                    <img src={inputSrc} alt="Processed input" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                  )}
                </div>
                <p className="text-slate-600 text-xs mt-1.5 text-center">Preprocessed X-ray</p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center pt-5 shrink-0">
                <div className="w-0.5 flex-1 bg-rose-500 opacity-20 rounded-full" />
                <div className="my-2 w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="w-0.5 flex-1 bg-rose-500 opacity-20 rounded-full" />
              </div>

              {/* After: Overlay */}
              <div className="flex-1">
                <div className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Overlay
                </div>
                <div className="aspect-square bg-black/40 rounded-xl overflow-hidden ring-1 ring-inset ring-rose-500/30">
                  {overlaySrc ? (
                    <img src={overlaySrc} alt="Grad-CAM overlay" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">N/A</div>
                  )}
                </div>
                <p className="text-rose-300 text-xs mt-1.5 text-center">Superimposed</p>
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-3 leading-relaxed border-t border-white/5 pt-3">
              Heatmap blended at 40% opacity onto the original image reveals areas of clinical interest the model used for its prediction
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
