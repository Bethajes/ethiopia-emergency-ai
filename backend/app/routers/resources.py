from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import ResourceStatus, ResourceType
from app.schemas.resource import ResourceRead
from app.services.resources import ResourceService

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get(
    "",
    response_model=list[ResourceRead],
    summary="List response resources",
)
def list_resources(
    resource_type: ResourceType | None = Query(default=None),
    status_filter: ResourceStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_db),
) -> list[ResourceRead]:
    service = ResourceService(session)
    return service.list(
        resource_type=resource_type,
        status=status_filter,
        limit=limit,
        offset=offset,
    )