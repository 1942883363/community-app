from typing import Any, Optional, List, TypeVar, Generic

from pydantic import BaseModel


T = TypeVar("T")


class ResponseModel(BaseModel):
    code: int = 200
    message: str = "success"
    data: Any = None


class PaginatedData(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


class PaginatedResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: PaginatedData[T]


def success_response(data: Any = None, message: str = "success") -> ResponseModel:
    return ResponseModel(code=200, message=message, data=data)


def error_response(code: int, message: str) -> ResponseModel:
    return ResponseModel(code=code, message=message, data=None)


def paginated_response(
    items: List[Any],
    total: int,
    page: int,
    page_size: int,
    message: str = "success",
) -> PaginatedResponse:
    return PaginatedResponse(
        code=200,
        message=message,
        data=PaginatedData(items=items, total=total, page=page, page_size=page_size),
    )
