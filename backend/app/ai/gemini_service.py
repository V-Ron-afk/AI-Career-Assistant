"""
Gemini AI Integration Layer
Uses the new google-genai SDK (v1.x) which supports current models correctly.
"""

import asyncio
import json
import re
from typing import Any

from app.core.config import settings


class GeminiAIService:

    def __init__(self):
        self._api_key = settings.GEMINI_API_KEY

    def _get_client(self):
        if not self._api_key:
            raise ValueError("GEMINI_API_KEY is not set. Add it to your .env file.")
        from google import genai
        client = genai.Client(api_key=self._api_key)
        return client

    def _parse_response(self, response_text: str) -> dict:
        try:
            cleaned = re.sub(r"```json\s*|\s*```", "", response_text).strip()
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ValueError(f"AI returned invalid JSON: {e}\nRaw: {response_text[:300]}")

    def _generate(self, prompt: str) -> dict:
        from google import genai
        from google.genai import types
        client = self._get_client()
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        return self._parse_response(response.text)

    def _generate_text(self, prompt: str) -> str:
        from google import genai
        from google.genai import types
        client = self._get_client()
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.7),
        )
        return response.text

    async def analyze_resume(self, resume_text: str) -> dict[str, Any]:
        prompt = f"""You are a senior technical recruiter and ATS expert.
Analyze this resume and return ONLY a valid JSON object with no extra text.

RESUME:
{resume_text}

Return exactly this JSON structure:
{{
  "ats_score": 75,
  "overall_score": 70,
  "executive_summary": "Brief 2-3 sentence assessment of the resume.",
  "scores": {{
    "contact_info": 8,
    "work_experience": 7,
    "skills": 6,
    "education": 8,
    "formatting": 5,
    "keywords": 6,
    "quantified_achievements": 4,
    "readability": 7
  }},
  "strengths": [{{"title": "Strength title", "detail": "Specific example from resume"}}],
  "critical_issues": [{{
    "severity": "high",
    "issue": "Specific problem found",
    "location": "Section name",
    "fix": "Exact actionable fix"
  }}],
  "missing_elements": ["element1", "element2"],
  "keyword_analysis": {{
    "present": ["keyword1", "keyword2"],
    "missing_common": ["keyword3", "keyword4"],
    "overused": ["keyword5"]
  }},
  "section_feedback": {{
    "summary": "Feedback on summary section",
    "experience": "Feedback on experience",
    "skills": "Feedback on skills",
    "education": "Feedback on education",
    "projects": "Feedback on projects"
  }},
  "rewritten_summary": "Improved professional summary with strong action verbs and metrics.",
  "top_3_priority_fixes": ["Fix 1", "Fix 2", "Fix 3"]
}}

Fill in all fields with real analysis based on the actual resume content above."""
        return await asyncio.to_thread(self._generate, prompt)

    async def match_job(self, resume_text: str, job_description: str) -> dict[str, Any]:
        prompt = f"""You are an ATS expert. Compare this resume to the job description.
Return ONLY a valid JSON object with no extra text.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return exactly this JSON structure filled with real analysis:
{{
  "match_score": 65,
  "verdict": "good_match",
  "verdict_reason": "Two sentence explanation of the match.",
  "matched_skills": [{{"skill": "Python", "resume_evidence": "Where it appears", "jd_requirement": "Required skill"}}],
  "missing_skills": [{{"skill": "Kubernetes", "importance": "must_have", "how_to_address": "How to address this gap"}}],
  "keyword_gaps": ["keyword1", "keyword2"],
  "experience_gap": {{"required_years": 3, "candidate_years": 2, "gap": "Assessment of gap"}},
  "tailoring_suggestions": [{{"section": "Experience", "current": "Current text", "suggested": "Improved version"}}],
  "cover_letter_hooks": ["Hook 1", "Hook 2"],
  "interview_likelihood": "medium",
  "interview_likelihood_reason": "Reason for likelihood assessment"
}}"""
        return await asyncio.to_thread(self._generate, prompt)

    async def rewrite_resume(self, resume_text: str, target_role: str, target_industry: str) -> dict[str, Any]:
        prompt = f"""You are an elite resume writer. Rewrite this resume for {target_role} in {target_industry}.
Use XYZ formula bullets with action verbs and metrics. Return ONLY valid JSON.

RESUME:
{resume_text}

Return exactly this JSON structure:
{{
  "rewritten_sections": {{
    "professional_summary": "Powerful 3-4 line summary targeting the role",
    "experience": [{{
      "company": "Company Name",
      "role": "Job Title",
      "dates": "2022 - Present",
      "bullets": ["Accomplished X by doing Y resulting in Z% improvement"]
    }}],
    "skills": {{"technical": ["skill1"], "soft": ["skill2"], "tools": ["tool1"]}},
    "projects": [{{"name": "Project", "description": "Impact-focused description", "tech_stack": ["tech1"]}}]
  }},
  "changes_made": ["Change 1 and why it helps"],
  "keywords_added": ["keyword1", "keyword2"],
  "estimated_ats_improvement": "20-30%",
  "formatting_recommendations": ["Recommendation 1"]
}}"""
        return await asyncio.to_thread(self._generate, prompt)

    async def review_portfolio(self, github_url: str | None, project_description: str | None) -> dict[str, Any]:
        context = github_url or project_description or "No input provided"
        prompt = f"""You are a senior engineering hiring manager reviewing a developer portfolio.
Return ONLY valid JSON with no extra text.

PORTFOLIO INPUT:
{context}

Return exactly this JSON structure:
{{
  "overall_score": 65,
  "technical_depth_score": 6,
  "market_relevance_score": 7,
  "code_quality_indicators": 6,
  "project_complexity_score": 5,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "project_analysis": [{{
    "name": "Project Name",
    "complexity": "intermediate",
    "tech_stack_assessment": "Assessment of tech choices",
    "real_world_usefulness": "medium",
    "standout_features": ["Feature 1"],
    "missing_elements": ["Missing 1"],
    "suggested_improvements": ["Improvement 1"]
  }}],
  "recommended_new_projects": [{{
    "title": "Project Title",
    "description": "What to build",
    "tech_stack": ["React", "Node.js"],
    "why_impactful": "Why employers will be impressed",
    "difficulty": "intermediate",
    "estimated_weeks": 4
  }}],
  "github_profile_tips": ["Tip 1", "Tip 2"],
  "hiring_manager_impression": "Honest first impression of the portfolio",
  "top_priorities": ["Priority 1", "Priority 2", "Priority 3"]
}}"""
        return await asyncio.to_thread(self._generate, prompt)

    async def generate_interview_prep(self, resume_text: str) -> dict[str, Any]:
        prompt = f"""You are a technical interviewer. Generate personalized interview questions from this resume.
Return ONLY valid JSON with no extra text.

RESUME:
{resume_text}

Return exactly this JSON structure:
{{
  "technical_questions": [{{
    "question": "Specific technical question based on resume",
    "difficulty": "medium",
    "topic": "Topic area",
    "what_interviewer_is_testing": "What skill is being evaluated",
    "ideal_answer_hints": ["Key point to cover"],
    "follow_up": "Likely follow-up question"
  }}],
  "behavioral_questions": [{{
    "question": "Tell me about a time when...",
    "competency": "leadership",
    "why_asked": "What this reveals about candidate",
    "ideal_structure": "STAR method: Situation, Task, Action, Result"
  }}],
  "project_deep_dive_questions": [{{
    "project": "Project name from resume",
    "questions": ["Deep dive question about this project"],
    "red_flags_to_avoid": ["Weak answer to avoid"]
  }}],
  "situational_questions": [{{
    "scenario": "Realistic work scenario",
    "question": "What would you do if...",
    "what_good_looks_like": "Criteria for a strong answer"
  }}],
  "questions_to_ask_interviewer": [{{
    "question": "Smart question to ask interviewer",
    "why_impressive": "Why this signals a strong candidate"
  }}],
  "preparation_roadmap": [{{"day": 1, "focus": "What to study", "resources": ["Resource name"]}}]
}}"""
        return await asyncio.to_thread(self._generate, prompt)

    async def career_chat(self, messages: list[dict], context: str = "") -> str:
        system = f"You are an elite career coach. Be direct, specific, and actionable. Max 300 words.\n{f'User context: {context}' if context else ''}"
        history = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages[:-1]])
        latest = messages[-1]["content"] if messages else ""
        prompt = f"{system}\n\nCONVERSATION HISTORY:\n{history}\n\nUSER: {latest}\n\nRESPONSE:"
        return await asyncio.to_thread(self._generate_text, prompt)


gemini_service = GeminiAIService()