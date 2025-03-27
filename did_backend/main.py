from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from web3 import Web3
import uuid
from pydantic import BaseModel

app = FastAPI()

# Cấu hình CORS để VueJS có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả nguồn, có thể thay đổi thành domain frontend
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả phương thức (GET, POST, OPTIONS, ...)
    allow_headers=["*"],
)

# Kết nối MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["did_management"]
collection = db["identities"]

# Kết nối Hyperledger Besu
w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))

# Định nghĩa dữ liệu đầu vào bằng Pydantic
class DIDRequest(BaseModel):
    name: str

@app.post("/register_did/")
def register_did(request: DIDRequest):
    did = f"did:besu:{uuid.uuid4()}"
    identity = {"did": did, "name": request.name}
    collection.insert_one(identity)
    return {"message": "DID created", "did": did}

@app.get("/get_did/{did}")
def get_did(did: str):
    identity = collection.find_one({"did": did}, {"_id": 0})
    if identity:
        return identity
    return {"error": "DID not found"}
