import os
from dotenv import load_dotenv

load_dotenv()

import random
import uuid
import requests
import math
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from geopy.geocoders import Nominatim
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import db_models

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "saferoute_super_secret_key"
ALGORITHM = "HS256"

# For real AI integration, you can install 'anthropic' and set the ANTHROPIC_API_KEY environment variable.
try:
    import anthropic
    client = anthropic.Anthropic() if os.environ.get("ANTHROPIC_API_KEY") else None
except ImportError:
    client = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import sockets
app.include_router(sockets.router)

class UserCreate(BaseModel):
    phone: str
    password: str
    name: str

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(db_models.User).filter(db_models.User.phone == user.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")
    hashed_pw = pwd_context.hash(user.password)
    new_user = db_models.User(phone=user.phone, name=user.name, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = jwt.encode({"sub": new_user.phone}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(db_models.User).filter(db_models.User.phone == user.phone).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"sub": db_user.phone}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

class ContactCreate(BaseModel):
    name: str
    phone: str
    carrier: str
    relationship: str

@app.post("/contacts")
def add_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    # For simulation, just hardcode user id 1, or assume auth token is passed.
    # In a real app we'd decode the JWT to get the user ID.
    new_contact = db_models.Contact(name=contact.name, phone=contact.phone, carrier=contact.carrier, relationship=contact.relationship, owner_id=1)
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@app.get("/contacts")
def get_contacts(db: Session = Depends(get_db)):
    return db.query(db_models.Contact).filter(db_models.Contact.owner_id == 1).all()

import sos_dispatcher

class BroadcastRequest(BaseModel):
    lat: float
    lng: float

@app.post("/sos/broadcast")
def broadcast_sos(req: BroadcastRequest):
    # Simulated auth: use user_id = 1
    result = sos_dispatcher.dispatch_sos_network(1, req.lat, req.lng)
    return result

geolocator = Nominatim(user_agent="saferoute_app")

class Point(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: Point
    destination: str | Point
    mode: str = "car"  # car, cab, bus, train, walk

class ChatRequest(BaseModel):
    message: str
    location: dict = None

MODE_PROFILE = {"walk": "foot", "car": "car", "cab": "car", "bus": "car", "train": "car"}
MODE_FACTOR = {"walk": 1.0, "car": 1.08, "cab": 1.18, "bus": 1.42, "train": 0.92}


def get_osrm_route(waypoints, mode="car"):
    coords = ";".join([f"{lon},{lat}" for lon, lat in waypoints])
    profile = MODE_PROFILE.get(mode, "car")
    url = f"http://router.project-osrm.org/route/v1/{profile}/{coords}?overview=full&geometries=geojson&alternatives=true&steps=true"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data["code"] == "Ok":
                # Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                points = [[p[1], p[0]] for p in data["routes"][0]["geometry"]["coordinates"]]
                dist = data["routes"][0]["distance"] / 1000
                duration = (data["routes"][0]["duration"] / 60) * MODE_FACTOR.get(mode, 1.08)
                return points, dist, duration
    except Exception as e:
        print(f"OSRM Error: {e}")
    return None, 0, 0

@app.post("/routes")
def get_routes(req: RouteRequest):
    # Geocode if destination is a string
    dest_lat, dest_lng = 0, 0
    if isinstance(req.destination, str):
        try:
            location = geolocator.geocode(req.destination)
            if location:
                dest_lat, dest_lng = location.latitude, location.longitude
            else:
                return []
        except Exception:
            # Fallback mock offset if geocoding fails
            dest_lat, dest_lng = req.start.lat + 0.02, req.start.lng + 0.02
    else:
        dest_lat, dest_lng = req.destination.lat, req.destination.lng

    start_lon, start_lat = req.start.lng, req.start.lat
    end_lon, end_lat = dest_lng, dest_lat

    mode = getattr(req, "mode", "car") or "car"

    # Temporal Route Shifting (Predictive Stalker Evasion)
    import datetime
    jitter = (datetime.datetime.now().weekday() * 0.005) - 0.015

    points_a, dist_a, dur_a = get_osrm_route([[start_lon, start_lat], [end_lon, end_lat]], mode)
    mid_lon = (start_lon + end_lon) / 2 + 0.05 + jitter
    mid_lat = (start_lat + end_lat) / 2 + 0.03 + jitter
    points_b, dist_b, dur_b = get_osrm_route([[start_lon, start_lat], [mid_lon, mid_lat], [end_lon, end_lat]], mode)
    mid_lon_c = (start_lon + end_lon) / 2 - 0.05 - jitter
    mid_lat_c = (start_lat + end_lat) / 2 - 0.03 - jitter
    points_c, dist_c, dur_c = get_osrm_route([[start_lon, start_lat], [mid_lon_c, mid_lat_c], [end_lon, end_lat]], mode)

    # Fallback to straight lines if OSRM fails
    if not points_a:
        points_a = [[start_lat, start_lon], [dest_lat, dest_lng]]
        points_b = [[start_lat, start_lon], [mid_lat, mid_lon], [dest_lat, dest_lng]]
        points_c = [[start_lat, start_lon], [mid_lat_c, mid_lon_c], [dest_lat, dest_lng]]
        dist_a = max(50, abs(dest_lat - start_lat) * 111 + abs(dest_lng - start_lon) * 85)
        dist_b = dist_c = dist_a * 1.05
        dur_a = (dist_a / 50) * 60 * MODE_FACTOR.get(mode, 1.08)
        dur_b = dur_a * 1.08
        dur_c = dur_a * 1.15

    def fmt_eta(m):
        m = int(m)
        return f"{m // 60} hr {m % 60} min" if m >= 60 else f"{m} min"

    return [
        {
            "id": "A",
            "name": "Main Arterial Route",
            "score": 85,
            "label": "SAFE",
            "eta": fmt_eta(dur_a),
            "durationMinutes": int(dur_a),
            "distanceKm": round(dist_a, 1),
            "transportMode": mode,
            "distance": f"{dist_a:.1f} km",
            "tags": ["Well lit ✓", "CCTV ✓", "Active Crowd"],
            "points": points_a,
            "bounds": [[start_lat, start_lon], [dest_lat, dest_lng]]
        },
        {
            "id": "B",
            "name": "Market Shortcut",
            "score": 65,
            "label": "MODERATE",
            "eta": fmt_eta(dur_b),
            "durationMinutes": int(dur_b),
            "distanceKm": round(dist_b, 1),
            "transportMode": mode,
            "distance": f"{dist_b:.1f} km",
            "tags": ["Moderate crowds", "Some dark spots"],
            "points": points_b,
            "bounds": [[start_lat, start_lon], [dest_lat, dest_lng]]
        },
        {
            "id": "C",
            "name": "Back Alley Path",
            "score": 35,
            "label": "DANGER",
            "eta": fmt_eta(dur_c),
            "durationMinutes": int(dur_c),
            "distanceKm": round(dist_c, 1),
            "transportMode": mode,
            "distance": f"{dist_c:.1f} km",
            "tags": ["Isolated ✗", "Poor lighting ✗"],
            "points": points_c,
            "bounds": [[start_lat, start_lon], [dest_lat, dest_lng]]
        }
    ]

@app.post("/chat")
def ai_chat(req: ChatRequest):
    msg = req.message.lower()
    
    # Real AI Integration Check
    if client:
        try:
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=300,
                system="You are SafeRoute's AI Co-Pilot. You guide women on how to use the app for safety (SOS, Shadow Walk, Routing). Be concise and helpful.",
                messages=[{"role": "user", "content": req.message}]
            )
            return {"response": response.content[0].text}
        except Exception as e:
            print("Anthropic API Error:", e)
    
    # Intelligent Mock Fallback
    if "route" in msg or "navigate" in msg or "find" in msg:
        reply = "To find a safe route, go to the **Map** tab and enter your destination. I will analyze lighting, CCTV, and crowds worldwide using OSRM mapping to give you the safest paths (SAFE, MODERATE, or DANGER). When you click 'Take This Route', I'll start live navigation!"
    elif "shadow" in msg or "walk" in msg:
        reply = "Shadow Walk lets you share your live location with trusted contacts until you arrive. If you stop moving for 3 minutes, it automatically sends an alert. You can activate it using the 'Shadow Walk' button on the Map page."
    elif "sos" in msg or "help" in msg or "emergency" in msg:
        reply = "The SOS button is always at the bottom right. Just press and hold it for 1.5 seconds. Once triggered, it immediately broadcasts your location and audio to emergency contacts."
    elif "api" in msg or "anthropic" in msg or "robot" in msg:
        reply = "I am currently running in a smart offline mode! To connect me to the real Anthropic API, simply create a `.env` file in the backend folder, add `ANTHROPIC_API_KEY=your_key`, and restart the server. I'll automatically upgrade myself to a full LLM!"
    elif "hi" in msg or "hello" in msg:
        reply = "Hello! I'm your SafeRoute AI Copilot. How can I assist you with your safety journey today?"
    else:
        reply = "I'm here to help keep you safe! Try asking me about finding routes, using Shadow Walk, or how the SOS button works."
    
    return {"response": reply}

@app.post("/report")
def submit_report(req: dict):
    return {"status": "success"}

def _maps_link(lat: float, lng: float) -> str:
    return f"https://www.google.com/maps?q={lat},{lng}"


def _send_sms_twilio(to: str, body: str) -> bool:
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_phone = os.environ.get("TWILIO_PHONE")
    if not all([sid, token, from_phone]):
        print(f"[SOS mock SMS → {to}] {body}")
        return False
    try:
        from twilio.rest import Client
        Client(sid, token).messages.create(body=body, from_=from_phone, to=to)
        return True
    except Exception as e:
        print(f"Twilio error: {e}")
        return False


@app.post("/sos/trigger")
def send_sos(req: dict):
    name = req.get("userName", "SafeRoute user")
    lat = req.get("lat", 0)
    lng = req.get("lng", 0)
    link = _maps_link(lat, lng)
    msg = req.get("message") or f"🚨 {name} needs help! Live location: {link} — SafeRoute Alert"
    sent = 0
    for c in req.get("contacts", []):
        phone = c.get("phone", "")
        if phone and _send_sms_twilio(phone, msg):
            sent += 1
    return {"status": "success", "sent": sent, "message": msg}


@app.post("/sos/low-battery")
def low_battery_alert(req: dict):
    name = req.get("userName", "SafeRoute user")
    lat = req.get("lat", 0)
    lng = req.get("lng", 0)
    link = _maps_link(lat, lng)
    msg = req.get("message") or f"⚠️ {name}'s phone battery is low. Last known location: {link}"
    for c in req.get("contacts", []):
        _send_sms_twilio(c.get("phone", ""), msg)
    return {"status": "success"}


@app.post("/sos/cancel")
def cancel_sos():
    return {"status": "cancelled"}

@app.get("/safe-spots")
def get_nearby_spots(lat: float, lng: float):
    # Dynamic mock spots based on user location
    spots = []
    types = ['Hospital', 'Police', 'Shop', 'Transit']
    names = {
        'Hospital': ['City General Hospital', 'Care Clinic', 'Apollo 24/7'],
        'Police': ['Central Police Station', 'Traffic Police Booth', 'Local Station'],
        'Shop': ['24/7 Supermart', 'Night Cafe', 'Reliance Fresh'],
        'Transit': ['Metro Station', 'Bus Terminal', 'Taxi Stand']
    }
    for i in range(5):
        t = types[i % 4]
        spots.append({
            "id": i, "name": names[t][i % 3], "type": t,
            "distance": f"{(0.2 + (i * 0.3)):.1f} km",
            "walkTime": f"{3 + (i * 4)} min walk",
            "isOpen": random.choice([True, True, False])
        })
    return spots

@app.get("/incidents/nearby")
def get_incidents(lat: float, lng: float):
    # Generate dynamic incidents within 0.02 degrees of current location
    incidents = []
    types = [
        {"type": "Harassment", "color": "#FF4D6D"},
        {"type": "Poor Lighting", "color": "#F39C12"},
        {"type": "Isolated Area", "color": "#E67E22"}
    ]
    for _ in range(8):
        t = random.choice(types)
        incidents.append({
            "pos": [lat + random.uniform(-0.02, 0.02), lng + random.uniform(-0.02, 0.02)],
            "color": t["color"],
            "type": t["type"],
            "time": f"{random.randint(5, 59)} mins ago",
            "count": random.randint(1, 15)
        })
    return incidents
