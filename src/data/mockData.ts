export interface Student {
  id: string
  name: string
  avatar: string
  year: string
  dept: string
  riskLevel: 'high' | 'medium' | 'low'
  riskScore: number
  anxietyRisk: number
  dropoutRisk: number
  keyFactor: string
  factors: string[]
  checkInDate: string
  age: number
  email: string
  phone: string
  gpa: number
  attendance: number
  timeline: { date: string; event: string; type: 'checkin' | 'ai' | 'risk' | 'counselor' }[]
}

export const mockStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Arjun Sharma',
    avatar: 'AS',
    year: '3rd Year',
    dept: 'Computer Science',
    riskLevel: 'high',
    riskScore: 78,
    anxietyRisk: 75,
    dropoutRisk: 72,
    keyFactor: 'Exam Stress',
    factors: ['High exam pressure', 'Sleep deprivation (4h/night)', 'Financial stress', 'Low social support', 'Poor study-life balance'],
    checkInDate: 'Aug 17, 2026',
    age: 20,
    email: 'arjun.sharma@university.edu',
    phone: '+91 98765 43210',
    gpa: 5.8,
    attendance: 61,
    timeline: [
      { date: 'Aug 17, 2026 09:14 AM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 17, 2026 09:15 AM', event: 'AI Assessment completed — HIGH risk detected', type: 'ai' },
      { date: 'Aug 17, 2026 09:15 AM', event: 'Risk Alert generated: Score 78%', type: 'risk' },
      { date: 'Aug 17, 2026 10:02 AM', event: 'Counselor notified', type: 'counselor' },
    ]
  },
  {
    id: 'STU002',
    name: 'Priya Nair',
    avatar: 'PN',
    year: '2nd Year',
    dept: 'Electronics Engineering',
    riskLevel: 'high',
    riskScore: 71,
    anxietyRisk: 68,
    dropoutRisk: 65,
    keyFactor: 'Academic Pressure',
    factors: ['High academic workload', 'Family expectations', 'Irregular sleep', 'Low physical activity'],
    checkInDate: 'Aug 16, 2026',
    age: 19,
    email: 'priya.nair@university.edu',
    phone: '+91 87654 32109',
    gpa: 6.2,
    attendance: 70,
    timeline: [
      { date: 'Aug 16, 2026 11:30 AM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 16, 2026 11:31 AM', event: 'AI Assessment completed — HIGH risk detected', type: 'ai' },
      { date: 'Aug 16, 2026 11:31 AM', event: 'Risk Alert generated: Score 71%', type: 'risk' },
      { date: 'Aug 16, 2026 02:15 PM', event: 'Counselor notified', type: 'counselor' },
    ]
  },
  {
    id: 'STU003',
    name: 'Rahul Mehta',
    avatar: 'RM',
    year: '1st Year',
    dept: 'Mechanical Engineering',
    riskLevel: 'medium',
    riskScore: 54,
    anxietyRisk: 50,
    dropoutRisk: 44,
    keyFactor: 'Sleep Issues',
    factors: ['Poor sleep quality', 'High screen time', 'Moderate exam stress'],
    checkInDate: 'Aug 15, 2026',
    age: 18,
    email: 'rahul.mehta@university.edu',
    phone: '+91 76543 21098',
    gpa: 7.1,
    attendance: 78,
    timeline: [
      { date: 'Aug 15, 2026 03:45 PM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 15, 2026 03:46 PM', event: 'AI Assessment completed — MEDIUM risk', type: 'ai' },
      { date: 'Aug 15, 2026 03:46 PM', event: 'Risk Flag generated: Score 54%', type: 'risk' },
    ]
  },
  {
    id: 'STU004',
    name: 'Ananya Krishnan',
    avatar: 'AK',
    year: '4th Year',
    dept: 'Civil Engineering',
    riskLevel: 'medium',
    riskScore: 48,
    anxietyRisk: 45,
    dropoutRisk: 38,
    keyFactor: 'Social Isolation',
    factors: ['Low social support', 'Placement anxiety', 'Moderate financial stress'],
    checkInDate: 'Aug 14, 2026',
    age: 21,
    email: 'ananya.k@university.edu',
    phone: '+91 65432 10987',
    gpa: 7.8,
    attendance: 82,
    timeline: [
      { date: 'Aug 14, 2026 10:00 AM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 14, 2026 10:01 AM', event: 'AI Assessment completed — MEDIUM risk', type: 'ai' },
      { date: 'Aug 14, 2026 10:01 AM', event: 'Risk Flag generated: Score 48%', type: 'risk' },
    ]
  },
  {
    id: 'STU005',
    name: 'Dev Patel',
    avatar: 'DP',
    year: '2nd Year',
    dept: 'Information Technology',
    riskLevel: 'low',
    riskScore: 21,
    anxietyRisk: 20,
    dropoutRisk: 15,
    keyFactor: '—',
    factors: [],
    checkInDate: 'Aug 13, 2026',
    age: 19,
    email: 'dev.patel@university.edu',
    phone: '+91 54321 09876',
    gpa: 8.6,
    attendance: 91,
    timeline: [
      { date: 'Aug 13, 2026 02:20 PM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 13, 2026 02:21 PM', event: 'AI Assessment completed — LOW risk', type: 'ai' },
    ]
  },
  {
    id: 'STU006',
    name: 'Kavya Reddy',
    avatar: 'KR',
    year: '3rd Year',
    dept: 'Chemical Engineering',
    riskLevel: 'low',
    riskScore: 18,
    anxietyRisk: 16,
    dropoutRisk: 12,
    keyFactor: '—',
    factors: [],
    checkInDate: 'Aug 12, 2026',
    age: 20,
    email: 'kavya.r@university.edu',
    phone: '+91 43210 98765',
    gpa: 9.1,
    attendance: 95,
    timeline: [
      { date: 'Aug 12, 2026 11:10 AM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 12, 2026 11:11 AM', event: 'AI Assessment completed — LOW risk', type: 'ai' },
    ]
  },
  {
    id: 'STU007',
    name: 'Vikram Singh',
    avatar: 'VS',
    year: '1st Year',
    dept: 'Computer Science',
    riskLevel: 'high',
    riskScore: 83,
    anxietyRisk: 80,
    dropoutRisk: 76,
    keyFactor: 'Financial Stress',
    factors: ['Severe financial stress', 'Family pressure', 'Poor attendance', 'High exam pressure', 'Low sleep'],
    checkInDate: 'Aug 18, 2026',
    age: 18,
    email: 'vikram.s@university.edu',
    phone: '+91 32109 87654',
    gpa: 5.2,
    attendance: 55,
    timeline: [
      { date: 'Aug 18, 2026 08:30 AM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 18, 2026 08:31 AM', event: 'AI Assessment completed — HIGH risk detected', type: 'ai' },
      { date: 'Aug 18, 2026 08:31 AM', event: 'Risk Alert generated: Score 83%', type: 'risk' },
      { date: 'Aug 18, 2026 09:00 AM', event: 'Counselor notified', type: 'counselor' },
    ]
  },
  {
    id: 'STU008',
    name: 'Sneha Iyer',
    avatar: 'SI',
    year: '4th Year',
    dept: 'Biotechnology',
    riskLevel: 'medium',
    riskScore: 57,
    anxietyRisk: 55,
    dropoutRisk: 50,
    keyFactor: 'Exam Pressure',
    factors: ['Research thesis stress', 'Sleep disruption', 'Low physical activity'],
    checkInDate: 'Aug 11, 2026',
    age: 22,
    email: 'sneha.i@university.edu',
    phone: '+91 21098 76543',
    gpa: 7.4,
    attendance: 75,
    timeline: [
      { date: 'Aug 11, 2026 04:00 PM', event: 'Student completed Check-in', type: 'checkin' },
      { date: 'Aug 11, 2026 04:01 PM', event: 'AI Assessment completed — MEDIUM risk', type: 'ai' },
      { date: 'Aug 11, 2026 04:01 PM', event: 'Risk Flag generated: Score 57%', type: 'risk' },
    ]
  },
]

