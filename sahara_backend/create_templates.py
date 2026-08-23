import os
import requests
from dotenv import load_dotenv

load_dotenv()
sid = os.getenv("TWILIO_ACCOUNT_SID")
tok = os.getenv("TWILIO_AUTH_TOKEN")

print(f"Connecting to Twilio Content API (Account: {sid[:6]}...)\n")

def create_template(friendly_name, types_dict):
    payload = {
        "friendly_name": friendly_name,
        "language": "en",
        "variables": {},
        "types": types_dict
    }
    res = requests.post(
        "https://content.twilio.com/v1/Content",
        json=payload,
        auth=(sid, tok)
    )
    if res.status_code in (200, 201):
        data = res.json()
        print(f"[OK] {friendly_name} -> {data['sid']}")
        return data["sid"]
    else:
        print(f"[ERROR] Failed to create {friendly_name}: {res.status_code} - {res.text}")
        return ""

print("Creating Interactive Templates...")

gender_sid = create_template(
    "sahara_gender_picker",
    {
        "twilio/list-picker": {
            "body": "What's your gender?",
            "button": "Select Gender",
            "items": [
                {"item": "Female", "id": "1", "description": "Option 1"},
                {"item": "Male", "id": "2", "description": "Option 2"},
                {"item": "Non-binary", "id": "3", "description": "Option 3"},
                {"item": "Prefer not to say", "id": "4", "description": "Option 4"},
            ]
        }
    }
)

year_sid = create_template(
    "sahara_academic_year_picker",
    {
        "twilio/list-picker": {
            "body": "Which year of college are you in?",
            "button": "Select Year",
            "items": [
                {"item": "1st year", "id": "1", "description": "Freshman / 1st Year"},
                {"item": "2nd year", "id": "2", "description": "Sophomore / 2nd Year"},
                {"item": "3rd year", "id": "3", "description": "Junior / 3rd Year"},
                {"item": "4th year", "id": "4", "description": "Senior / Final Year"},
            ]
        }
    }
)

tuition_sid = create_template(
    "sahara_tuition_reply",
    {
        "twilio/quick-reply": {
            "body": "Is your college tuition fee up to date?",
            "actions": [
                {"title": "Yes", "id": "1"},
                {"title": "No", "id": "2"}
            ]
        }
    }
)

restart_sid = create_template(
    "sahara_restart_reply",
    {
        "twilio/quick-reply": {
            "body": "Want to do another check-in?",
            "actions": [
                {"title": "Yes, start", "id": "yes"},
                {"title": "Not now", "id": "no"}
            ]
        }
    }
)

print("\n==================================================")
print("SAVE THESE CONTENT SIDS INTO YOUR .ENV FILE:")
print("==================================================")
print(f"CONTENT_SID_GENDER={gender_sid}")
print(f"CONTENT_SID_YEAR={year_sid}")
print(f"CONTENT_SID_TUITION={tuition_sid}")
print(f"CONTENT_SID_RESTART={restart_sid}")
