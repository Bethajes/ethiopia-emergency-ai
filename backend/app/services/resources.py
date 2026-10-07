from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.db.geo import point_geography
from app.models.enums import ResourceStatus, ResourceType
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate


class ResourceService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(
        self,
        *,
        resource_type: ResourceType | None = None,
        status: ResourceStatus | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Resource]:
        stmt: Select[tuple[Resource]] = select(Resource)
        if resource_type is not None:
            stmt = stmt.where(Resource.resource_type == resource_type.value)
        if status is not None:
            stmt = stmt.where(Resource.status == status.value)

        stmt = (
            stmt.order_by(Resource.created_at.desc(), Resource.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt).all())

    def create(self, payload: ResourceCreate) -> Resource:
        resource = Resource(
            **payload.model_dump(mode="json", exclude={"latitude", "longitude"}),
            location=point_geography(payload.latitude, payload.longitude),
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        self._session.add(resource)
        self._session.commit()
        self._session.refresh(resource)
        return resource