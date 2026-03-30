import { useRef, useState, useCallback } from 'react'

export default function UploadSection({ onFile, status, preview, fileName, onReset }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }, [onFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
    e.target.value = ''
  }, [onFile])

  const isLoading = status === 'loading'

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Chest X-Ray Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload a chest radiograph to detect signs of Tuberculosis using ResNet50 deep learning
          </p>
        </div>
        {status === 'done' && (
          <button
            onClick={onReset}
            className="sm:ml-auto flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyze Another
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && !preview && inputRef.current?.click()}
          className={`
            relative glass-card-solid border-2 border-dashed transition-all duration-200 overflow-hidden
            min-h-[280px] flex items-center justify-center
            ${dragging ? 'border-blue-400 bg-blue-500/10 scale-[1.01]' : 'border-slate-700 hover:border-slate-500'}
            ${!preview && !isLoading ? 'cursor-pointer' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={isLoading}
          />

          {isLoading ? (
            <LoadingState />
          ) : preview ? (
            <PreviewState preview={preview} fileName={fileName} onReset={onReset} />
          ) : (
            <EmptyState dragging={dragging} />
          )}
        </div>

        {/* Instructions Card */}
        <div className="glass-card-solid p-6 space-y-5">
          <h3 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">
            How It Works
          </h3>
          <ol className="space-y-4">
            {[
              {
                step: '01',
                title: 'Upload X-Ray',
                desc: 'Drag & drop or click to upload a chest radiograph (PNG, JPG, JPEG)',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
              },
              {
                step: '02',
                title: 'AI Processing',
                desc: 'Image undergoes CLAHE enhancement, denoising, and ResNet50 inference',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                ),
              },
              {
                step: '03',
                title: 'Grad-CAM Visualization',
                desc: 'See exactly which regions influenced the AI\'s decision via heatmaps',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ),
              },
              {
                step: '04',
                title: 'Clinical Report',
                desc: 'Get prediction (Normal / Tuberculosis) with confidence score',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <li key={step} className="flex gap-3">
                <div className="shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-amber-400 font-medium">Disclaimer:</span> This tool is for research and educational purposes only. Not a substitute for professional medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyState({ dragging }) {
  return (
    <div className={`text-center p-8 space-y-4 transition-all duration-200 ${dragging ? 'scale-95' : ''}`}>
      <div className="w-16 h-16 mx-auto bg-slate-800 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold">Drop your X-ray here</p>
        <p className="text-slate-500 text-sm mt-1">or <span className="text-blue-400">click to browse</span></p>
      </div>
      <p className="text-slate-600 text-xs">PNG, JPG, JPEG — any size</p>
    </div>
  )
}

function PreviewState({ preview, fileName, onReset }) {
  return (
    <div className="relative w-full h-full min-h-[280px]">
      <img
        src={preview}
        alt="X-ray preview"
        className="absolute inset-0 w-full h-full object-contain p-4"
      />
      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-slate-300 text-xs font-medium truncate">{fileName}</span>
      </div>
    </div>
  )
}

function LoadingState() {
  const steps = ['Reading image...', 'Applying CLAHE...', 'Running ResNet50...', 'Generating Grad-CAM...']
  return (
    <div className="text-center p-8 space-y-5">
      <div className="relative w-14 h-14 mx-auto">
        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-2 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-semibold text-sm">Analyzing radiograph...</p>
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 justify-center">
              <div
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
              />
              <span className="text-slate-500 text-xs">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
