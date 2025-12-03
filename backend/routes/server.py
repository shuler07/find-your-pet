from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


@router.get("/server/stats")
async def get_server_stats():
    return {
        "success": True,
        "stats": {
            "animalsBack": 0,
            "activeAds": 0,
            "communityMembers": 0,
            "successRate": 0,
        },
    }
