Create a modern, attractive and fully interactive web app prototype called **SAHARA — Student Academic & Holistic Assistance & Risk Assessment**.

SAHARA is an AI-powered student wellbeing and academic-support platform that identifies students who may be experiencing academic stress, anxiety, or dropout risk and connects them with appropriate support.

Build the prototype as a polished **SIH internal-round demo**. It must work completely on the frontend using realistic mock data and simulated AI responses. **No backend is required.**

## Design Style

* Professional but youthful and friendly.
* Modern university/ed-tech SaaS aesthetic.
* Clean white/light background with soft blue, purple and teal accents.
* Use rounded cards, subtle shadows, clean typography and generous spacing.
* Avoid an overly medical or hospital-like appearance.
* Use meaningful icons, progress indicators, charts and simple illustrations.
* Responsive desktop-first design.
* Make it look like a real deployable product, not a static presentation.
* Use smooth micro-interactions, hover states, loading animations and transitions.

## Main Navigation

Create a sidebar/top navigation with:

1. Home
2. Student Check-in
3. My Results
4. AI Support
5. WhatsApp Support
6. Counselor Dashboard
7. Medication Support
8. Profile

Include a clear SAHARA logo and tagline:

**"Early support. Better outcomes."**

---

# 1. LANDING / HOME PAGE

Create a strong hero section:

**SAHARA**

### "Understand risk. Reach students early."

Subtitle:
"An AI-powered student wellbeing and academic support system designed to identify early warning signs and connect students with the right support."

Primary CTA:

**Start Student Check-in**

Secondary CTA:

**Explore Counselor Dashboard**

Show three attractive feature cards:

* 🧠 Mental Wellbeing Assessment
* 📊 Academic & Dropout Risk Detection
* 🤝 Personalized Support

Add a visual illustration showing:

Student → AI Analysis → Risk Detection → Counselor Support

Include a small impact section:

**Early Detection | Personalized Support | Counselor Intervention**

---

# 2. STUDENT CHECK-IN

Create a multi-step interactive questionnaire.

Show a progress bar:

**Step 1 of 5**

Collect realistic student information:

### Basic Information

* Age
* Gender
* Academic year
* Course/department

### Academic

* Academic performance
* Study hours per day
* Exam pressure
* Attendance/academic engagement

### Wellbeing

* Stress level
* Sleep hours
* Physical activity
* Social support
* Screen time
* Financial stress
* Family expectations

Use friendly sliders, cards, radio buttons and dropdowns instead of boring forms.

At the bottom:

**Back | Continue**

Final button:

**Analyze My Wellbeing**

When clicked, show a 2–3 second animated AI analysis screen:

"Analyzing your responses..."
"Evaluating wellbeing indicators..."
"Identifying academic risk factors..."
"Preparing personalized support..."

Then automatically show the results page.

---

# 3. STUDENT RESULTS

Create a visually impressive risk assessment dashboard.

At the top:

### "Your Wellbeing Snapshot"

Show three large metric cards:

**Anxiety Risk**
Example: 72%

**Dropout Risk**
Example: 68%

**Overall Risk**
Example: HIGH

Use a large circular risk indicator.

Show:

### "What influenced your result?"

Display factor cards such as:

* High exam pressure
* Low sleep
* Academic stress
* Financial concerns
* Low social support

Then show:

### "Your Personalized Support Plan"

Example recommendations:

1. Consider speaking with a counselor.
2. Try maintaining a consistent sleep schedule.
3. Explore academic mentoring resources.
4. Take short breaks during long study sessions.

Add a supportive message:

**"You don't have to handle everything alone. Support is available."**

Buttons:

**Talk to a Counselor**
**Chat with AI Support**
**Explore Resources**

The result should change based on the selected mock answers. Create at least Low, Medium and High risk states.

---

# 4. AI SUPPORT

Create a conversational AI assistant called:

### "SAHARA AI"

Subtitle:
"Your private first step toward support."

Create a realistic chat interface.

Example conversation:

Student:
"I'm feeling overwhelmed with exams."

SAHARA AI:
"That sounds difficult. Let's take it one step at a time. Would you like help with managing exam stress, planning your study time, or finding someone to talk to?"

Include quick buttons:

* Exam Stress
* Study Planning
* Sleep
* Anxiety
* Talk to Counselor

Make the chat interactive using predefined frontend responses.

Add a small disclaimer:

