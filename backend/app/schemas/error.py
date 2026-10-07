from pydantic import BaseModel, Field


class ErrorBody(BaseModel):
    code: str = Field(description="Machine-readable error code")
    message: str = Field(description="Human-readable summary")
    detail: str | None = Field(default=None, description="Optional context")


class ErrorResponse(BaseModel):
    """Uniform error envelope returned by every endpoint."""

    error: ErrorBody