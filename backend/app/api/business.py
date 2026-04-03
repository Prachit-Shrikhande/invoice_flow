import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileResponse

router = APIRouter(prefix="/api/business", tags=["Business Profile"])


def save_upload(file: UploadFile, subfolder: str) -> str:
    """Save uploaded file and return relative path."""
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    folder = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)

    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)

    return filepath


@router.get("", response_model=BusinessProfileResponse)
def get_business_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")

    return profile


@router.post("", response_model=BusinessProfileResponse, status_code=201)
def create_business_profile(
    data: BusinessProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Business profile already exists")

    profile = BusinessProfile(user_id=current_user.id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("", response_model=BusinessProfileResponse)
def update_business_profile(
    data: BusinessProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/upload-logo")
def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Create business profile first")

    filepath = save_upload(file, "logos")
    profile.logo_path = filepath
    db.commit()
    return {"logo_path": filepath}


@router.post("/upload-signature")
def upload_signature(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Create business profile first")

    filepath = save_upload(file, "signatures")
    profile.signature_path = filepath
    db.commit()
    return {"signature_path": filepath}
