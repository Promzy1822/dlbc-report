'use client'
import { useState, useEffect, useCallback } from 'react'

interface Toast { id: number; message: string; type: 'success' | 'error' }

let addToastFn: ((msg: string, type?: 'success' | 'error') => void) | null = null

export function toast(msg: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(msg, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  useEffect(() => {
    addToastFn = add
    return () => { addToastFn = null }
  }, [add])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
