# SAHARA — Team Presenter Briefing & Q&A Cheat Sheet

## Problem Statement
Student mental health crises and academic attrition are tightly intertwined yet siloed in institutional support systems:
- Over 60% of university students report severe academic stress and anxiety.
- Traditional counseling is reactive: students only reach out when in severe crisis or failing courses.
- Stigma and lack of accessible, confidential tools prevent timely interventions.

## SAHARA's Solution
SAHARA acts as an ambient, non-intrusive early-detection shield:
1. **Low Friction**: Students engage through familiar tools — WhatsApp or a 2-minute web slider.
2. **Dual-Lens AI**: Evaluates both psychological distress AND academic progression simultaneously.
3. **Automated Triage**: Low risk gets curated self-help; Medium risk gets gentle peer tips; High risk triggers counselor alerts and 24/7 crisis numbers (Tele-MANAS, iCall, KIRAN).

---

## Anticipated Judge / Evaluator Questions & Answers

**Q: How is student privacy handled?**
> A: Student names and contact numbers are hashed using one-way SHA-256 into anonymized IDs (`STU-XXXXXX`). Only designated campus counselors can reach out via authenticated institutional workflows.

**Q: What machine learning models are used?**
> A: We employ dual Random Forest models: a Regressor for continuous anxiety scoring (0–10) and a Classifier for multi-class dropout risk probability (Dropout/Enrolled/Graduate).

**Q: Why Random Forest over Deep Learning?**
> A: High interpretability, resistance to tabular overfitting, instant millisecond inference times on low-cost serverless infrastructure, and strict feature importance extraction for explainability.

**Q: Does WhatsApp support interactive buttons?**
> A: Yes! We use Twilio's Content API to render native interactive List Pickers for gender/year selection and Quick Reply buttons for tuition status and restart flows.
