import os

import httpx
from fastapi import APIRouter, Query, HTTPException

from config import settings
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/transit", tags=["公交查询"])

AMAP_BASE_URL = "https://restapi.amap.com/v3/"
AMAP_KEY = settings.AMAP_API_KEY if hasattr(settings, "AMAP_API_KEY") else os.environ.get("AMAP_API_KEY", "")


async def _call_amap(endpoint: str, params: dict) -> dict:
    params["key"] = AMAP_KEY
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{AMAP_BASE_URL}{endpoint}", params=params)
        response.raise_for_status()
        return response.json()


@router.get("/nearby")
async def get_nearby_stations(
    longitude: float = Query(..., description="经度"),
    latitude: float = Query(..., description="纬度"),
    radius: int = Query(1000, ge=100, le=50000, description="搜索半径（米）"),
):
    if not AMAP_KEY:
        return error_response(500, "高德地图 API Key 未配置")
    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        return error_response(400, "无效的经纬度坐标")

    params = {
        "location": f"{longitude},{latitude}",
        "keywords": "公交站|地铁站",
        "radius": radius,
        "offset": 20,
        "page": 1,
        "types": "150300|150400|150500|150600|150700|150800",
    }
    try:
        data = await _call_amap("place/around", params)
        if data.get("status") != "1":
            return error_response(500, f"高德 API 错误: {data.get('info', '未知错误')}")

        pois = data.get("pois") or []
        stations = []
        for poi in pois:
            poi_type = poi.get("type", "")
            type_label = "地铁站" if "150300" in poi_type or "150400" in poi_type else "公交站"
            stations.append({
                "name": poi.get("name", "未知"),
                "type": type_label,
                "distance": poi.get("distance", "未知"),
                "address": poi.get("address", "暂无"),
                "location": poi.get("location", ""),
            })

        return success_response({
            "count": len(stations),
            "radius": radius,
            "center": f"{longitude},{latitude}",
            "stations": stations,
        })
    except httpx.HTTPError as e:
        return error_response(500, f"网络请求失败: {str(e)}")
    except Exception as e:
        return error_response(500, f"查询失败: {str(e)}")


@router.get("/arrival")
async def get_arrival_info(
    city: str = Query(..., description="城市名称"),
    station_name: str = Query(..., description="站点名称"),
):
    if not AMAP_KEY:
        return error_response(500, "高德地图 API Key 未配置")
    if not city or not station_name:
        return error_response(400, "城市名称和站点名称均不能为空")

    params = {"city": city, "station": station_name}
    try:
        data = await _call_amap("bus/station/real", params)
        if data.get("status") != "1":
            return error_response(500, f"高德 API 错误: {data.get('info', '未知错误')}")

        bus_info_list = data.get("businfo") or data.get("data") or []
        arrival_list = []

        for bus in bus_info_list:
            line_name = bus.get("name") or bus.get("distance") or "未知线路"
            if isinstance(line_name, dict):
                line_name = line_name.get("name", "未知线路")

            arrivals = bus.get("businfo") or bus.get("buses") or []
            for arrival in arrivals:
                arrival_list.append({
                    "line_name": str(line_name),
                    "destination": arrival.get("terminal") or arrival.get("destination", "未知方向"),
                    "distance": arrival.get("distance", "未知"),
                    "time": arrival.get("time", "未知"),
                    "station_count": arrival.get("station_count", "未知"),
                    "arrival_time": arrival.get("arrival_time", ""),
                })

        return success_response({
            "city": city,
            "station": station_name,
            "arrivals": arrival_list,
            "count": len(arrival_list),
        })
    except httpx.HTTPError as e:
        return error_response(500, f"网络请求失败: {str(e)}")
    except Exception as e:
        return error_response(500, f"查询失败: {str(e)}")


@router.get("/lines")
async def get_bus_lines(
    city: str = Query(..., description="城市名称"),
    line_name: str = Query(..., description="线路名称"),
):
    if not AMAP_KEY:
        return error_response(500, "高德地图 API Key 未配置")
    if not city or not line_name:
        return error_response(400, "城市名称和线路名称均不能为空")

    params = {"city": city, "s": line_name, "offset": 20, "page": 1, "extensions": "all"}
    try:
        data = await _call_amap("bus/linename", params)
        if data.get("status") != "1":
            return error_response(500, f"高德 API 错误: {data.get('info', '未知错误')}")

        buslines = data.get("buslines") or []
        result_lines = []
        for bus in buslines:
            stations = bus.get("busstops") or []
            result_lines.append({
                "name": bus.get("name", "未知"),
                "origin": bus.get("origin", "未知"),
                "terminal": bus.get("terminal", "未知"),
                "start_time": bus.get("start_time", "未知"),
                "end_time": bus.get("end_time", "未知"),
                "company": bus.get("company", "未知"),
                "distance": bus.get("distance", "未知"),
                "station_count": len(stations),
                "stations": [s.get("name", "?") for s in stations],
            })

        return success_response({
            "city": city,
            "query": line_name,
            "lines": result_lines,
            "count": len(result_lines),
        })
    except httpx.HTTPError as e:
        return error_response(500, f"网络请求失败: {str(e)}")
    except Exception as e:
        return error_response(500, f"查询失败: {str(e)}")


@router.get("/geocode")
async def geocode(
    address: str = Query(..., description="地址"),
    city: str = Query("", description="城市"),
):
    if not AMAP_KEY:
        return error_response(500, "高德地图 API Key 未配置")
    if not address:
        return error_response(400, "地址不能为空")

    params = {"address": address}
    if city:
        params["city"] = city

    try:
        data = await _call_amap("geocode/geo", params)
        if data.get("status") != "1":
            return error_response(500, f"高德 API 错误: {data.get('info', '未知错误')}")

        geocodes = data.get("geocodes") or []
        if not geocodes:
            return error_response(404, f"无法解析地址「{address}」")

        geo = geocodes[0]
        location = geo.get("location", "")
        lng, lat = (None, None)
        if location:
            parts = location.split(",")
            lng, lat = float(parts[0]), float(parts[1])

        return success_response({
            "address": address,
            "formatted_address": geo.get("formatted_address", address),
            "longitude": lng,
            "latitude": lat,
            "location": location,
        })
    except httpx.HTTPError as e:
        return error_response(500, f"网络请求失败: {str(e)}")
    except Exception as e:
        return error_response(500, f"查询失败: {str(e)}")
