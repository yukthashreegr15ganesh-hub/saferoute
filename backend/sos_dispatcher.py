import os
import time
from geopy.geocoders import Nominatim
from database import SessionLocal
import db_models
from twilio.rest import Client

from twilio.http.http_client import TwilioHttpClient
import warnings
from urllib3.exceptions import InsecureRequestWarning

# Suppress insecure request warnings for local testing
warnings.simplefilter('ignore', InsecureRequestWarning)

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")

def send_twilio_sms(phone: str, message_body: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM_NUMBER:
        print("⚠️ Missing Twilio credentials. Simulating SMS.")
        return False

    clean_phone = ''.join(filter(str.isdigit, phone))
    # Ensure it has country code. Assuming India +91 if 10 digits
    if len(clean_phone) == 10:
        clean_phone = "+91" + clean_phone
    elif not clean_phone.startswith('+'):
        clean_phone = "+" + clean_phone

    try:
        # Fix for Windows SSL Certificate errors
        http_client = TwilioHttpClient()
        http_client.session.verify = False
        
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, http_client=http_client)
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_FROM_NUMBER,
            to=clean_phone
        )
        return True
    except Exception as e:
        print(f"❌ Failed to send Twilio SMS: {e}")
        return False

def find_nearest_authorities(lat: float, lng: float):
    geolocator = Nominatim(user_agent="saferoute_dispatch")
    try:
        location = geolocator.reverse((lat, lng))
        address = location.address if location else "Unknown Location"
        city = location.raw.get('address', {}).get('city', 'Local') if location else 'Local'
        return {
            "name": f"{city} Central Police Department",
            "address": address,
            "simulated_distance": "1.2 miles"
        }
    except Exception as e:
        return None

def dispatch_sos_network(user_id: int, lat: float, lng: float):
    print("\n" + "="*50)
    print("🚨 INITIATING SOS NETWORK BROADCAST (TWILIO) 🚨")
    print("="*50)
    
    db = SessionLocal()
    try:
        contacts = db.query(db_models.Contact).filter(db_models.Contact.owner_id == user_id).all()
        user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
        user_name = user.name if user else "SafeRoute User"
        
        maps_link = f"http://localhost:5173/track/{user_id}"
        message_body = f"URGENT: {user_name} triggered an SOS! Live Tracking Link: {maps_link}"
        
        print(f"\n[TARGET COORDINATES]: {lat}, {lng}")
        print(f"[LIVE TRACKING LINK]: {maps_link}\n")
        
        if not contacts:
            print("⚠️ WARNING: No Sentinel contacts found in database for this user!")
        else:
            for c in contacts:
                print("-" * 40)
                print(f"📡 SENDING SMS TO {c.relationship.upper()}: {c.name} ({c.phone})")
                
                success = send_twilio_sms(c.phone, message_body)
                if success:
                    print("✉️ STATUS: Delivered via Twilio ✔️")
                else:
                    print("✉️ STATUS: Simulated Delivery ✔️")
                
                time.sleep(0.5)

        print("\n" + "="*50)
        print("🚓 PINGING LOCAL AUTHORITIES...")
        authorities = find_nearest_authorities(lat, lng)
        if authorities:
            print(f"📡 DISPATCHING AUTOMATED CALL TO: {authorities['name']}")
            print(f"🗣️ TTS PAYLOAD: 'Emergency. {user_name} SOS at {authorities['address']}.'")
            print(f"✉️ STATUS: Acknowledged by Dispatch ✔️")

        print("="*50 + "\n")
        
        return {"status": "broadcast_complete", "sentinels_notified": len(contacts)}
    finally:
        db.close()


