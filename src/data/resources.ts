export interface VettedResource {
  id: string
  category: 'sleep' | 'exam_stress' | 'study_technique' | 'breathing' | 'counseling'
  title: string
  description: string
  link: string
  readTime: string
  tag: string
}

export const VETTED_RESOURCES: VettedResource[] = [
  // Sleep Hygiene
  {
    id: 'sleep-1',
    category: 'sleep',
    title: '10-Minute Wind-Down Routine for Students',
    description: 'Evidence-based pre-sleep sequence that triggers parasympathetic relaxation and speeds sleep onset.',
    link: 'https://www.youtube.com/results?search_query=10+minute+evening+wind+down+routine+for+students',
    readTime: '4 min video',
    tag: 'Sleep Hygiene',
  },
  {
    id: 'sleep-2',
    category: 'sleep',
    title: 'Managing Screen Time & Blue Light Before Bed',
    description: 'Practical steps to protect melatonin synthesis during late-night exam revision.',
    link: 'https://www.sleepfoundation.org/bedroom-environment/blue-light',
    readTime: '3 min read',
    tag: 'Sleep Hygiene',
  },
  {
    id: 'sleep-3',
    category: 'sleep',
    title: 'Sleep & Memory Consolidation in College',
    description: 'How non-REM and REM sleep cycles directly transfer study material into long-term recall.',
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3768102/',
    readTime: '5 min read',
    tag: 'Academic Science',
  },

  // Exam Stress & Anxiety
  {
    id: 'exam-1',
    category: 'exam_stress',
    title: 'Overcoming Anticipatory Test Anxiety',
    description: 'Cognitive reframing techniques to prevent mental blanking during high-stakes exams.',
    link: 'https://www.youtube.com/results?search_query=overcoming+exam+anxiety+cognitive+reframing',
    readTime: '6 min guide',
    tag: 'Mental Wellbeing',
  },
  {
    id: 'exam-2',
    category: 'exam_stress',
    title: 'Progressive Muscle Relaxation (PMR)',
    description: 'Quick somatic method to release physical tension stored in shoulders, neck, and jaw.',
    link: 'https://www.youtube.com/results?search_query=progressive+muscle+relaxation+for+stress',
    readTime: '5 min exercise',
    tag: 'Somatic Relief',
  },
  {
    id: 'exam-3',
    category: 'exam_stress',
    title: 'De-escalating Academic Overwhelm',
    description: 'Structured decision matrix to triage assignments when everything feels equally urgent.',
    link: 'https://todoist.com/productivity-methods/eisenhower-matrix',
    readTime: '4 min read',
    tag: 'Time Management',
  },

  // Study Technique & Deep Work
  {
    id: 'study-1',
    category: 'study_technique',
    title: 'The Pomodoro Technique (25/5 Study Rhythm)',
    description: 'Prevent mental fatigue with structured focus blocks and restorative screen-free intervals.',
    link: 'https://www.youtube.com/results?search_query=pomodoro+technique+study+method',
    readTime: '3 min overview',
    tag: 'Focus Protocol',
  },
  {
    id: 'study-2',
    category: 'study_technique',
    title: 'Active Recall & Spaced Repetition Protocol',
    description: 'The highest-yield learning technique proven to outperform passive re-reading by 300%.',
    link: 'https://www.youtube.com/results?search_query=active+recall+and+spaced+repetition',
    readTime: '7 min guide',
    tag: 'Study Science',
  },
  {
    id: 'study-3',
    category: 'study_technique',
    title: 'Lo-Fi Focus & Brown Noise Audio Hub',
    description: 'Consistent auditory masks that block ambient campus distractions and enhance concentration.',
    link: 'https://www.youtube.com/results?search_query=lofi+study+music+focus',
    readTime: 'Continuous audio',
    tag: 'Focus Tools',
  },

  // Breathing & Rapid Relaxation
  {
    id: 'breath-1',
    category: 'breathing',
    title: '4-7-8 Deep Parasympathetic Breathing',
    description: 'Inhale 4s, hold 7s, exhale 8s — biologically resets heart rate variability in under 2 minutes.',
    link: 'https://www.youtube.com/results?search_query=4-7-8+breathing+exercise+for+anxiety',
    readTime: '2 min exercise',
    tag: 'Calm Technique',
  },
  {
    id: 'breath-2',
    category: 'breathing',
    title: 'Box Breathing for Acute Focus',
    description: 'Four equal counts of inhale, hold, exhale, hold used to stabilize panic and focus attention.',
    link: 'https://www.youtube.com/results?search_query=box+breathing+technique+guided',
    readTime: '3 min guided',
    tag: 'Focus Technique',
  },
  {
    id: 'breath-3',
    category: 'breathing',
    title: 'Physiological Sigh Protocol',
    description: 'Two quick inhales through the nose followed by a long mouth exhale for instant nervous system relief.',
    link: 'https://www.youtube.com/results?search_query=physiological+sigh+andrew+huberman',
    readTime: '2 min exercise',
    tag: 'Rapid Relief',
  },

  // Professional & Campus Counseling
  {
    id: 'counsel-1',
    category: 'counseling',
    title: 'National Tele-MANAS 24/7 Helpline (Toll-Free: 14416)',
    description: 'Direct government mental health counseling network offering free, confidential help across India.',
    link: 'tel:14416',
    readTime: 'Instant 24/7 Call',
    tag: 'Emergency Support',
  },
  {
    id: 'counsel-2',
    category: 'counseling',
    title: 'TISS iCall Counseling Services',
    description: 'Free psychosocial counseling by certified professionals at Tata Institute of Social Sciences.',
    link: 'tel:9152987821',
    readTime: 'Mon-Sat 10am-8pm',
    tag: 'Professional Counseling',
  }
]

export function getResourcesForFactors(factors: string[], limit: number = 3): VettedResource[] {
  const selected: VettedResource[] = []
  const factorStr = (factors || []).join(' ').toLowerCase()

  if (factorStr.includes('sleep') || factorStr.includes('rest')) {
    const sleepRes = VETTED_RESOURCES.filter(r => r.category === 'sleep')
    selected.push(...sleepRes.slice(0, 2))
  }
  if (factorStr.includes('exam') || factorStr.includes('stress') || factorStr.includes('pressure')) {
    const examRes = VETTED_RESOURCES.filter(r => r.category === 'exam_stress' || r.category === 'breathing')
    selected.push(...examRes.slice(0, 2))
  }
  if (factorStr.includes('academic') || factorStr.includes('performance') || factorStr.includes('unit') || factorStr.includes('attendance')) {
    const studyRes = VETTED_RESOURCES.filter(r => r.category === 'study_technique')
    selected.push(...studyRes.slice(0, 2))
  }

  // Fallback defaults
  if (selected.length < limit) {
    const defaults = VETTED_RESOURCES.filter(r => !selected.some(s => s.id === r.id))
    selected.push(...defaults.slice(0, limit - selected.length))
  }

  return selected.slice(0, limit)
}