"SAHARA AI provides supportive guidance and is not a replacement for professional medical care."

---

# 5. WHATSAPP SUPPORT

Create a dedicated page explaining the WhatsApp support workflow.

Show a phone mockup with a realistic conversation:

Student:
"Hi SAHARA"

SAHARA:
"Hi! Let's do a quick wellbeing check-in."

Show 3–5 simple questions inside the WhatsApp conversation.

After completion:

**Risk detected: Medium**

"Based on your responses, you may benefit from additional support."

Button:

**Connect with Counselor**

Also show a visual workflow:

WhatsApp → Check-in → AI Assessment → Risk Detection → Support

This is a simulated frontend demonstration only.

---

# 6. COUNSELOR DASHBOARD

Create a professional dashboard for counselors.

Top KPI cards:

**Total Students**
**High Risk**
**Medium Risk**
**Needs Follow-up**

Add a risk distribution chart.

Create a student table:

| Student | Risk | Score | Key Factor | Status |
| Student A | HIGH | 78% | Exam Stress | New |
| Student B | MEDIUM | 54% | Sleep | Contacted |
| Student C | LOW | 21% | — | Stable |

Use realistic but fictional student names/IDs.

Add filters:

* All
* High Risk
* Medium Risk
* Low Risk
* New
* Contacted

Clicking a student opens a detailed profile.

---

# 7. COUNSELOR STUDENT PROFILE

Show:

### Student Risk Profile

Student ID
Academic Year
Department

Large risk indicator.

Show:

**Anxiety Risk**
**Dropout Probability**
**Overall Risk**

Add a "Key Factors" section.

Add a timeline:

Check-in → AI Assessment → Risk Detected → Counselor Alert

Buttons:

**Mark as Contacted**
**Send Support Message**
**Schedule Follow-up**

When "Mark as Contacted" is clicked, change status from:

**NEW → CONTACTED**

Use frontend state/local storage so the interaction persists during the demo.

---

# 8. MEDICATION / SUPPORT MANAGEMENT

Create a clean support-management page.

Show:

### "Support & Medication Assistance"

Allow a simulated upload of a prescription/document.

Show a frontend-only extraction result:

Medication name
Dosage
Frequency
Next reminder

Include a clear warning:

"Medication information is provided for organization only. Always follow instructions from a qualified healthcare professional."

This feature is a prototype simulation and should not claim to prescribe medication.

---

# 9. PROFILE

Create a simple student profile page.

Include:

Name
Student ID
Department
Academic Year

Show:

### Wellbeing History

Small cards/charts for:

Stress
Sleep
Academic pressure
Risk score

Show previous check-ins:

* August 19 — Medium Risk
* August 12 — Low Risk
* August 05 — Medium Risk

---

# 10. IMPORTANT INTERACTION REQUIREMENTS

Make the prototype feel functional even without a backend.

Use frontend mock data/state.

Required interactions:

* Navigation between every page.
* Student check-in form works.
* Progress bar updates.
* AI analysis loading animation appears after submission.
* Risk result changes between Low/Medium/High based on mock answers.
* Recommendations change with risk level.
* AI chatbot has predefined interactive responses.
* Counselor dashboard filters students.
* Clicking a student opens detailed information.
* "Mark as Contacted" changes the status.
* Charts and statistics display realistic mock data.
* WhatsApp conversation is clickable.
* Buttons should have hover/pressed states.
* Add smooth page transitions.
* Include loading, success and empty states where appropriate.

## Demo Flow

Optimize the entire prototype around this 2-minute SIH presentation flow:

**Home**
→ **Student Check-in**
→ Answer questions
→ **AI Analysis animation**
→ **High Risk Result**
→ View key factors
→ View personalized recommendations
→ Open **Counselor Dashboard**
→ Show the student appearing as HIGH RISK
→ Open student profile
→ **Mark as Contacted**
→ Show status changing to CONTACTED
→ Open **AI Support**
→ Demonstrate support conversation
→ Show **WhatsApp Support** workflow.

The prototype should clearly communicate this core idea:

### "SAHARA detects early warning signs, understands student risk, and helps counselors intervene before the problem becomes serious."

Do not make the prototype dependent on any backend, API key, database or external service. Use realistic mock data and frontend state so the entire demonstration works directly in the browser.

Make the final UI polished enough to look like a real startup/product prototype suitable for an **SIH internal judging round**.
