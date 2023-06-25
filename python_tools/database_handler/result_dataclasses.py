"""Dataclasses for how each federation formats its event results"""
from dataclasses import dataclass
from typing import Any


@dataclass
class IWFHeaders:
    """Standard headers for the IWF events index"""
    id: int
    name: str
    date: str
    location: str


@dataclass
class DatabaseEntry:
    """
    UNPACK IT BRO (*)\n
    This is the standard entry format for the main collated database.
    """
    event: Any
    date: Any
    gender: Any
    lifter_name: Any
    bodyweight: Any
    snatch_1: Any
    snatch_2: Any
    snatch_3: Any
    cj_1: Any
    cj_2: Any
    cj_3: Any
    best_snatch: Any
    best_cj: Any
    total: int
    country: Any


@dataclass
class Result:
    """
    UNPACK IT BRO (*)\n
    UK and US entities use the same event result format
    """
    event: str
    date: str
    category: str
    lifter_name: str
    bodyweight: float
    snatch_1: float
    snatch_2: float
    snatch_3: float
    cj_1: float
    cj_2: float
    cj_3: float
    best_snatch: float
    best_cj: float
    total: float
