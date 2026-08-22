"""Adapter boundary for the existing ML logic.

IMPORTANT: Replace the import inside assess_student() with the actual existing
function from phase2_merged_final.py/main.py once those project files are added.
No ML logic is duplicated here.
"""
from __future__ import annotations

from typing import Any


def assess_student(student_data: dict[str, Any]):
    """Call the project's existing assessment function.

    This deliberately fails loudly until the real project function is wired,
    rather than inventing a second ML implementation.
    """
    try:
        from phase2_merged_final import assess_student as existing_assess_student
    except ImportError as exc:
        raise RuntimeError(
            "Add the existing phase2_merged_final.py and expose assess_student() "
            "before enabling the WhatsApp webhook."
        ) from exc

    return existing_assess_student(student_data)
