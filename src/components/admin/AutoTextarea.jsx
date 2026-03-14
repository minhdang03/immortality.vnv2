import { useRef, useEffect } from 'react'

export default function AutoTextarea({ value, onChange, placeholder, className, minRows = 3 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = ref.current.scrollHeight + 'px' }
  }, [value])
  return (
    <textarea
      ref={ref} value={value} onChange={onChange} placeholder={placeholder}
      className={className} rows={minRows} style={{ overflow: 'hidden', resize: 'vertical' }}
    />
  )
}
