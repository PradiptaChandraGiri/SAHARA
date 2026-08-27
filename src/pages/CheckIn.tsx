import { useState } from 'react'
import type { Page, CheckInData } from '../App'
import { ArrowLeft, Check, Lock, Sparkles, ChevronRight, Edit3 } from 'lucide-react'

interface CheckInProps {
  onNavigate: (page: Page) => void
  onComplete: (data: CheckInData) => void
}

type OptionCard = { label: string; value: string; icon?: string }

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#0E1A2B' }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#01575E' }}>
          {value}
          {unit}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            height: 6,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #01575E, #2A6F77)',
            borderRadius: 99,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            appearance: 'none',
            width: '100%',
            height: 6,
            borderRadius: 99,
            background: '#E2E8F0',
            outline: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
          {min}
          {unit}
        </span>
        <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

function OptionCards({
  options,
  value,
  onChange,
}: {
  options: OptionCard[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              border: `1.5px solid ${isSelected ? '#01575E' : '#E2E8F0'}`,
              background: isSelected ? '#E0F2F1' : '#FFFFFF',
              color: isSelected ? '#013C41' : '#475569',
              fontWeight: isSelected ? 700 : 500,
              fontSize: 14,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const analyzingMessages = [
  'Running dual Random Forest inference...',
  'Evaluating psychological wellbeing index...',
  'Computing academic attrition risk...',
  'Synthesizing personalized support...',
]

export default function CheckIn({ onNavigate, onComplete }: CheckInProps) {
  const [step, setStep] = useState(1)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeMsg, setAnalyzeMsg] = useState(0)
  const [validationError, setValidationError] = useState('')

  const [form, setForm] = useState({
    age: 20,
    gender: 'female',
    year: '2',
    department: 'Computer Science',
    gpa: '7.0-8.0',
    studyHours: 4,
    examPressure: 5,
    attendance: 75,
    stressLevel: 6,
    sleepHours: 6,
    physicalActivity: 'often',
    socialSupport: 5,
    screenTime: 4,
    financialStress: 'medium',
    familyExpectations: 'moderate',
  })

  const set = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setValidationError('')
  }

  const steps = [
    { title: 'Basic Information', subtitle: "Let's begin with your academic context." },
    { title: 'Academic Situation', subtitle: 'Tell us about your study hours and coursework load.' },
    { title: 'Wellbeing & Rest', subtitle: 'How have your stress and sleep levels been recently?' },
    { title: 'Lifestyle & Support', subtitle: 'Your daily routine, screen time, and support network.' },
    { title: 'Review & Submit', subtitle: 'Confirm your answers before running the AI assessment.' },
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

    if (form.studyHours < 2 || form.studyHours > 8) score += 8
    else score += 2

    if (form.financialStress === 'high') score += 10
    else if (form.financialStress === 'medium') score += 5

    if (form.familyExpectations === 'very-high') score += 8
    else if (form.familyExpectations === 'high') score += 4

    if (form.socialSupport <= 3) score += 8
    else if (form.socialSupport <= 5) score += 4

    const riskScore = Math.min(Math.round(score), 95)
    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low'
    const factors: string[] = []
    if (form.examPressure >= 7) factors.push('High exam pressure')
    if (form.stressLevel >= 7) factors.push('High stress level')
    if (form.sleepHours <= 6) factors.push('Low sleep hours')
    if (form.attendance < 75) factors.push('Low units/attendance')
    if (form.financialStress === 'high') factors.push('High financial stress')
    if (form.socialSupport <= 4) factors.push('Low social support')
    return { ...form, riskScore, riskLevel, factors } as CheckInData
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.gender) {
        setValidationError('Please select your gender.')
        return
      }
      if (!form.year) {
        setValidationError('Please select your academic year.')
        return
      }
    }
    setValidationError('')
    setStep((s) => s + 1)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeMsg(0)
    const cycle = setInterval(() => {
      setAnalyzeMsg((prev) => {
        if (prev >= analyzingMessages.length - 1) {
          clearInterval(cycle)
          return prev
        }
        return prev + 1
      })
    }, 200)

    const payload = {
      student_name: 'Student',
      age: form.age || 20,
      gender: form.gender === 'female' ? 'Female' : form.gender === 'male' ? 'Male' : 'Non-binary',
      academic_year: parseInt(form.year) || 2,
      study_hours_per_day: form.studyHours || 4.0,
      exam_pressure: form.examPressure ?? 5,
      academic_performance: form.attendance || 75.0,
      stress_level: form.stressLevel ?? 6,
      sleep_hours: form.sleepHours || 6.0,
      physical_activity: form.physicalActivity === 'daily' ? 5 : form.physicalActivity === 'often' ? 3 : 1,
      social_support: form.socialSupport ?? 5,
      screen_time: form.screenTime || 4.0,
      internet_usage: Math.max(1, (form.screenTime || 4) - 2),
      financial_stress: form.financialStress === 'high' ? 8 : form.financialStress === 'medium' ? 5 : 2,
      family_expectation: form.familyExpectations === 'very-high' ? 9 : form.familyExpectations === 'high' ? 7 : 4,
      admission_grade: 0,
      curricular_units_1st_sem_approved: Math.round((form.attendance / 100) * 6),
      curricular_units_2nd_sem_approved: Math.round((form.attendance / 100) * 6),
      tuition_fees_up_to_date: form.financialStress === 'high' ? 0 : 1,
      debtor: form.financialStress === 'high' ? 1 : 0,
      age_at_enrollment: form.age || 20,
    }

    let resultData: CheckInData | null = null

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
      const savedToken = localStorage.getItem('sahara_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${apiUrl}/api/checkins`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          age: Number(form.age) || 20,
          gender: form.gender === 'female' ? 'Female' : form.gender === 'male' ? 'Male' : 'Non-binary',
          academic_year: parseInt(form.year) || 2,
          department: form.department || 'General Studies',
          sleep_hours: Number(form.sleepHours) || 6.0,
          study_hours_per_day: Number(form.studyHours) || 4.0,
          exam_pressure: Number(form.examPressure) ?? 5,
          academic_performance: Number(form.attendance) || 75.0,
          stress_level: Number(form.stressLevel) ?? 6,
          physical_activity: form.physicalActivity === 'daily' ? 5 : form.physicalActivity === 'often' ? 3 : 1,
          social_support: Number(form.socialSupport) ?? 5,
          screen_time: Number(form.screenTime) || 4.0,
          internet_usage: Math.max(1, (Number(form.screenTime) || 4) - 2),
          financial_stress: form.financialStress === 'high' ? 8 : form.financialStress === 'medium' ? 5 : 2,
          family_expectation: form.familyExpectations === 'very-high' ? 9 : form.familyExpectations === 'high' ? 7 : 4,
        }),
      })

      if (res.ok) {
        const row = await res.json()
        const tierLower = (row.risk_level || 'low').toLowerCase() as 'low' | 'medium' | 'high'
        const riskScore = Number(row.overall_wellbeing)
        const anxietyRisk = Number(row.anxiety_signal)
        const dropoutRisk = Number(row.academic_strain)

        resultData = {
          ...form,
          id: row.id,
          riskScore,
          riskLevel: tierLower,
          anxietyRisk,
          dropoutRisk,
          isAiPredicted: true,
          factors: row.contributing_factors && row.contributing_factors.length > 0
            ? row.contributing_factors.map((f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
            : computeRisk().factors,
          timestamp: row.created_at || new Date().toISOString(),
        } as CheckInData
      }
    } catch (err) {
      console.warn('Backend /api/checkins failed, using local model fallback:', err)
    }

    setTimeout(() => {
      clearInterval(cycle)
      const finalData = resultData || { ...computeRisk(), isAiPredicted: false, timestamp: new Date().toISOString() }
      onComplete(finalData)
      setAnalyzing(false)
      onNavigate('results')
    }, 450)
  }

  if (analyzing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #013C41 0%, #0E1A2B 100%)',
          flexDirection: 'column',
          gap: 24,
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '3px solid rgba(217, 154, 52, 0.25)',
            borderTop: '3px solid #D99A34',
            animation: 'spin-slow 1.5s linear infinite',
          }}
        />
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
            Evaluating Wellbeing Signals
          </h2>
          <p style={{ fontSize: 15, color: '#E8B563', margin: 0, fontWeight: 600 }}>
            {analyzingMessages[analyzeMsg]}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Top Cancel / Back to Dashboard */}
        <button
          onClick={() => onNavigate('student-dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>Cancel and return to Dashboard</span>
        </button>

        {/* Step Indicator & Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#01575E' }}>
              Step {step} of {steps.length}: {steps[step - 1].title}
            </span>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
              {Math.round((step / steps.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                width: `${(step / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #01575E, #D99A34)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Step Content Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '36px 36px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0E1A2B', margin: '0 0 6px' }}>
              {steps[step - 1].title}
            </h2>
            <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
              {steps[step - 1].subtitle}
            </p>
          </div>

          {validationError && (
            <div
              style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                color: '#C2410C',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              ⚠️ {validationError}
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div>
              <SliderField
                label="Age"
                value={form.age}
                min={17}
                max={30}
                unit=" years"
                onChange={(v) => set('age', v)}
              />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Gender <span style={{ color: '#EA580C' }}>*</span>
                </label>
                <OptionCards
                  options={[
                    { label: 'Female', value: 'female', icon: '👩' },
                    { label: 'Male', value: 'male', icon: '👨' },
                    { label: 'Non-binary', value: 'nonbinary', icon: '🧑' },
                    { label: 'Prefer not to say', value: 'na', icon: '—' },
                  ]}
                  value={form.gender}
                  onChange={(v) => set('gender', v)}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Academic Year <span style={{ color: '#EA580C' }}>*</span>
                </label>
                <OptionCards
                  options={[
                    { label: '1st Year', value: '1' },
                    { label: '2nd Year', value: '2' },
                    { label: '3rd Year', value: '3' },
                    { label: '4th Year', value: '4' },
                    { label: 'PG / Masters', value: 'pg' },
                  ]}
                  value={form.year}
                  onChange={(v) => set('year', v)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Department / Program
                </label>
                <select
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                  className="input-standard"
                  style={{ maxWidth: 360 }}
                >
                  {[
                    'Computer Science',
                    'Electronics Engineering',
                    'Mechanical Engineering',
                    'Civil Engineering',
                    'Information Technology',
                    'Chemical Engineering',
                    'Biotechnology',
                    'Management Studies',
                    'Applied Sciences',
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Load */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Academic Performance (GPA/CGPA)
                </label>
                <OptionCards
                  options={[
                    { label: 'Below 5.0', value: 'below-5' },
                    { label: '5.0 – 7.0', value: '5.0-7.0' },
                    { label: '7.0 – 8.0', value: '7.0-8.0' },
                    { label: '8.0 – 9.0', value: '8.0-9.0' },
                    { label: 'Above 9.0', value: 'above-9' },
                  ]}
                  value={form.gpa}
                  onChange={(v) => set('gpa', v)}
                />
              </div>
              <SliderField
                label="Average Daily Study Hours"
                value={form.studyHours}
                min={0}
                max={12}
                unit="h / day"
                onChange={(v) => set('studyHours', v)}
              />
              <SliderField
                label="Exam & Coursework Pressure (1 = low, 10 = intense)"
                value={form.examPressure}
                min={1}
                max={10}
                onChange={(v) => set('examPressure', v)}
              />
              <SliderField
                label="Class Attendance %"
                value={form.attendance}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => set('attendance', v)}
              />
            </div>
          )}

          {/* STEP 3: Sleep & Lifestyle */}
          {step === 3 && (
            <div>
              <SliderField
                label="Current Stress Level (1 = calm, 10 = overwhelmed)"
                value={form.stressLevel}
                min={1}
                max={10}
                onChange={(v) => set('stressLevel', v)}
              />
              <SliderField
                label="Average Sleep per Night"
                value={form.sleepHours}
                min={2}
                max={12}
                step={0.5}
                unit=" hours"
                onChange={(v) => set('sleepHours', v)}
              />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Physical Exercise / Activity
                </label>
                <OptionCards
                  options={[
                    { label: 'Daily (5+ days)', value: 'daily', icon: '🏃' },
                    { label: '3–4 days/wk', value: 'often', icon: '🚶' },
                    { label: 'Rarely (1–2 days)', value: 'rarely', icon: '😴' },
                    { label: 'None', value: 'none', icon: '🛋️' },
                  ]}
                  value={form.physicalActivity}
                  onChange={(v) => set('physicalActivity', v)}
                />
              </div>
              <SliderField
                label="Social Support Network (1 = isolated, 10 = very strong)"
                value={form.socialSupport}
                min={1}
                max={10}
                onChange={(v) => set('socialSupport', v)}
              />
            </div>
          )}

          {/* STEP 4: Support & Stress */}
          {step === 4 && (
            <div>
              <SliderField
                label="Recreational Screen Time (non-study)"
                value={form.screenTime}
                min={0}
                max={12}
                unit="h / day"
                onChange={(v) => set('screenTime', v)}
              />
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Financial Pressure
                </label>
                <OptionCards
                  options={[
                    { label: 'None / Minimal', value: 'none', icon: '✅' },
                    { label: 'Moderate', value: 'medium', icon: '⚠️' },
                    { label: 'High / Significant', value: 'high', icon: '🔴' },
                  ]}
                  value={form.financialStress}
                  onChange={(v) => set('financialStress', v)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Family Academic Expectations
                </label>
                <OptionCards
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Moderate', value: 'moderate' },
                    { label: 'High', value: 'high' },
                    { label: 'Very High', value: 'very-high' },
                  ]}
                  value={form.familyExpectations}
                  onChange={(v) => set('familyExpectations', v)}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div>
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0E1A2B', margin: '0 0 14px' }}>
                  Summary of Your Responses
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Age & Year', value: `${form.age} yrs • Year ${form.year || '1'}`, stepNum: 1 },
                    { label: 'Department', value: form.department, stepNum: 1 },
                    { label: 'Study Hours', value: `${form.studyHours}h/day`, stepNum: 2 },
                    { label: 'Exam Pressure', value: `${form.examPressure}/10`, stepNum: 2 },
                    { label: 'Stress Level', value: `${form.stressLevel}/10`, stepNum: 3 },
                    { label: 'Sleep Hours', value: `${form.sleepHours}h/night`, stepNum: 3 },
                    { label: 'Social Support', value: `${form.socialSupport}/10`, stepNum: 3 },
                    { label: 'Financial Stress', value: form.financialStress || 'none', stepNum: 4 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#FFFFFF',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: 11.5, color: '#64748B' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0E1A2B' }}>{item.value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(item.stepNum)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#01575E',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        title={`Edit step ${item.stepNum}`}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: '#F0FDFA',
                  borderRadius: 12,
                  padding: '14px 18px',
                  border: '1px solid #CCFBF1',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <Lock size={18} color="#0F766E" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: 13.5, fontWeight: 700, color: '#115E59' }}>
                    Confidential & Pseudonymized Evaluation
                  </h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#0F766E', lineHeight: 1.5 }}>
                    Your assessment is evaluated through SAHARA's dual Random Forest risk engine. Raw individual answers are protected and only shared with certified counselors when high distress flags require supportive outreach.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onNavigate('student-dashboard'))}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#475569',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← {step > 1 ? 'Previous Step' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-teal"
              style={{ padding: '11px 26px', fontSize: 14.5 }}
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAnalyze}
              className="btn-cta"
              style={{ padding: '12px 28px', fontSize: 15 }}
            >
              <Sparkles size={16} />
              <span>Submit & Analyze Wellbeing</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
