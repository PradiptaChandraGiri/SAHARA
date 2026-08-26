"""SQLite persistence layer for SAHARA assessments and authentication.

Schema:
- assessments:
  - assessment_id (TEXT, Primary Key)
  - student_id (TEXT, Anonymized ID e.g. STU-A1B2C3 — Privacy Preserved)
  - timestamp (TEXT, ISO-8601 UTC)
  - anxiety_score (REAL)
  - dropout_probability (REAL)
  - combined_score (REAL)
  - risk_tier (TEXT)
  - top_factors (TEXT, JSON array)
  - status (TEXT: 'New' | 'In progress' | 'Contacted')
  - notes (TEXT, Optional counselor notes)
  - raw_input (TEXT, Full input payload for audit)

- users:
  - id (TEXT, Primary Key)
  - name (TEXT)
  - email (TEXT, Unique)
  - password_hash (TEXT)
  - salt (TEXT)
  - role (TEXT: 'student' | 'counselor' | 'admin')
  - created_at (TEXT)
"""
from __future__ import annotations

import datetime
import hashlib
import json
import os
import secrets
import sqlite3
import uuid
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_PATH = Path(__file__).resolve().parent / "sahara.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> tuple[str, str]:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return pw_hash, salt


def verify_password(password: str, pw_hash: str, salt: str) -> bool:
    """Verify password against stored PBKDF2 hash and salt."""
    check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return secrets.compare_digest(check, pw_hash)


