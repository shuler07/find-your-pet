from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class ServerStats(BaseModel):
    animalsBack: int
    activeAds: int
    communityMembers: int
    successRate: int


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
<<<<<<< HEAD
=======

>>>>>>> development_backend_feat_report
