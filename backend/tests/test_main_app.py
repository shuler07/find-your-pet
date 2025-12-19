from fastapi import FastAPI


def test_main_app_import_and_routes_exist():
    import main

    assert isinstance(main.app, FastAPI)

    paths = {r.path for r in main.app.routes}

    assert "/register" in paths
    assert "/login" in paths
    assert "/ads" in paths
    assert "/server/stats" in paths