export const riskChartData = [
  { name: 'High Risk', value: 3, color: '#EF4444' },
  { name: 'Medium Risk', value: 3, color: '#F59E0B' },
  { name: 'Low Risk', value: 2, color: '#22C55E' },
]

export const weeklyCheckIns = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 24 },
  { day: 'Thu', count: 15 },
  { day: 'Fri', count: 21 },
  { day: 'Sat', count: 9 },
  { day: 'Sun', count: 6 },
]

export const profileHistory = [
  { date: 'Aug 18', stress: 72, sleep: 5, pressure: 80, risk: 74 },
  { date: 'Aug 11', stress: 60, sleep: 6, pressure: 65, risk: 58 },
  { date: 'Aug 04', stress: 55, sleep: 6.5, pressure: 58, risk: 50 },
  { date: 'Jul 28', stress: 45, sleep: 7, pressure: 50, risk: 40 },
  { date: 'Jul 21', stress: 35, sleep: 7.5, pressure: 42, risk: 32 },
]

export const checkInHistory = [
  { date: 'August 18, 2026', risk: 'High', score: 74, status: 'latest' },
  { date: 'August 11, 2026', risk: 'Medium', score: 58, status: 'reviewed' },
  { date: 'August 04, 2026', risk: 'Medium', score: 50, status: 'reviewed' },
  { date: 'July 28, 2026', risk: 'Low', score: 32, status: 'reviewed' },
]
