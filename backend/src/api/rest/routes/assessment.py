from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from src.api.rest.dependencies import get_current_recruiter, get_db
from src.config.settings import settings
from src.data.models.assessment import Assessment
from src.schemas.assessment_schema import AssessmentCreate, AssessmentResponse,AssessmentUpdate
from src.core.services.assessment_service import AssessmentService
from src.data.models.recruiter import Recruiter

router = APIRouter(prefix="/assessment", tags=["auth"])

@router.post("/")
async def create_new_assessment(
    payload: AssessmentCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: Recruiter = Depends(get_current_recruiter) 
):
    service = AssessmentService(db)
    return await service.create_assessment(org_id=current_user.org_id, data=payload.dict())

@router.patch("/{assessment_id}/toggle")
async def toggle_assessment(
    assessment_id: uuid.UUID,
    is_active: bool,
    db: AsyncSession = Depends(get_db)
):
    service = AssessmentService(db)
    return await service.toggle_status(assessment_id, is_active)

@router.get("/org-assessments", response_model=list[AssessmentResponse])
async def get_org_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: Recruiter = Depends(get_current_recruiter)
):
    query = select(Assessment).where(Assessment.org_id == current_user.org_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.put("/{assessment_id}")
async def update_assessment(
    assessment_id: uuid.UUID,
    payload: AssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Recruiter = Depends(get_current_recruiter)
):
    service = AssessmentService(db)
    assessment = await service.repo.get_by_id(assessment_id)
    
    if not assessment or assessment.org_id != current_user.org_id:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    update_data = {k: v for k, v in payload.dict(exclude_unset=True).items()}
    return await service.repo.update(assessment_id, **update_data)