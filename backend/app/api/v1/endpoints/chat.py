"""AI career advisor chat endpoint with session persistence."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlalchemy import select, desc

from app.core.deps import CurrentUser, DBSession
from app.models.models import ChatSession, Resume
from app.schemas.schemas import ChatRequest, ChatResponse
from app.ai.gemini_service import gemini_service

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(payload: ChatRequest, current_user: CurrentUser, db: DBSession):
    """Send a message to the AI career advisor. Maintains session history."""
    # Load or create session
    if payload.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == payload.session_id,
                ChatSession.user_id == current_user.id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found.")
    else:
        session = ChatSession(user_id=current_user.id, messages=[])
        db.add(session)
        await db.flush()

    # Build context from user's latest resume
    context = ""
    if current_user.target_role or current_user.target_industry:
        context = f"Target role: {current_user.target_role or 'Not specified'}. Industry: {current_user.target_industry or 'Not specified'}."

    # Append user message
    messages = list(session.messages)
    messages.append({"role": "user", "content": payload.message})

    # Get AI response
    ai_response = await gemini_service.career_chat(messages, context)

    # Append assistant response and persist (keep last 30 messages for context window)
    messages.append({"role": "assistant", "content": ai_response})
    session.messages = messages[-30:]

    await db.flush()

    return ChatResponse(
        session_id=session.id,
        response=ai_response,
        created_at=datetime.now(timezone.utc),
    )


@router.get("/sessions")
async def list_sessions(current_user: CurrentUser, db: DBSession):
    """List all chat sessions for the current user."""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(desc(ChatSession.updated_at))
        .limit(20)
    )
    sessions = result.scalars().all()
    return [
        {"id": str(s.id), "title": s.title, "message_count": len(s.messages),
         "updated_at": s.updated_at.isoformat()}
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
async def get_session(session_id: uuid.UUID, current_user: CurrentUser, db: DBSession):
    """Get full message history for a chat session."""
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id, ChatSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"id": str(session.id), "title": session.title, "messages": session.messages}