def init_db() -> None:
    """Initialize database tables, indexes, and initial accounts."""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS assessments (
                assessment_id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                anxiety_score REAL,
                dropout_probability REAL,
                combined_score REAL,
                risk_tier TEXT,
                top_factors TEXT,
                status TEXT NOT NULL DEFAULT 'New',
                notes TEXT,
                raw_input TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()

    # Seed default demonstration accounts if users table is empty
    _seed_default_users()


def _seed_default_users():
    """Ensure standard demonstrator accounts exist for easy testing."""
    with _connect() as conn:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        demo_users = [
            ("Dr. Ananya Roy", "counselor@sahara.edu", "counselor123", "counselor"),
            ("Dean Sharma", "admin@sahara.edu", "admin123", "admin"),
            ("Aarav Patel", "student@sahara.edu", "student123", "student"),
            ("Student Demo", "demo.student@sahara.app", "sahara-demo", "student"),
            ("Counselor Demo", "demo.counselor@sahara.app", "sahara-demo", "counselor"),
            ("Admin Demo", "demo.admin@sahara.app", "sahara-demo", "admin"),
        ]
        for name, email, pwd, role in demo_users:
            p_hash, salt = hash_password(pwd)
            conn.execute(
                """
                INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (f"usr_{uuid.uuid4().hex[:8]}", name, email.lower(), p_hash, salt, role, now),
            )
        conn.commit()


# ============================================================
# User Authentication Helpers
# ============================================================

def create_user(name: str, email: str, password: str, role: str = "student") -> Dict[str, Any]:
    """Register a new user account."""
    init_db()
    email_clean = email.strip().lower()
    p_hash, salt = hash_password(password)
    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with _connect() as conn:
        try:
            conn.execute(
                """
                INSERT INTO users (id, name, email, password_hash, salt, role, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, name.strip(), email_clean, p_hash, salt, role, now),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError("An account with this email address already exists.")

    return {"id": user_id, "name": name, "email": email_clean, "role": role, "created_at": now}


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Look up user record by email."""
    init_db()
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    return dict(row) if row else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Look up user profile by ID without exposing security hash/salt."""
    init_db()
    with _connect() as conn:
        row = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def get_or_create_oauth_user(provider: str, email: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve existing user with their designated database role, or register a new user defaulting to 'student'."""
    init_db()
    email_clean = email.strip().lower()
    user = get_user_by_email(email_clean)
    if user:
        return user

    # Default to 'student' for all new OAuth sign-ups
    assigned_role = "student"
    display_name = name.strip() if name and name.strip() else f"{provider.capitalize()} User"
    random_pw = f"oauth_{provider}_{uuid.uuid4().hex}"
    p_hash, salt = hash_password(random_pw)
    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO users (id, name, email, password_hash, salt, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, display_name, email_clean, p_hash, salt, assigned_role, now),
        )
        conn.commit()

    return {"id": user_id, "name": display_name, "email": email_clean, "role": assigned_role, "created_at": now}


def list_users() -> List[Dict[str, Any]]:
    """List all registered users with their roles (Admin access)."""
    init_db()
    with _connect() as conn:
        rows = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


def update_user_role(user_id: str, new_role: str) -> bool:
    """Update a user's access role (Admin access)."""
    init_db()
    if new_role not in {"student", "counselor", "admin"}:
        raise ValueError("Invalid role specified.")
    with _connect() as conn:
        cursor = conn.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()
        return cursor.rowcount > 0


# ============================================================
# Assessment Storage & Metrics
# ============================================================

def anonymize_student(name_or_phone: Optional[str]) -> str:
    """Generate non-reversible anonymized student identifier (STU-XXXXXX)."""
    if not name_or_phone or name_or_phone in {"Student", "Anonymous", "WhatsApp User"}:
        return f"STU-{uuid.uuid4().hex[:6].upper()}"
    h = hashlib.sha256(name_or_phone.strip().lower().encode()).hexdigest()[:6].upper()
    return f"STU-{h}"


def log_assessment(
    assessment_id: str,
    timestamp: str,
    result: Any,
    student_name: Optional[str] = None,
    top_factors: Optional[List[str]] = None,
    raw_input: Optional[Dict[str, Any]] = None,
) -> str:
    """Persist student assessment record with anonymized identifier."""
    init_db()
    row_id = assessment_id or str(uuid.uuid4())
    student_id = anonymize_student(student_name)

    anxiety = getattr(result, "anxiety_score", None)
    dropout = getattr(result, "dropout_probability", None)
    combined = getattr(result, "combined_score", None)
    tier = getattr(result, "risk_tier", None)

    values = (
        row_id,
        student_id,
        timestamp,
        anxiety,
        dropout,
        combined,
        tier,
        json.dumps(top_factors or []),
        "New",
        None,
        json.dumps(raw_input or {}),
    )

    with _connect() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO assessments
            (assessment_id, student_id, timestamp, anxiety_score, dropout_probability,
             combined_score, risk_tier, top_factors, status, notes, raw_input)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            values,
        )
        conn.commit()
    return row_id


def list_assessments(
    student_id: Optional[str] = None,
    risk_tier: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """Query paginated assessment records with optional tier or student filtering."""
    init_db()
    query = "SELECT * FROM assessments WHERE 1=1"
    params: List[Any] = []

    if student_id:
        query += " AND student_id = ?"
        params.append(student_id)
    if risk_tier:
        query += " AND risk_tier = ?"
        params.append(risk_tier)

    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    with _connect() as conn:
        total = conn.execute(count_query, params).fetchone()[0]

        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        rows = conn.execute(query, params).fetchall()

    assessments = []
    for r in rows:
        d = dict(r)
        try:
            d["top_factors"] = json.loads(d.get("top_factors") or "[]")
        except Exception:
            d["top_factors"] = []
        d.pop("raw_input", None)
        assessments.append(d)

    return {
        "total": total,
        "assessments": assessments,
    }


def get_assessment(assessment_id: str) -> Optional[Dict[str, Any]]:
    """Fetch single assessment record by ID."""
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM assessments WHERE assessment_id = ?", (assessment_id,)
        ).fetchone()
    if not row:
        return None
    d = dict(row)
    try:
        d["top_factors"] = json.loads(d.get("top_factors") or "[]")
    except Exception:
        d["top_factors"] = []
    return d


def update_assessment_status(
    assessment_id: str, status: str, notes: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Update counselor contact status and optional notes."""
    init_db()
    with _connect() as conn:
        cur = conn.execute(
            """
            UPDATE assessments
            SET status = ?, notes = COALESCE(?, notes)
            WHERE assessment_id = ?
            """,
            (status, notes, assessment_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return None
        row = conn.execute(
            "SELECT * FROM assessments WHERE assessment_id = ?", (assessment_id,)
        ).fetchone()
    if not row:
        return None
    d = dict(row)
    try:
        d["top_factors"] = json.loads(d.get("top_factors") or "[]")
    except Exception:
        d["top_factors"] = []
    return d


def get_admin_stats() -> Dict[str, Any]:
    """Compute institution-wide risk distribution, weekly check-in counts, and top factor frequencies."""
    init_db()
    with _connect() as conn:
        rows = conn.execute("SELECT risk_tier, top_factors, timestamp FROM assessments").fetchall()

    total = len(rows)
    by_tier = {"Low": 0, "Medium": 0, "High": 0}
    factor_counter = Counter()
    day_counter = Counter()

    for r in rows:
        tier = r["risk_tier"]
        if tier in by_tier:
            by_tier[tier] += 1
        try:
            factors = json.loads(r["top_factors"] or "[]")
            for f in factors:
                factor_counter[f] += 1
        except Exception:
            pass

        try:
            ts = r["timestamp"]
            day_str = ts[:10]  # YYYY-MM-DD
            day_counter[day_str] += 1
        except Exception:
            pass

    by_tier_percent = {
        k: round((v / total * 100.0), 1) if total > 0 else 0.0
        for k, v in by_tier.items()
    }

    top_factors_inst = [
        {"factor": factor, "count": count}
        for factor, count in factor_counter.most_common(10)
    ]

    # Generate last 7 days check-in timeline
    weekly_checkins = []
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for i in range(6, -1, -1):
        day_date = today - datetime.timedelta(days=i)
        d_str = day_date.strftime("%Y-%m-%d")
        d_label = day_date.strftime("%a")
        weekly_checkins.append({"day": d_label, "date": d_str, "checkins": day_counter.get(d_str, 0)})

    return {
        "total_students": total,
        "by_tier": by_tier,
        "by_tier_percent": by_tier_percent,
        "top_factors_institution_wide": top_factors_inst,
        "weekly_checkins": weekly_checkins,
    }


init_db()
