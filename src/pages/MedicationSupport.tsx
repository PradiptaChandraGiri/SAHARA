import { useState, useRef } from 'react'

interface MedEntry {
  name: string
  dosage: string
  frequency: string
  nextReminder: string
  prescribedBy: string
}

const mockMeds: MedEntry[] = [
  { name: 'Escitalopram', dosage: '10 mg', frequency: 'Once daily (morning)', nextReminder: 'Tomorrow, 8:00 AM', prescribedBy: 'Dr. Anita Rao' },
  { name: 'Clonazepam', dosage: '0.5 mg', frequency: 'As needed (max 1/day)', nextReminder: 'As needed', prescribedBy: 'Dr. Anita Rao' },
  { name: 'Vitamin D3', dosage: '60,000 IU', frequency: 'Once weekly (Sunday)', nextReminder: 'Sun, Aug 23 — Morning', prescribedBy: 'Dr. Pradeep Mishra' },
]

const resources = [
  { icon: '🧠', title: 'Anxiety & Stress', desc: 'Evidence-based coping strategies and guided exercises', color: '#F5F3FF', link: '#' },
  { icon: '😴', title: 'Sleep Hygiene', desc: 'Improve your sleep quality with science-backed routines', color: '#EFF3FF', link: '#' },
  { icon: '🍎', title: 'Nutrition & Mood', desc: 'How diet impacts your mental health and academic focus', color: '#F0FDF4', link: '#' },
  { icon: '🏃', title: 'Exercise & Wellbeing', desc: 'Simple movement routines for busy students', color: '#FFFBEB', link: '#' },
]

export default function MedicationSupport() {
  const [uploaded, setUploaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [remindersSet, setRemindersSet] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (file: File) => {
    setFileName(file.name)
    setUploading(true)
    setTimeout(() => { setUploading(false); setUploaded(true) }, 2200)
  }

  const toggleReminder = (name: string) => {
    setRemindersSet(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Support & Medication Assistance
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
            Organize your prescriptions, set reminders, and access wellbeing resources — all in one place.
          </p>
        </div>

        {/* Warning banner */}
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '16px 20px',
          display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 28,
        }}>
          <span style={{ fontSize: 22 }}>⚕️</span>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>
              Important Medical Disclaimer
            </div>
            <p style={{ fontSize: 13, color: '#78350F', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
              Medication information is provided for <strong>organization and reminder purposes only</strong>. SAHARA does not prescribe, recommend, or modify medication. Always follow instructions from a qualified healthcare professional. In case of emergency, contact your doctor or call 112.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Upload */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              Upload Prescription
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
              Upload a photo or PDF of your prescription to auto-extract medication details.
            </p>

            {!uploaded && !uploading && (
              <div
                style={{
                  border: '2px dashed #CBD5E1', borderRadius: 14, padding: '40px 24px',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: '#F8FAFC',
                }}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#4F7BF7'; e.currentTarget.style.background = '#EFF3FF' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Drop your prescription here
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
                  PDF, JPG, or PNG · Max 10 MB
                </div>
                <button className="btn-secondary" style={{ fontSize: 13, padding: '8px 20px' }}>Browse Files</button>
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
              </div>
            )}

            {uploading && (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                  border: '3px solid #EFF3FF', borderTop: '3px solid #4F7BF7',
                }} className="animate-spin-slow" />
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Extracting medication details...
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{fileName}</div>
              </div>
            )}

            {uploaded && (
              <div className="animate-fade-in">
                <div style={{
                  background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
                  padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16,
                }}>
                  <span>✅</span>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: '#16A34A' }}>Prescription extracted successfully</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{fileName}</div>
                  </div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 13, width: '100%' }} onClick={() => { setUploaded(false); setFileName('') }}>
                  Upload Another
                </button>
              </div>
            )}
          </div>

          {/* Reminders summary */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              Today's Reminders
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockMeds.slice(0, 2).map((med, i) => (
                <div key={i} style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: remindersSet[med.name] ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${remindersSet[med.name] ? '#BBF7D0' : '#E2E8F0'}`,
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: '#EFF3FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{med.name} · {med.dosage}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>⏰ {med.nextReminder}</div>
                  </div>
                  <button
                    onClick={() => toggleReminder(med.name)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: remindersSet[med.name] ? '#22C55E' : '#E2E8F0',
                      color: remindersSet[med.name] ? 'white' : '#94A3B8',
                      fontSize: 14, transition: 'all 0.2s ease',
                    }}
                  >{remindersSet[med.name] ? '✓' : '○'}</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extracted medications */}
        {uploaded && (
          <div className="card animate-fade-in" style={{ padding: 28, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                Extracted Medications
              </h3>
              <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>Simulated extraction · Demo only</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {mockMeds.map((med, i) => (
                <div key={i} className="card card-hover animate-fade-in" style={{
                  padding: '20px 20px', background: '#F8FAFC', animationDelay: `${i * 0.1}s`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#EFF3FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14,
                  }}>💊</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                    {med.name}
                  </div>
                  {[
                    { label: 'Dosage', value: med.dosage },
                    { label: 'Frequency', value: med.frequency },
                    { label: 'Next Reminder', value: med.nextReminder },
                    { label: 'Prescribed by', value: med.prescribedBy },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>{item.value}</div>
                    </div>
                  ))}
                  <button
                    className="btn-primary"
                    style={{ width: '100%', marginTop: 12, fontSize: 13, padding: '8px 0' }}
                    onClick={() => toggleReminder(med.name)}
                  >
                    {remindersSet[med.name] ? '✅ Reminder Set' : '🔔 Set Reminder'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
            Wellbeing Resources
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {resources.map((r, i) => (
              <div key={i} className="card card-hover" style={{ padding: 20, background: r.color, cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{r.desc}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#4F7BF7', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Read more →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
