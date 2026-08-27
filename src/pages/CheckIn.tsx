import { useState } from 'react'
import type { Page, CheckInData } from '../App'
import { ArrowLeft, Check, Lock, Sparkles, ChevronRight, Edit3, MessageSquare, Bot, AlertCircle, X } from 'lucide-react'
import { API_BASE } from '../config'

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: isSelected ? '1.5px solid #01575E' : '1.5px solid #E2E8F0',
              background: isSelected ? '#E0F2F1' : '#FFFFFF',
              color: isSelected ? '#01575E' : '#0E1A2B',
              fontWeight: isSelected ? 700 : 500,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
              textAlign: 'center',
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
  'Extracting multi-modal strain markers...',
  'Running dual Random Forest model inference...',
  'Evaluating clinical anxiety signal & retention risk...',
  'Synthesizing personalized recovery guidance with Groq AI...',
]

export default function CheckIn({ onNavigate, onComplete }: CheckInProps) {
  const [step, setStep] = useState(1)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeMsg, setAnalyzeMsg] = useState(0)
  const [validationError, setValidationError] = useState('')

  // Conversational AI Symptom Intake state (Ada Health / Claude Healthcare style)
  const [showAiModal, setShowAiModal] = useState(false)
  const [freeTextSymptom, setFreeTextSymptom] = useState('')
  const [isParsingSymptom, setIsParsingSymptom] = useState(false)
  const [parsedPreview, setParsedPreview] = useState<any>(null)

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

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.gender) {
        setValidationError('Please select your gender.')
        return
      }
    }
    setValidationError('')
    setStep((prev) => Math.min(prev + 1, steps.length))
  }

  const handleParseSymptomText = async () => {
    if (!freeTextSymptom.trim() || isParsingSymptom) return
    setIsParsingSymptom(true)
    try {
      const res = await fetch(`${API_BASE}/api/checkins/parse-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeText: freeTextSymptom }),
      })
      if (res.ok) {
        const parsed = await res.json()
        setParsedPreview(parsed)
      }
    } catch (err) {
      console.warn('Could not parse free text symptoms:', err)
    } finally {
      setIsParsingSymptom(false)
    }
  }

  const handleApplyParsedToForm = (runImmediate: boolean = false) => {
    if (!parsedPreview) return
    const updated = {
      ...form,
      age: parsedPreview.age || form.age,
      gender: parsedPreview.gender ? parsedPreview.gender.toLowerCase() : form.gender,
      year: String(parsedPreview.academic_year || form.year),
      department: parsedPreview.department || form.department,
      sleepHours: parsedPreview.sleep_hours || form.sleepHours,
      studyHours: parsedPreview.study_hours_per_day || form.studyHours,
      examPressure: parsedPreview.exam_pressure || form.examPressure,
      stressLevel: parsedPreview.stress_level || form.stressLevel,
      socialSupport: parsedPreview.social_support || form.socialSupport,
      screenTime: parsedPreview.screen_time || form.screenTime,
      attendance: parsedPreview.academic_performance ? parsedPreview.academic_performance * 10 : form.attendance,
      financialStress: parsedPreview.financial_stress > 6 ? 'high' : parsedPreview.financial_stress > 3 ? 'medium' : 'low',
      familyExpectations: parsedPreview.family_expectation > 7 ? 'very-high' : parsedPreview.family_expectation > 4 ? 'high' : 'moderate',
    }
    setForm(updated)
    setShowAiModal(false)
    if (runImmediate) {
      setTimeout(() => {
        handleAnalyze(updated)
      }, 200)
    } else {
      setStep(5) // jump to review
    }
  }

  const handleAnalyze = async (formToSubmit = form) => {
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

    try {
      const savedToken = localStorage.getItem('sahara_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`

      const res = await fetch(`${API_BASE}/api/checkins`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          age: Number(formToSubmit.age) || 20,
          gender: formToSubmit.gender === 'female' ? 'Female' : formToSubmit.gender === 'male' ? 'Male' : 'Non-binary',
          academic_year: parseInt(formToSubmit.year) || 2,
          department: formToSubmit.department || 'General Studies',
          sleep_hours: Number(formToSubmit.sleepHours) || 6.0,
          study_hours_per_day: Number(formToSubmit.studyHours) || 4.0,
          exam_pressure: Number(formToSubmit.examPressure) ?? 5,
          academic_performance: Number(formToSubmit.attendance) || 75.0,
          stress_level: Number(formToSubmit.stressLevel) ?? 6,
          physical_activity: formToSubmit.physicalActivity === 'daily' ? 5 : formToSubmit.physicalActivity === 'often' ? 3 : 1,
          social_support: Number(formToSubmit.socialSupport) ?? 5,
          screen_time: Number(formToSubmit.screenTime) || 4.0,
          internet_usage: Math.max(1, (Number(formToSubmit.screenTime) || 4) - 2),
          financial_stress: formToSubmit.financialStress === 'high' ? 8 : formToSubmit.financialStress === 'medium' ? 5 : 2,
          family_expectation: formToSubmit.familyExpectations === 'very-high' ? 9 : formToSubmit.familyExpectations === 'high' ? 7 : 4,
        }),
      })

      if (res.ok) {
        const row = await res.json()
        const resultData: CheckInData = {
          riskScore: Number(row.overall_wellbeing),
          riskLevel: row.risk_level,
          anxietyRisk: Number(row.anxiety_signal),
          dropoutRisk: Number(row.academic_strain),
          factors: row.contributing_factors?.map((f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())) || [],
          timestamp: row.created_at,
          isAiPredicted: true,
          sleepHours: Number(formToSubmit.sleepHours) || 6.0,
          examPressure: Number(formToSubmit.examPressure) ?? 5,
          studyHours: Number(formToSubmit.studyHours) || 4.0,
        } as unknown as CheckInData
        clearInterval(cycle)
        onComplete(resultData)
        return
      }
    } catch (err) {
      console.warn('Backend evaluation failed:', err)
    }

    clearInterval(cycle)
    // Fallback scoring
    const fallback: CheckInData = {
      riskScore: 68,
      riskLevel: 'high',
      anxietyRisk: 72,
      dropoutRisk: 64,
      factors: ['High exam pressure', 'Low sleep hours'],
      timestamp: new Date().toISOString(),
      sleepHours: formToSubmit.sleepHours,
      examPressure: formToSubmit.examPressure,
      studyHours: formToSubmit.studyHours,
    } as unknown as CheckInData
    onComplete(fallback)
  }

  if (analyzing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-app, #F9F9F8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1.5px solid #E2E8F0',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#E0F2F1',
              color: '#01575E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'spin 2s linear infinite',
            }}
          >
            <Sparkles size={28} />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0E1A2B', margin: '0 0 10px' }}>
            Evaluating Your Check-In
          </h3>

          <p style={{ fontSize: 14, color: '#01575E', fontWeight: 600, minHeight: 22, margin: '0 0 24px' }}>
            {analyzingMessages[analyzeMsg]}
          </p>

          <div
            style={{
              width: '100%',
              height: 6,
              background: '#F1F5F9',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #01575E, #2A6F77)',
                borderRadius: 99,
                width: `${((analyzeMsg + 1) / analyzingMessages.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app, #F9F9F8)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onNavigate('home'))}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={16} />
            <span>{step > 1 ? 'Previous Step' : 'Back to Dashboard'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
            <Lock size={13} color="#01575E" />
            <span>Encrypted & Confidential</span>
          </div>
        </div>

        {/* Conversational NLP Intake Prompt Banner (Ada Health / Claude Healthcare style) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #01575E 0%, #0E1A2B 100%)',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(1,87,94,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquare size={18} color="#FDE047" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Prefer typing freely? Try Conversational AI Intake</div>
              <div style={{ fontSize: 12, color: '#E0F2F1' }}>Describe symptoms, sleep, and study pressure naturally</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            style={{
              background: '#FFFFFF',
              color: '#01575E',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={13} color="#01575E" />
            <span>AI Symptom Intake</span>
          </button>
        </div>

        {/* Step Progress Header */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#01575E', textTransform: 'uppercase' }}>
              Step {step} of {steps.length}
            </span>
            <span style={{ fontSize: 13, color: '#64748B' }}>{steps[step - 1].title}</span>
          </div>

          <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 99, marginBottom: 20 }}>
            <div
              style={{
                height: '100%',
                background: '#01575E',
                borderRadius: 99,
                width: `${(step / steps.length) * 100}%`,
                transition: 'width 0.25s ease',
              }}
            />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0E1A2B', margin: '0 0 6px' }}>
            {steps[step - 1].title}
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>{steps[step - 1].subtitle}</p>
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 16,
              color: '#C2410C',
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Contents */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: 16,
            padding: '32px',
            marginBottom: 24,
          }}
        >
          {step === 1 && (
            <div>
              <SliderField
                label="Your Age"
                min={16}
                max={35}
                value={form.age}
                onChange={(v) => set('age', v)}
              />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Gender Identity
                </label>
                <OptionCards
                  options={[
                    { label: 'Female', value: 'female' },
                    { label: 'Male', value: 'male' },
                    { label: 'Non-binary / Other', value: 'other' },
                  ]}
                  value={form.gender}
                  onChange={(v) => set('gender', v)}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Academic Year
                </label>
                <OptionCards
                  options={[
                    { label: 'Year 1 (Freshman)', value: '1' },
                    { label: 'Year 2 (Sophomore)', value: '2' },
                    { label: 'Year 3 (Junior)', value: '3' },
                    { label: 'Year 4+ (Senior)', value: '4' },
                  ]}
                  value={form.year}
                  onChange={(v) => set('year', v)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Department / Major
                </label>
                <OptionCards
                  options={[
                    { label: 'Computer Science', value: 'Computer Science' },
                    { label: 'Engineering', value: 'Engineering' },
                    { label: 'Business / Commerce', value: 'Business' },
                    { label: 'Health & Medicine', value: 'Health Sciences' },
                    { label: 'Natural Sciences', value: 'Sciences' },
                    { label: 'Arts & Humanities', value: 'Arts' },
                  ]}
                  value={form.department}
                  onChange={(v) => set('department', v)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <SliderField
                label="Daily Study Hours (outside lectures)"
                min={1}
                max={12}
                unit=" hrs/day"
                value={form.studyHours}
                onChange={(v) => set('studyHours', v)}
              />

              <SliderField
                label="Exam & Deadline Pressure (1-10)"
                min={1}
                max={10}
                value={form.examPressure}
                onChange={(v) => set('examPressure', v)}
              />

              <SliderField
                label="Estimated Class Attendance / Engagement (%)"
                min={20}
                max={100}
                unit="%"
                step={5}
                value={form.attendance}
                onChange={(v) => set('attendance', v)}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <SliderField
                label="Average Sleep per Night"
                min={2}
                max={12}
                unit=" hrs"
                step={0.5}
                value={form.sleepHours}
                onChange={(v) => set('sleepHours', v)}
              />

              <SliderField
                label="Perceived Daily Stress Level (1-10)"
                min={1}
                max={10}
                value={form.stressLevel}
                onChange={(v) => set('stressLevel', v)}
              />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Physical Activity / Exercise Routine
                </label>
                <OptionCards
                  options={[
                    { label: 'Daily (5+ days/wk)', value: 'daily' },
                    { label: 'Moderate (2-4 days/wk)', value: 'often' },
                    { label: 'Rarely / None', value: 'rarely' },
                  ]}
                  value={form.physicalActivity}
                  onChange={(v) => set('physicalActivity', v)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <SliderField
                label="Daily Screen Time (phone + laptop outside class)"
                min={1}
                max={14}
                unit=" hrs"
                value={form.screenTime}
                onChange={(v) => set('screenTime', v)}
              />

              <SliderField
                label="Social Support & Friends Connection (1-10)"
                min={1}
                max={10}
                value={form.socialSupport}
                onChange={(v) => set('socialSupport', v)}
              />

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0E1A2B', marginBottom: 8 }}>
                  Financial Strain / Living Costs
                </label>
                <OptionCards
                  options={[
                    { label: 'Low / Manageable', value: 'low' },
                    { label: 'Moderate Concern', value: 'medium' },
                    { label: 'Significant Strain', value: 'high' },
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
                    { label: 'Supportive / Low', value: 'moderate' },
                    { label: 'High Pressure', value: 'high' },
                    { label: 'Extreme / Overwhelming', value: 'very-high' },
                  ]}
                  value={form.familyExpectations}
                  onChange={(v) => set('familyExpectations', v)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Edit3 size={18} color="#01575E" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0E1A2B', margin: 0 }}>
                  Review Your Inputs
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  background: '#F8FAFC',
                  borderRadius: 12,
                  padding: '18px 20px',
                  marginBottom: 20,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Program</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.department} (Yr {form.year})</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Daily Sleep</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.sleepHours} hrs</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Study Load</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.studyHours} hrs/day</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Exam Pressure</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.examPressure}/10</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Stress Level</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.stressLevel}/10</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>Social Connection</span>
                  <strong style={{ fontSize: 13.5, color: '#0E1A2B' }}>{form.socialSupport}/10</strong>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                When you click "Run AI Wellbeing Assessment", SAHARA computes your dual Random Forest model inference and generates real-time Groq clinical recovery suggestions.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-outline-dark"
                style={{ padding: '10px 20px', fontSize: 13.5 }}
              >
                Back
              </button>
            ) : <div />}

            {step < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-teal"
                style={{ padding: '10px 24px', fontSize: 13.5 }}
              >
                <span>Continue</span>
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAnalyze()}
                className="btn-teal"
                style={{ padding: '12px 28px', fontSize: 14 }}
              >
                <Sparkles size={16} />
                <span>Run AI Wellbeing Assessment</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversational NLP Symptom Modal (Ada Health / Claude Healthcare style) */}
        {showAiModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(14,26,43,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              padding: 20,
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              style={{
                maxWidth: 580,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '28px 30px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
                border: '1.5px solid #E2E8F0',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#E0F2F1',
                    color: '#01575E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={18} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0E1A2B', margin: 0 }}>
                  Conversational Symptom & Strain Intake
                </h3>
              </div>

              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                Describe what you're experiencing in plain language (e.g. sleep hours, symptoms, exam pressure, department, stress level). Groq AI will extract your clinical parameters automatically.
              </p>

              <textarea
                rows={4}
                value={freeTextSymptom}
                onChange={(e) => setFreeTextSymptom(e.target.value)}
                placeholder="Example: I'm a 3rd year engineering student feeling overwhelmed. I've only been getting 3.5 to 4 hours of sleep because midterms are next week. I have constant tension headaches, studying 8 hours a day, and feeling intense pressure from family..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical',
                  marginBottom: 14,
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  type="button"
                  disabled={!freeTextSymptom.trim() || isParsingSymptom}
                  onClick={handleParseSymptomText}
                  className="btn-teal"
                  style={{
                    padding: '8px 18px',
                    fontSize: 13,
                    opacity: !freeTextSymptom.trim() || isParsingSymptom ? 0.6 : 1,
                  }}
                >
                  <Sparkles size={13} />
                  <span>{isParsingSymptom ? 'Extracting Parameters...' : 'Analyze with Groq NLP'}</span>
                </button>
              </div>

              {parsedPreview && (
                <div
                  style={{
                    background: '#F0FDFA',
                    border: '1.5px solid #99F6E4',
                    borderRadius: 12,
                    padding: '16px 18px',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', marginBottom: 6 }}>
                    Clinical Parameter Extraction
                  </div>
                  <p style={{ fontSize: 13, color: '#115E59', margin: '0 0 12px', fontStyle: 'italic' }}>
                    "{parsedPreview.symptomSummary}"
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #CCFBF1', color: '#0F766E' }}>
                      Sleep: <strong>{parsedPreview.sleep_hours} hrs</strong>
                    </span>
                    <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #CCFBF1', color: '#0F766E' }}>
                      Exam Pressure: <strong>{parsedPreview.exam_pressure}/10</strong>
                    </span>
                    <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #CCFBF1', color: '#0F766E' }}>
                      Stress Level: <strong>{parsedPreview.stress_level}/10</strong>
                    </span>
                    <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #CCFBF1', color: '#0F766E' }}>
                      Study Load: <strong>{parsedPreview.study_hours_per_day} hrs</strong>
                    </span>
                    <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 12, border: '1px solid #CCFBF1', color: '#0F766E' }}>
                      Major: <strong>{parsedPreview.department} (Yr {parsedPreview.academic_year})</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleApplyParsedToForm(false)}
                      className="btn-outline-dark"
                      style={{ padding: '8px 14px', fontSize: 12.5 }}
                    >
                      Review & Edit Values
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyParsedToForm(true)}
                      className="btn-teal"
                      style={{ padding: '8px 16px', fontSize: 12.5 }}
                    >
                      <Sparkles size={13} />
                      <span>Run Instant Assessment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
