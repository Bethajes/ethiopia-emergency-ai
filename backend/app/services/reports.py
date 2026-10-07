from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.db.geo import point_geography
from app.models.emergency_report import EmergencyReport
from app.models.enums import ReportSource, ReportType
from app.schemas.emergency_report import EmergencyReportCreate


class EmergencyReportService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(
        self,
        *,
        event_id: int | None = None,
        source: ReportSource | None = None,
        report_type: ReportType | None = None,
        verified: bool | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[EmergencyReport]:
        stmt: Select[tuple[EmergencyReport]] = select(EmergencyReport)
        if event_id is not None:
            stmt = stmt.where(EmergencyReport.event_id == event_id)
        if source is not None:
            stmt = stmt.where(EmergencyReport.source == source.value)
        if report_type is not None:
            stmt = stmt.where(EmergencyReport.report_type == report_type.value)
        if verified is not None:
            stmt = stmt.where(EmergencyReport.verified.is_(verified))

        stmt = (
            stmt.order_by(EmergencyReport.created_at.desc(), EmergencyReport.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt).all())

    def get(self, report_id: int) -> EmergencyReport | None:
        return self._session.get(EmergencyReport, report_id)

    def create(self, payload: EmergencyReportCreate) -> EmergencyReport:
        report = EmergencyReport(
            **payload.model_dump(mode="json", exclude={"latitude", "longitude"}),
            location=point_geography(payload.latitude, payload.longitude),
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        self._session.add(report)
        self._session.commit()
        self._session.refresh(report)
        return report