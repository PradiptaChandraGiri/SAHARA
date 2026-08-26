export interface VettedResource {
  id: string
  category: 'sleep' | 'exam_stress' | 'study_technique' | 'breathing' | 'counseling' | 'screen_time' | 'social_support'
  type: 'video' | 'article' | 'tool' | 'audio'
  title: string
  description: string
  link: string
  readTime: string
  tag: string
  matchedFactor?: string
}

// TODO: replace with real API call to /api/resources?factor=X
export const RESOURCE_LIBRARY: Record<string, VettedResource[]> = {
  high_exam_pressure: [
    {
      id: 'res-exam-1',
      category: 'exam_stress',
      type: 'video',
      title: '5-Minute Breathing Reset Before Exams',
      description: 'Quick somatic breathing method that settles nervous system spikes before walking into a test.',
      link: 'https://www.youtube.com/results?search_query=5+minute+breathing+exercise+for+exam+anxiety',
      readTime: '5 min exercise',
      tag: 'Exam Calm',
      matchedFactor: 'High exam pressure',
    },
    {
      id: 'res-exam-2',
      category: 'study_technique',
      type: 'video',
      title: 'The Pomodoro Method for Study Sessions',
      description: 'Break high-pressure revisions into manageable 25-minute sprints with 5-minute restorative intervals.',
      link: 'https://www.youtube.com/results?search_query=pomodoro+technique+study+method',
      readTime: '4 min guide',
      tag: 'Study Rhythm',
      matchedFactor: 'High exam pressure',
    },
  ],
  high_screen_time: [
    {
      id: 'res-screen-1',
      category: 'screen_time',
      type: 'video',
      title: 'Building a Screen-Free Evening Wind-Down',
      description: 'How a 15-minute digital sunset restores sleep architecture and protects your cognitive focus.',
      link: 'https://www.youtube.com/results?search_query=10+minute+evening+wind+down+routine+for+students',
      readTime: '4 min video',
      tag: 'Digital Balance',
      matchedFactor: 'High screen time',
    },
    {
      id: 'res-screen-2',
      category: 'sleep',
      type: 'article',
      title: 'Blue Light & Memory Retention Guide',
      description: 'Simple display adjustments and breaks that keep eye strain low during long coding and reading nights.',
      link: 'https://www.sleepfoundation.org/bedroom-environment/blue-light',
      readTime: '3 min read',
      tag: 'Eye Rest',
      matchedFactor: 'High screen time',
    },
  ],
  insufficient_sleep: [
    {
      id: 'res-sleep-1',
      category: 'sleep',
      type: 'article',
      title: 'Sleep Hygiene for University Students',
      description: 'Evidence-based protocols to fall asleep faster even when study schedules are erratic.',
      link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3768102/',
      readTime: '4 min read',
      tag: 'Sleep Hygiene',
      matchedFactor: 'Low sleep hours',
    },
    {
      id: 'res-sleep-2',
      category: 'breathing',
      type: 'audio',
      title: '4-7-8 Sleep Relaxation Breathing Session',
      description: 'Biologically slows your heart rate to trigger deep natural sleep readiness in under 3 minutes.',
      link: 'https://www.youtube.com/results?search_query=4-7-8+breathing+exercise+for+anxiety',
      readTime: '3 min audio',
      tag: 'Deep Rest',
      matchedFactor: 'Low sleep hours',
    },
  ],
  high_stress_level: [
    {
      id: 'res-stress-1',
      category: 'breathing',
      type: 'video',
      title: 'Progressive Muscle Relaxation for Acute Tension',
      description: 'Systematically unclench physical tension from shoulders, jaw, and lower back.',
      link: 'https://www.youtube.com/results?search_query=progressive+muscle+relaxation+for+stress',
      readTime: '5 min exercise',
      tag: 'Tension Relief',
      matchedFactor: 'High stress level',
    },
    {
      id: 'res-stress-2',
      category: 'study_technique',
      type: 'tool',
      title: 'Eisenhower Priority Matrix for Overwhelm',
      description: 'A 2-minute sorting exercise to untangle competing deadlines when everything feels urgent.',
      link: 'https://todoist.com/productivity-methods/eisenhower-matrix',
      readTime: '3 min exercise',
      tag: 'De-escalation',
      matchedFactor: 'High stress level',
    },
  ],
  academic_strain: [
    {
      id: 'res-acad-1',
      category: 'study_technique',
      type: 'video',
      title: 'Active Recall & Spaced Repetition Protocol',
      description: 'Proven study technique that cuts required revision time in half while improving recall accuracy.',
      link: 'https://www.youtube.com/results?search_query=active+recall+and+spaced+repetition',
      readTime: '6 min guide',
      tag: 'Study Science',
      matchedFactor: 'Declining academic performance',
    },
    {
      id: 'res-acad-2',
      category: 'study_technique',
      type: 'audio',
      title: 'Brown Noise & Lo-Fi Cognitive Focus Soundscapes',
      description: 'Consistent acoustic masking to tune out library or dorm noise and stay in deep work flow.',
      link: 'https://www.youtube.com/results?search_query=lofi+study+music+focus',
      readTime: 'Continuous stream',
      tag: 'Focus Tool',
      matchedFactor: 'Declining academic performance',
    },
  ],
  low_social_support: [
    {
      id: 'res-social-1',
      category: 'counseling',
      type: 'tool',
      title: 'Campus Peer Study & Mentorship Groups',
      description: 'Connecting with fellow students in your academic branch reduces academic isolation quickly.',
      link: 'https://www.youtube.com/results?search_query=study+with+me+community+productivity',
      readTime: 'Peer Support',
      tag: 'Community',
      matchedFactor: 'Low social support',
    },
    {
      id: 'res-social-2',
      category: 'counseling',
      type: 'tool',
      title: 'Confidential Counselor Connection (14416)',
      description: 'Free, compassionate conversation with a trained listener whenever things feel heavy.',
      link: 'tel:14416',
      readTime: 'Instant 24/7 Call',
      tag: 'Campus Care',
      matchedFactor: 'Low social support',
    },
  ],
}

