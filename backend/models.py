from pydantic import BaseModel
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: Coordinates
    destination: Coordinates

class Report(BaseModel):
    lat: float
    lng: float
    category: str
    severity: str
    description: Optional[str] = None
    voice_note_url: Optional[str] = None

class SOSRequest(BaseModel):
    lat: float
    lng: float

class CrowdConfirmRequest(BaseModel):
    zone_id: str

class ShadowWalkStartRequest(BaseModel):
    contacts: List[str]
    destination: str

class ShadowWalkUpdateRequest(BaseModel):
    session_id: str
    lat: float
    lng: float

class ShadowWalkEndRequest(BaseModel):
    session_id: str

class AICopilotRequest(BaseModel):
    message: str
    context: Optional[dict] = None
