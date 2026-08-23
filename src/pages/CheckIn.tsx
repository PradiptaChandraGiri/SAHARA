import { useState } from 'react'
import type { Page } from '../App'
import type { CheckInData } from '../App'

interface CheckInProps {
  onNavigate: (page: Page) => void
  onComplete: (data: CheckInData) => void
}

type OptionCard = { label: string; value: string; icon?: string }

function SliderField({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#4F7BF7', fontFamily: "'Outfit', sans-serif" }}>{value}{unit}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, height: 6,
          width: `${pct}%`, background: 'linear-gradient(90deg, #4F7BF7, #8B5CF6)',
          borderRadius: 99, transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
        }} />
        <input
          type="range" className="slider-track" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'relative', zIndex: 2, background: 'transparent' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>{max}{unit}</span>
      </div>
    </div>
  )
}

function OptionCards({ options, value, onChange }: { options: OptionCard[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${value === opt.value ? '#4F7BF7' : '#E2E8F0'}`,
            background: value === opt.value ? '#EFF3FF' : 'white',
            color: value === opt.value ? '#4F7BF7' : '#64748B',
            fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const analyzingMessages = [
  'Analyzing your responses...',
  'Evaluating wellbeing indicators...',
  'Identifying academic risk factors...',
  'Preparing personalized support...',
  'Finalizing your wellbeing snapshot...',
]

export default function CheckIn({ onNavigate, onComplete }: CheckInProps) {
  const [step, setStep] = useState(1)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeMsg, setAnalyzeMsg] = useState(0)

  const [form, setForm] = useState({
    age: 20,
    gender: '',
    year: '',
    department: '',
    gpa: '7.0-8.0',
    studyHours: 4,
    examPressure: 5,
    attendance: 75,
    stressLevel: 6,
    sleepHours: 6,
    physicalActivity: '',
    socialSupport: 5,
    screenTime: 4,
    financialStress: '',
    familyExpectations: '',
  })

  const set = (key: keyof typeof form, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))

  const steps = [
    { title: 'Basic Information', subtitle: "Let's start with a bit about you." },
    { title: 'Academic Overview', subtitle: 'Tell us about your academic situation.' },
    { title: 'Wellbeing Indicators', subtitle: 'How have you been feeling lately?' },
    { title: 'Lifestyle & Support', subtitle: 'Your daily habits and support network.' },
    { title: 'Final Review', subtitle: "Take a moment to review before we analyze." },
  ]

  const computeRisk = (): CheckInData => {
    let score = 0
    if (form.examPressure >= 8) score += 20
    else if (form.examPressure >= 6) score += 12
    else score += 4

    if (form.stressLevel >= 8) score += 20
    else if (form.stressLevel >= 6) score += 12
    else score += 4

    if (form.sleepHours <= 4) score += 18
    else if (form.sleepHours <= 6) score += 10
    else score += 3

    if (form.attendance < 60) score += 12
    else if (form.attendance < 75) score += 6
    else score += 1

    if (form.studyHours < 2) score += 8
    else if (form.studyHours > 8) score += 8
    else score += 2

    if (form.financialStress === 'high') score += 10
    else if (form.financialStress === 'medium') score += 5

    if (form.familyExpectations === 'very-high') score += 8
    else if (form.familyExpectations === 'high') score += 4

    if (form.socialSupport <= 3) score += 8
    else if (form.socialSupport <= 5) score += 4

    if (form.physicalActivity === 'none') score += 6
    else if (form.physicalActivity === 'rarely') score += 3

    const riskScore = Math.min(Math.round(score), 95)
    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low'
    const factors: string[] = []
    if (form.examPressure >= 7) factors.push('High exam pressure')
    if (form.stressLevel >= 7) factors.push('Elevated stress levels')
    if (form.sleepHours <= 6) factors.push('Insufficient sleep')
    if (form.attendance < 75) factors.push('Low attendance')
    if (form.financialStress === 'high') factors.push('Financial concerns')
    if (form.socialSupport <= 4) factors.push('Low social support')
    if (form.familyExpectations === 'very-high') factors.push('High family expectations')
    if (form.screenTime >= 6) factors.push('Excessive screen time')
    return { ...form, riskScore, riskLevel, factors } as CheckInData
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeMsg(0)
    const cycle = setInterval(() => {
      setAnalyzeMsg(prev => {
        if (prev >= analyzingMessages.length - 1) { clearInterval(cycle); return prev }
        return prev + 1
      })
    }, 600)

    // Map frontend form state to backend StudentIntake schema
    const payload = {
      student_name: "Student",
      age: form.age || 20,
      gender: form.gender || "Prefer not to say",
      academic_year: parseInt(form.year) || 1,
      study_hours_per_day: form.studyHours || 4.0,
      exam_pressure: form.examPressure ?? 5,
      academic_performance: form.attendance || 75.0,
      stress_level: form.stressLevel ?? 6,
      sleep_hours: form.sleepHours || 6.0,
      physical_activity: form.physicalActivity === 'regular' ? 5 : form.physicalActivity === 'rarely' ? 2 : 0,
      social_support: form.socialSupport ?? 5,
      screen_time: form.screenTime || 4.0,
      internet_usage: Math.max(1, (form.screenTime || 4) - 2),
      financial_stress: form.financialStress === 'high' ? 8 : form.financialStress === 'medium' ? 5 : 2,
      family_expectation: form.familyExpectations === 'very-high' ? 9 : form.familyExpectations === 'high' ? 7 : 3,
      admission_grade: 0.0,
      curricular_units_1st_sem_approved: 3,
      curricular_units_2nd_sem_approved: 3,
      tuition_fees_up_to_date: 1,
      debtor: 0,
      age_at_enrollment: form.age || 20,
    }

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://sahara-951p.onrender.com').replace(/\/$/, '')
      const savedToken = localStorage.getItem('sahara_token')
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (savedToken) headers["Authorization"] = `Bearer ${savedToken}`

      const res = await fetch(`${apiUrl}/assess`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        const tierLower = (data.risk_tier || "low").toLowerCase() as 'low' | 'medium' | 'high'
        const riskScore = Math.round(data.combined_score * 100)
        const anxietyRisk = Math.round((data.anxiety_score / 10) * 100)
        const dropoutRisk = Math.round(data.dropout_probability * 100)

        resultData = {
          ...form,
          riskScore,
          riskLevel: tierLower,
          anxietyRisk,
          dropoutRisk,
          isAiPredicted: true,
          factors: data.top_factors && data.top_factors.length > 0 ? data.top_factors : computeRisk().factors,
        } as CheckInData
      }
    } catch (err) {
      console.warn("Backend /assess unavailable, using local calculation fallback:", err)
    }

    setTimeout(() => {
      clearInterval(cycle)
      const finalData = resultData || { ...computeRisk(), isAiPredicted: false }
      onComplete(finalData)
      setAnalyzing(false)
      onNavigate('results')
    }, 2000)
  }

  if (analyzing) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A, #1E3A8A)',
        flexDirection: 'column', gap: 32,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '3px solid rgba(79,123,247,0.3)',
          borderTop: '3px solid #4F7BF7',
          marginBottom: 8,
        }} className="animate-spin-slow" />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 12 }}>
            Analyzing Your Wellbeing
          </h2>
          <p className="shimmer-text" style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Outfit', sans-serif", minHeight: 28 }}>
            {analyzingMessages[analyzeMsg]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {analyzingMessages.map((_, i) => (
            <div key={i} style={{
              width: i === analyzeMsg ? 24 : 8, height: 8, borderRadius: 99,
              background: i <= analyzeMsg ? '#4F7BF7' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 60px' }}>
      {/* Header */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => onNavigate('home')} style={{
          background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
        }}>
          ← Back to Home
        </button>

        {/* Progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#4F7BF7' }}>
              Step {step} of {steps.length}
            </span>
            <span style={{ fontSize: 14, color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
              {Math.round((step / steps.length) * 100)}% complete
            </span>
          </div>
          <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, width: `${(step / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #4F7BF7, #8B5CF6)',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i + 1 <= step ? '#4F7BF7' : '#E2E8F0',
                  border: `2px solid ${i + 1 === step ? '#4F7BF7' : 'transparent'}`,
                  boxShadow: i + 1 === step ? '0 0 0 3px rgba(79,123,247,0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="card animate-fade-in" style={{ padding: '40px 44px', marginBottom: 24 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              {steps[step - 1].title}
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>
              {steps[step - 1].subtitle}
            </p>
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <SliderField label="Age" value={form.age} min={17} max={30} unit=" yrs" onChange={v => set('age', v)} />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Gender</label>
                <OptionCards
                  options={[{ label: 'Male', value: 'male', icon: '👨' }, { label: 'Female', value: 'female', icon: '👩' }, { label: 'Non-binary', value: 'nonbinary', icon: '🧑' }, { label: 'Prefer not to say', value: 'na', icon: '—' }]}
                  value={form.gender} onChange={v => set('gender', v)}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Academic Year</label>
                <OptionCards
                  options={[{ label: '1st Year', value: '1' }, { label: '2nd Year', value: '2' }, { label: '3rd Year', value: '3' }, { label: '4th Year', value: '4' }, { label: 'PG', value: 'pg' }]}
                  value={form.year} onChange={v => set('year', v)}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Department / Course</label>
                <select className="input-field" value={form.department} onChange={e => set('department', e.target.value)} style={{ maxWidth: 360 }}>
                  <option value="">Select your department...</option>
                  {['Computer Science', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology', 'Chemical Engineering', 'Biotechnology', 'Mathematics', 'Physics', 'Management'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Current Academic Performance (GPA/CGPA)</label>
                <OptionCards
                  options={[{ label: 'Below 5.0', value: 'below-5' }, { label: '5.0 – 7.0', value: '5.0-7.0' }, { label: '7.0 – 8.0', value: '7.0-8.0' }, { label: '8.0 – 9.0', value: '8.0-9.0' }, { label: 'Above 9.0', value: 'above-9' }]}
                  value={form.gpa} onChange={v => set('gpa', v)}
                />
              </div>
              <SliderField label="Average Study Hours per Day" value={form.studyHours} min={0} max={12} unit="h" onChange={v => set('studyHours', v)} />
              <SliderField label="Exam Pressure (1 = relaxed, 10 = overwhelming)" value={form.examPressure} min={1} max={10} onChange={v => set('examPressure', v)} />
              <SliderField label="Class Attendance %" value={form.attendance} min={0} max={100} unit="%" onChange={v => set('attendance', v)} />
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <SliderField label="Current Stress Level (1 = none, 10 = extreme)" value={form.stressLevel} min={1} max={10} onChange={v => set('stressLevel', v)} />
              <SliderField label="Average Sleep Hours per Night" value={form.sleepHours} min={2} max={12} step={0.5} unit="h" onChange={v => set('sleepHours', v)} />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Physical Activity</label>
                <OptionCards
                  options={[{ label: 'Daily', value: 'daily', icon: '🏃' }, { label: '3–4×/week', value: 'often', icon: '🚶' }, { label: 'Rarely', value: 'rarely', icon: '😴' }, { label: 'None', value: 'none', icon: '🛋️' }]}
                  value={form.physicalActivity} onChange={v => set('physicalActivity', v)}
                />
              </div>
              <SliderField label="Social Support (1 = none, 10 = strong)" value={form.socialSupport} min={1} max={10} onChange={v => set('socialSupport', v)} />
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <SliderField label="Daily Screen Time (non-study)" value={form.screenTime} min={0} max={12} unit="h" onChange={v => set('screenTime', v)} />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Financial Stress</label>
                <OptionCards
                  options={[{ label: 'None', value: 'none', icon: '✅' }, { label: 'Moderate', value: 'medium', icon: '⚠️' }, { label: 'High', value: 'high', icon: '🔴' }]}
                  value={form.financialStress} onChange={v => set('financialStress', v)}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>Family Academic Expectations</label>
                <OptionCards
                  options={[{ label: 'Low', value: 'low' }, { label: 'Moderate', value: 'moderate' }, { label: 'High', value: 'high' }, { label: 'Very High', value: 'very-high' }]}
                  value={form.familyExpectations} onChange={v => set('familyExpectations', v)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Your Responses Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Age', value: `${form.age} years` },
                    { label: 'Academic Year', value: form.year ? `Year ${form.year}` : '—' },
                    { label: 'GPA Range', value: form.gpa || '—' },
                    { label: 'Study Hours', value: `${form.studyHours}h/day` },
                    { label: 'Exam Pressure', value: `${form.examPressure}/10` },
                    { label: 'Attendance', value: `${form.attendance}%` },
                    { label: 'Stress Level', value: `${form.stressLevel}/10` },
                    { label: 'Sleep', value: `${form.sleepHours}h/night` },
                    { label: 'Social Support', value: `${form.socialSupport}/10` },
                    { label: 'Financial Stress', value: form.financialStress || '—' },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', background: 'white', borderRadius: 8, border: '1px solid #E2E8F0',
                    }}>
                      <span style={{ fontSize: 13, color: '#64748B', fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: '#EFF3FF', borderRadius: 12, padding: '16px 20px',
                border: '1px solid #BFDBFE', display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#1D4ED8', marginBottom: 2 }}>Your privacy is protected</div>
                  <div style={{ fontSize: 13, color: '#3B82F6', fontFamily: "'Inter', sans-serif" }}>
                    Your responses are confidential. Results are used to provide personalized support and may only be shared with authorized counselors with your consent.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn-ghost"
            onClick={() => step > 1 ? setStep(s => s - 1) : onNavigate('home')}
          >
            ← {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button className="btn-primary" onClick={() => setStep(s => s + 1)} style={{ fontSize: 15, padding: '12px 28px' }}>
              Continue →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              style={{ fontSize: 15, padding: '12px 28px', background: 'linear-gradient(135deg, #4F7BF7, #8B5CF6)' }}
            >
              🔍 Analyze My Wellbeing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
