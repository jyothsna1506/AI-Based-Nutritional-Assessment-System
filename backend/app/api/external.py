from fastapi import APIRouter, HTTPException, Depends
from backend.app.services.openfoodfacts import get_product_by_barcode
from backend.app.api.auth import get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/external", tags=["external"])

@router.get("/scan/{barcode}")
async def scan_barcode(barcode: str, current_user: User = Depends(get_current_user)):
    """
    Look up a product in the Open Food Facts database by barcode.
    """
    product = get_product_by_barcode(barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found in database.")
    
    return product
