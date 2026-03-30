import { useState, useCallback } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'

const API_BASE = '/api'

export default function App() {
  const [status, setStatus] = useState('idle') // idle | uploading | loading | done | error
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return

    // Local preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setFileName(file.name)
    setStatus('loading')
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        let detail = `Server error: ${res.status}`
        try {
          const errData = JSON.parse(text)
          if (errData.detail) detail = errData.detail
        } catch { /* not JSON */ }
        throw new Error(detail)
      }

      const data = await res.json()
      setResult(data)
      setStatus('done')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
        setError('Cannot connect to the backend server. Make sure it is running:\n\ncd backend && uvicorn backend.main:app --reload\n\n(run from the project root)')
      } else {
        setError(msg)
      }
      setStatus('error')
    }
  }, [])

  const handleReset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setPreview(null)
    setError(null)
    setFileName(null)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <UploadSection
          onFile={handleFile}
          status={status}
          preview={preview}
          fileName={fileName}
          onReset={handleReset}
        />

        {status === 'error' && (
          <div className="glass-card border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-300 text-sm">Analysis Failed</p>
              <p className="text-red-400/80 text-sm mt-0.5 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {status === 'done' && result && (
          <ResultPanel result={result} />
        )}
      </main>

      <Footer />
    </div>
  )
}
