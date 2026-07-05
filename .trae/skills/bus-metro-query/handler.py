import os
import asyncio
from typing import Optional, Dict, Any, List, Tuple

import httpx

AMAP_BASE_URL = "https://restapi.amap.com/v3/"


def get_config() -> Dict[str, Any]:
    api_key = os.environ.get("AMAP_API_KEY", "")
    if not api_key:
        api_key = ""
    return {"amap_api_key": api_key}


AMAP_CONFIG = get_config()
AMAP_KEY = AMAP_CONFIG.get("amap_api_key", "")


async def _call_amap_api(endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{AMAP_BASE_URL}{endpoint}"
    params["key"] = AMAP_KEY
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def _require_key() -> None:
    if not AMAP_KEY:
        raise ValueError("高德地图 API Key 未配置，请在环境变量中设置 AMAP_API_KEY")


async def search_nearby_stations(
    longitude: float,
    latitude: float,
    radius: int = 1000,
    page: int = 1,
    offset: int = 20,
) -> str:
    _require_key()
    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        return "❌ 无效的经纬度坐标，请检查后重试"
    if radius < 100 or radius > 50000:
        return "❌ 搜索半径需在 100-50000 米之间"

    location = f"{longitude},{latitude}"
    params = {
        "location": location,
        "keywords": "公交站|地铁站",
        "radius": radius,
        "offset": offset,
        "page": page,
        "types": "150300|150400|150500|150600|150700|150800",
    }
    try:
        data = await _call_amap_api("place/around", params)
        if data.get("status") != "1":
            return f"❌ 高德 API 返回错误: {data.get('info', '未知错误')}"
        return _format_nearby_stations(data, longitude, latitude, radius)
    except httpx.HTTPError as e:
        return f"❌ 网络请求失败: {str(e)}"
    except Exception as e:
        return f"❌ 查询失败: {str(e)}"


def _format_nearby_stations(
    data: Dict[str, Any],
    longitude: float,
    latitude: float,
    radius: int,
) -> str:
    pois = data.get("pois") or []
    if not pois:
        return f"📍 坐标 ({longitude}, {latitude}) 周边 {radius} 米内未找到公交/地铁站点"

    count = data.get("count", "0")
    lines = [
        f"🚌🚇 周边公交/地铁站点查询结果",
        f"━━━━━━━━━━━━━━━━━━━━━━━━",
        f"📍 当前位置: ({longitude}, {latitude})",
        f"🔍 搜索范围: {radius} 米 | 找到 {count} 个站点",
        f"",
    ]

    for i, poi in enumerate(pois, 1):
        name = poi.get("name", "未知")
        distance = poi.get("distance", "未知")
        address = poi.get("address", "暂无地址")
        poi_type = poi.get("type", "")
        type_label = _get_poi_type_label(poi_type)
        lines.append(f"{i}. {type_label} {name}")
        lines.append(f"   📍 距离: {distance} 米 | 地址: {address}")
        lines.append("")

    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━")
    return "\n".join(lines)


def _get_poi_type_label(poi_type: str) -> str:
    type_map = {
        "150300": "🚇",
        "150400": "🚇",
        "150500": "🚌",
        "150600": "🚌",
        "150700": "🚌",
        "150800": "🚌",
    }
    for type_code, label in type_map.items():
        if type_code in poi_type:
            return label
    return "🚏"


async def search_bus_lines(
    city: str,
    line_name: str,
    offset: int = 20,
    page: int = 1,
) -> str:
    _require_key()
    if not city or not line_name:
        return "❌ 城市名称和线路名称均不能为空"

    params = {
        "city": city,
        "s": line_name,
        "offset": offset,
        "page": page,
        "extensions": "all",
    }
    try:
        data = await _call_amap_api("bus/linename", params)
        if data.get("status") != "1":
            return f"❌ 高德 API 返回错误: {data.get('info', '未知错误')}"
        return _format_bus_lines(data, city, line_name)
    except httpx.HTTPError as e:
        return f"❌ 网络请求失败: {str(e)}"
    except Exception as e:
        return f"❌ 查询失败: {str(e)}"


def _format_bus_lines(
    data: Dict[str, Any],
    city: str,
    line_name: str,
) -> str:
    lines = data.get("buslines") or []
    if not lines:
        return f"🚌 在 {city} 未找到与「{line_name}」相关的公交/地铁线路"

    lines_list = [
        f"🚌🚇 公交/地铁线路查询结果",
        f"━━━━━━━━━━━━━━━━━━━━━━━━",
        f"🏙️  城市: {city} | 搜索: 「{line_name}」",
        f"📋 共找到 {len(lines)} 条线路",
        f"",
    ]

    for bus in lines[:5]:
        name = bus.get("name", "未知线路")
        origin = bus.get("origin", "未知")
        terminal = bus.get("terminal", "未知")
        start_time = bus.get("start_time", "未知")
        end_time = bus.get("end_time", "未知")
        company = bus.get("company", "未知")
        distance = bus.get("distance", "未知")
        stations = bus.get("busstops") or []
        station_names = [s.get("name", "?") for s in stations]

        lines_list.append(f"🔹 {name}")
        lines_list.append(f"   起止: {origin} ↔ {terminal}")
        lines_list.append(f"   运营: {start_time} - {end_time}")
        lines_list.append(f"   公司: {company} | 全程: {distance} 米")
        lines_list.append(f"   站点数: {len(stations)} 站")
        if station_names:
            preview = " → ".join(station_names[:8])
            if len(station_names) > 8:
                preview += " → ..."
            lines_list.append(f"   途经: {preview}")
        lines_list.append("")

    if len(lines) > 5:
        lines_list.append(f"   ... 共 {len(lines)} 条，仅显示前 5 条")
    lines_list.append("━━━━━━━━━━━━━━━━━━━━━━━━")
    return "\n".join(lines_list)


async def query_realtime_arrival(
    city: str,
    station_name: str,
) -> str:
    _require_key()
    if not city or not station_name:
        return "❌ 城市名称和站点名称均不能为空"

    params = {
        "city": city,
        "station": station_name,
    }
    try:
        data = await _call_amap_api("bus/station/real", params)
        if data.get("status") != "1":
            return f"❌ 高德 API 返回错误: {data.get('info', '未知错误')}"
        return _format_arrival_info(data, city, station_name)
    except httpx.HTTPError as e:
        return f"❌ 网络请求失败: {str(e)}"
    except Exception as e:
        return f"❌ 查询失败: {str(e)}"


def _format_arrival_info(
    data: Dict[str, Any],
    city: str,
    station_name: str,
) -> str:
    bus_info_list = data.get("businfo") or data.get("data") or []

    lines_list = [
        f"🚌 实时到站信息",
        f"━━━━━━━━━━━━━━━━━━━━━━━━",
        f"🏙️  城市: {city} | 站点: {station_name}",
        f"",
    ]

    if not bus_info_list:
        lines_list.append("⚠️  暂无实时到站数据")
        lines_list.append("━━━━━━━━━━━━━━━━━━━━━━━━")
        return "\n".join(lines_list)

    has_data = False
    for bus in bus_info_list:
        line_name = bus.get("name") or bus.get("distance") or "未知线路"
        if isinstance(line_name, dict):
            line_name = line_name.get("name", "未知线路")

        arrivals = bus.get("businfo") or bus.get("buses") or []

        if not arrivals:
            dest = bus.get("destination", bus.get("terminal", "未知方向"))
            lines_list.append(f"🔹 {line_name} → {dest}")
            lines_list.append(f"   ⏳ 暂无实时数据")
            has_data = True
            continue

        for arrival in arrivals[:3]:
            dest = arrival.get("terminal") or arrival.get("destination", "未知方向")
            distance = arrival.get("distance", "未知")
            time_val = arrival.get("time", "未知")
            station_count = arrival.get("station_count", "未知")
            arrival_time = arrival.get("arrival_time", "未知")

            time_display = f"约 {time_val} 分钟" if time_val and time_val != "未知" else "暂无"
            lines_list.append(f"🔹 {line_name} → {dest}")
            if arrival_time:
                lines_list.append(f"   🕐 预计到站: {arrival_time}")
            lines_list.append(f"   📍 距离: {distance} 米 | {time_display}")
            if station_count and station_count != "未知":
                lines_list.append(f"   🚏 距本站: {station_count} 站")
            lines_list.append("")
            has_data = True

        if has_data:
            lines_list.append("")

    if not has_data:
        lines_list.append("⚠️  暂无实时到站数据")

    lines_list.append("━━━━━━━━━━━━━━━━━━━━━━━━")
    return "\n".join(lines_list)


async def geocode_address(address: str, city: str = "") -> Tuple[Optional[float], Optional[float], str]:
    _require_key()
    if not address:
        return None, None, "❌ 地址不能为空"

    params = {"address": address}
    if city:
        params["city"] = city

    try:
        data = await _call_amap_api("geocode/geo", params)
        if data.get("status") != "1":
            return None, None, f"❌ 地理编码失败: {data.get('info', '未知错误')}"

        geocodes = data.get("geocodes") or []
        if not geocodes:
            return None, None, f"❌ 无法解析地址「{address}」，请尝试更详细的地址"

        location = geocodes[0].get("location", "")
        if not location:
            return None, None, f"❌ 地址「{address}」解析成功但未返回坐标"

        lng_str, lat_str = location.split(",")
        longitude = float(lng_str)
        latitude = float(lat_str)
        formatted_address = geocodes[0].get("formatted_address", address)
        return longitude, latitude, formatted_address

    except httpx.HTTPError as e:
        return None, None, f"❌ 网络请求失败: {str(e)}"
    except ValueError:
        return None, None, "❌ 坐标解析失败"
    except Exception as e:
        return None, None, f"❌ 地理编码失败: {str(e)}"


async def handle_query(query_text: str) -> str:
    query_lower = query_text.strip().lower()

    if any(kw in query_text for kw in ["周边公交", "周边地铁", "附近公交", "附近地铁", "附近站", "周边站"]):
        return "📍 请提供您的经纬度坐标（格式: 经度,纬度），例如: 116.397428,39.90923\n也可提供地址，我先帮您转换为坐标。"

    if any(kw in query_text for kw in ["怎么坐车", "怎么去", "坐几路", "交通出行", "出行"]):
        return (
            "🚌 公交出行查询指引：\n"
            "1. 发送「周边 + 地址/坐标」查询周边站点\n"
            "2. 发送「线路 + 线路名」查询公交线路详情\n"
            "3. 发送「到站 + 站点名」查询实时到站信息\n\n"
            "示例：\n"
            "- 周边 北京市朝阳区望京\n"
            "- 线路 北京 1路\n"
            "- 到站 北京 天安门东"
        )

    return (
        "🚌🚇 公交地铁查询助手\n\n"
        "支持以下查询方式：\n"
        "1️⃣ 周边站点: 「周边 + 坐标」或「周边 + 地址」\n"
        "2️⃣ 线路查询: 「线路 + 城市 + 线路名」\n"
        "3️⃣ 实时到站: 「到站 + 城市 + 站点名」\n\n"
        "请描述您的查询需求，我将为您服务！"
    )


if __name__ == "__main__":
    async def _demo():
        print("=== 公交地铁查询 Skill 自检 ===")
        print(f"AMAP_KEY 已配置: {'是' if AMAP_KEY else '否（请在环境变量中设置 AMAP_API_KEY）'}")
        print()

        print(await handle_query("怎么坐车"))
        print()

        if AMAP_KEY:
            lng, lat, addr = await geocode_address("北京市朝阳区望京", "北京")
            print(f"地理编码: {addr} → ({lng}, {lat})")
            print()

            if lng and lat:
                result = await search_nearby_stations(lng, lat, radius=1000)
                print(result)
                print()

            result = await search_bus_lines("北京", "1路")
            print(result)
            print()

            result = await query_realtime_arrival("北京", "天安门东")
            print(result)
        else:
            print("⚠️  未配置 AMAP_API_KEY，跳过 API 调用演示")

    asyncio.run(_demo())
