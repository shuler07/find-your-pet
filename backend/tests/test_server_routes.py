import pytest

from routes import server as server_routes


@pytest.mark.asyncio
async def test_server_stats_shape():
    data = await server_routes.get_server_stats()
    assert data["success"] is True
    assert set(data["stats"].keys()) == {
        "animalsBack",
        "activeAds",
        "communityMembers",
        "successRate",
    }
