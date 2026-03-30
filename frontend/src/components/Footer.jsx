export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-600 text-xs">
          <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
          <span>TB Detection — ResNet50</span>
          <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
          <span>For educational &amp; research use only</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-700">
          <span>ResNet50 · TensorFlow 2.15 · FastAPI</span>
        </div>
      </div>
    </footer>
  )
}