// Flat list for fallback / global lookups
export const VETTED_RESOURCES: VettedResource[] = Object.values(RESOURCE_LIBRARY).flat()

/**
 * Maps raw backend factor strings (e.g. 'Low sleep hours', 'High exam pressure')
 * to relevant resource cards from the local mock library.
 */
export function getResourcesForFactors(factors: string[], limit: number = 3): VettedResource[] {
  const matched: VettedResource[] = []
  const factorsLower = (factors || []).map((f) => f.toLowerCase())

  // Match high exam pressure
  if (factorsLower.some((f) => f.includes('exam') || f.includes('pressure'))) {
    matched.push(...(RESOURCE_LIBRARY.high_exam_pressure || []))
  }
  // Match sleep
  if (factorsLower.some((f) => f.includes('sleep') || f.includes('rest') || f.includes('tired'))) {
    matched.push(...(RESOURCE_LIBRARY.insufficient_sleep || []))
  }
  // Match screen time
  if (factorsLower.some((f) => f.includes('screen') || f.includes('internet'))) {
    matched.push(...(RESOURCE_LIBRARY.high_screen_time || []))
  }
  // Match stress
  if (factorsLower.some((f) => f.includes('stress') || f.includes('anxiety'))) {
    matched.push(...(RESOURCE_LIBRARY.high_stress_level || []))
  }
  // Match academic performance
  if (factorsLower.some((f) => f.includes('academic') || f.includes('units') || f.includes('grade') || f.includes('performance'))) {
    matched.push(...(RESOURCE_LIBRARY.academic_strain || []))
  }
  // Match social support
  if (factorsLower.some((f) => f.includes('social') || f.includes('support') || f.includes('family'))) {
    matched.push(...(RESOURCE_LIBRARY.low_social_support || []))
  }

  // Deduplicate matched cards by id
  const uniqueMatched = Array.from(new Map(matched.map((item) => [item.id, item])).values())

  // If we still need more to fill the limit, add general best-practice tools
  if (uniqueMatched.length < limit) {
    for (const r of VETTED_RESOURCES) {
      if (!uniqueMatched.some((u) => u.id === r.id)) {
        uniqueMatched.push(r)
        if (uniqueMatched.length >= limit) break
      }
    }
  }

  return uniqueMatched.slice(0, limit)
}

// TODO: replace this canned response logic with a real call to the AI backend once available
export interface ConversationalFollowupReply {
  acknowledgment: string
  suggestion: VettedResource
}

export const FOLLOWUP_REPLY_MAP: Record<string, ConversationalFollowupReply> = {
  'Too much coursework': {
    acknowledgment:
      "It's completely normal to feel buried when multiple deadlines land in the same week. The key is stopping task-switching so you regain cognitive control.",
    suggestion: RESOURCE_LIBRARY.high_stress_level[1], // Eisenhower Matrix
  },
  'Struggling with a specific subject': {
    acknowledgment:
      'Difficult topics often feel overwhelming when re-reading notes passively. Testing yourself in short active recall sprints builds comprehension much faster.',
    suggestion: RESOURCE_LIBRARY.academic_strain[0], // Active Recall
  },
  'Not sleeping enough before exams': {
    acknowledgment:
      'Late-night cramming actually degrades memory retention by 40%. A brief 15-minute wind-down routine helps you sleep soundly without test anxiety keeping you awake.',
    suggestion: RESOURCE_LIBRARY.high_screen_time[0], // Wind-Down Routine
  },
  'Feeling isolated or unsupported': {
    acknowledgment:
      'Carrying academic weight on your own is exhausting. Connecting with a peer study group or speaking with a friendly campus counselor takes the pressure off.',
    suggestion: RESOURCE_LIBRARY.low_social_support[1], // Counselor Connection
  },
  default: {
    acknowledgment:
      'Thank you for sharing. Taking a brief moment to name what you are feeling is already the first step toward regaining your balance.',
    suggestion: RESOURCE_LIBRARY.high_exam_pressure[0], // 5-min Breathing Reset
  },
}
