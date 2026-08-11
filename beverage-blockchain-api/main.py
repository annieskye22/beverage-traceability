from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import json
import datetime
import urllib.parse
from py_near.account import Account
from py_near.dapps.core import NEAR

# ---------------------------------------------------------
# 1. FIREBASE INITIALIZATION
# ---------------------------------------------------------
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="Supply Chain Traceability API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 2. DATA STRUCTURE
# ---------------------------------------------------------
class OrderPayload(BaseModel):
    batchId: str
    blendName: str
    producedBy: str
    ingredients: list[str]

# ---------------------------------------------------------
# 3. NEAR MAINNET CREDENTIALS
# ---------------------------------------------------------
NEAR_ACCOUNT_ID = "testtracebility.near" 
NEAR_PRIVATE_KEY = "kardmjheLfEXtvmQNGThEkJH7L1iZza3tv4QPspusmcWZqFvJSE5VaSpoKjXm1tGQjjaaRmybYzqA1cgzga9ocH"

# ---------------------------------------------------------
# 4. THE LIVE ON-CHAIN MINTING & DATA EMBEDDING ENDPOINT
# ---------------------------------------------------------
@app.post("/api/mint-batch")
async def mint_to_mainnet(order: OrderPayload):
    try:
        # Step A: Format the comprehensive JSON record containing all order data
        blockchain_record = {
            "batch_id": order.batchId,
            "product": order.blendName,
            "producer": order.producedBy,
            "ingredients": order.ingredients,
            "timestamp": str(datetime.datetime.utcnow()),
            "status": "Verified Mainnet Supply Chain Record"
        }
        json_payload = json.dumps(blockchain_record)
        
        # Step B: Connect to the NEAR Mainnet via py-near
        account = Account(
            account_id=NEAR_ACCOUNT_ID, 
            private_key=NEAR_PRIVATE_KEY,
            rpc_addr="https://rpc.mainnet.near.org"
        )
        await account.startup()
        
        # Step C: Execute a Live Smart Contract Call on NEAR Mainnet (`social.near`)
        # This embeds the complete JSON payload directly into the transaction's arguments on-chain.
        # A small storage deposit (0.05 NEAR) is attached to store the data permanently.
        tr = await account.function_call(
            contract_id="social.near",
            method_name="set",
            args={
                "data": {
                    NEAR_ACCOUNT_ID: {
                        "mixit_supply_chain": {
                            order.batchId: json_payload
                        }
                    }
                }
            },
            gas=300000000000000,
            amount=NEAR // 10  # 0.1 NEAR storage deposit
        )
        tx_hash = tr.transaction.hash

        # Step D: Generate Dynamic Trace URL and QR Code Mapping
        frontend_domain = "https://beverage-traceability-kb8r-one.vercel.app"
        trace_link = f"{frontend_domain}/trace?batchId={order.batchId}"
        
        encoded_trace_link = urllib.parse.quote(trace_link, safe="")
        qr_code_api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encoded_trace_link}"

        # Step E: Update Firebase Firestore (Orders & Products)
        orders_ref = db.collection('orders')
        query = orders_ref.where('batchId', '==', order.batchId).stream()
        
        doc_updated = False
        for doc_item in query:
            db.collection('orders').document(doc_item.id).update({
                "nearHash": tx_hash,
                "chainHash": tx_hash,
                "isMintedOnChain": True,
                "blockchainRecord": json_payload,
                "traceUrl": trace_link,
                "qrCodeUrl": qr_code_api_url
            })
            doc_updated = True

        products_ref = db.collection('products')
        prod_query = products_ref.where('batchId', '==', order.batchId).stream()
        for doc_item in prod_query:
            db.collection('products').document(doc_item.id).update({
                "chainTxHash": tx_hash,
                "traceUrl": trace_link,
                "qrCodeUrl": qr_code_api_url
            })
            doc_updated = True

        if not doc_updated:
            raise HTTPException(
                status_code=404, 
                detail=f"Order or Batch with ID {order.batchId} not found in Firebase."
            )

        # Step F: Return success response
        return {
            "status": "success",
            "nearHash": tx_hash,
            "chainHash": tx_hash,
            "traceUrl": trace_link,
            "qrCodeUrl": qr_code_api_url,
            "message": "Complete order data successfully embedded and broadcasted to NEAR Mainnet!"
        }

    except Exception as e:
        print(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))