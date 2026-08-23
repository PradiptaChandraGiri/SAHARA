"""SQLite persistence layer for SAHARA assessments.

Schema:
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
"""
from __future__ import annotations

import hashlib
import json
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


def init_db() -> None:
    """Initialize database tables and indexes."""
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
        conn.commit()


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
    """Compute institution-wide risk distribution and top factor frequencies."""
    init_db()
    with _connect() as conn:
        rows = conn.execute("SELECT risk_tier, top_factors FROM assessments").fetchall()

    total = len(rows)
    by_tier = {"Low": 0, "Medium": 0, "High": 0}
    factor_counter = Counter()

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

    by_tier_percent = {
        k: round((v / total * 100.0), 1) if total > 0 else 0.0
        for k, v in by_tier.items()
    }

    top_factors_inst = [
        {"factor": factor, "count": count}
        for factor, count in factor_counter.most_common(10)
    ]

    return {
        "total_students": total,
        "by_tier": by_tier,
        "by_tier_percent": by_tier_percent,
        "top_factors_institution_wide": top_factors_inst,
    }


init_db()
