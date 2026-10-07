from typing import Annotated

from pydantic import Field

Latitude = Annotated[float, Field(ge=-90, le=90)]
Longitude = Annotated[float, Field(ge=-180, le=180)]
Confidence = Annotated[float, Field(ge=0.0, le=1.0)]