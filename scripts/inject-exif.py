#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
inject-exif.py — v2 (진짜같은 EXIF)

public/images/blog-content/**/*.webp 파일에 실제 스마트폰 사진 수준의
완전한 EXIF 메타데이터를 결정론 시드 기반으로 주입한다.

v2 개선 (vs v1):
  - ExifVersion, ColorSpace, ComponentsConfiguration 필수 필드 추가
  - ExposureProgram, MeteringMode, WhiteBalance, Flash, SceneType, SensingMethod
  - FocalLength + FocalLengthIn35mmFilm (기종별 물리 스펙 테이블)
  - LensModel 실제 표기 ("iPhone 14 Pro back triple camera 6.86mm f/1.78")
  - FNumber 기종별 고정 (렌즈 물리 정합성)
  - OffsetTime / OffsetTimeOriginal = '+09:00'
  - SubSecTimeOriginal / SubSecTimeDigitized (밀리초)
  - GPSAltitude / GPSTimeStamp / GPSDateStamp (GPS 완전성)
  - Orientation: 1/6/8 분산 (가로/세로)
  - ExposureBiasValue, ShutterSpeedValue, ApertureValue, DigitalZoomRatio
  - Software: iPhone=iOS version, Samsung=빌드번호 스타일

사용법:
    pip install pillow piexif
    python scripts/inject-exif.py                    # 전체
    python scripts/inject-exif.py --limit 10         # 상위 10장 테스트
    python scripts/inject-exif.py --dry-run          # 계획만
    python scripts/inject-exif.py --verify-dump 3    # 주입 후 샘플 3장 EXIF 덤프
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import sys
import time
from fractions import Fraction
from pathlib import Path
from typing import Tuple

try:
    import piexif
    from PIL import Image
except ImportError:
    print('ERROR: pip install pillow piexif 필요', file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# 기종별 렌즈 스펙 (실제 제조사 공개 수치 기반)
# ---------------------------------------------------------------------------

# (make, model, software, lens_name, focal_mm, focal_35mm, aperture_fnum)
# aperture_fnum 은 분수 (num, den) 로 저장해 EXIF 규격 준수
DEVICE_SPEC = [
    # Samsung — Software는 실제 유통 빌드번호 스타일
    ('samsung', 'SM-S908N', 'S908NKSU6HXA1',  'SM-S908N back triple camera 6.3mm f/1.8', (63, 10),  23, (18, 10)),  # Galaxy S22 Ultra
    ('samsung', 'SM-S906N', 'S906NKSU4DXC3',  'SM-S906N back triple camera 5.4mm f/1.8', (54, 10),  24, (18, 10)),  # Galaxy S22+
    ('samsung', 'SM-S911N', 'S911NKSU3EYC3',  'SM-S911N back triple camera 5.4mm f/1.8', (54, 10),  24, (18, 10)),  # Galaxy S23
    ('samsung', 'SM-S918N', 'S918NKSU3EYD1',  'SM-S918N back triple camera 6.3mm f/1.7', (63, 10),  23, (17, 10)),  # Galaxy S23 Ultra
    ('samsung', 'SM-S921N', 'S921NKSU2AXA5',  'SM-S921N back triple camera 5.4mm f/1.8', (54, 10),  24, (18, 10)),  # Galaxy S24
    ('samsung', 'SM-S928N', 'S928NKSU2AXB6',  'SM-S928N back triple camera 6.3mm f/1.7', (63, 10),  23, (17, 10)),  # Galaxy S24 Ultra
    # Apple — Software는 iOS 버전
    ('Apple',   'iPhone 13',          '16.5',   'iPhone 13 back dual wide camera 5.1mm f/1.6',     (51, 10),   26, (16, 10)),
    ('Apple',   'iPhone 13 Pro',      '16.6.1', 'iPhone 13 Pro back triple camera 5.7mm f/1.5',    (57, 10),   26, (15, 10)),
    ('Apple',   'iPhone 14',          '17.0.3', 'iPhone 14 back dual wide camera 5.7mm f/1.5',     (57, 10),   26, (15, 10)),
    ('Apple',   'iPhone 14 Pro',      '17.4.1', 'iPhone 14 Pro back triple camera 6.86mm f/1.78',  (686, 100), 24, (178, 100)),
    ('Apple',   'iPhone 14 Pro Max',  '17.5.1', 'iPhone 14 Pro Max back triple camera 6.86mm f/1.78', (686, 100), 24, (178, 100)),
    ('Apple',   'iPhone 15',          '17.6.1', 'iPhone 15 back dual wide camera 6.86mm f/1.6',    (686, 100), 24, (16, 10)),
    ('Apple',   'iPhone 15 Pro',      '18.0.1', 'iPhone 15 Pro back triple camera 6.765mm f/1.78', (6765, 1000), 24, (178, 100)),
]

# 전북 14 시/군 중심좌표 (중심 정확, ±0.01° 반경에서 난수)
CITIES = [
    ('전주시', 35.8242, 127.1480, 35),   # alt 35m
    ('익산시', 35.9483, 126.9577, 12),
    ('군산시', 35.9676, 126.7369, 8),
    ('정읍시', 35.5699, 126.8560, 45),
    ('남원시', 35.4164, 127.3905, 120),
    ('김제시', 35.8034, 126.8808, 15),
    ('완주군', 35.9058, 127.1623, 60),
    ('고창군', 35.4358, 126.7019, 25),
    ('부안군', 35.7317, 126.7331, 5),
    ('진안군', 35.7917, 127.4248, 290),
    ('무주군', 36.0067, 127.6609, 220),
    ('장수군', 35.6475, 127.5210, 400),
    ('임실군', 35.6179, 127.2886, 155),
    ('순창군', 35.3744, 127.1378, 90),
]

# 실내 배관 작업 사진은 ISO 100~1600 범위가 자연스러움
ISO_POOL = [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600]

# 실내 작업 사진 → 셔터 속도 1/30~1/250 중심
EXPOSURE_POOL = [
    (1, 250), (1, 200), (1, 160), (1, 125), (1, 100),
    (1, 80),  (1, 60),  (1, 50),  (1, 40),  (1, 33), (1, 30),
]

CONTEXT_POOL = [
    '주방 배수구 현장', '욕실 변기 현장', '외부 하수구 현장',
    '세탁기 배수 현장', '맨홀 청소 작업', '고압세척 작업',
    '오수관 현장', '우수관 현장', '누수 탐지 현장',
    '에어컨 배관 정비', '세면대 막힘 현장', '배관 점검',
]

INTENT_POOL = [
    '현장 상담 후 진행', '장비 세팅 전 점검', '작업 직전 사전 확인',
    '마감 후 정리 단계', '고객 확인 단계', '원인 진단 단계',
    '견적 전 사전 조사', '재발 방지 마무리',
]

# 촬영 시각 범위: 2024-01-01 ~ 2026-04-15
START_TS = int(time.mktime(time.strptime('2024-01-01', '%Y-%m-%d')))
END_TS = int(time.mktime(time.strptime('2026-04-15', '%Y-%m-%d')))

ROOT = Path(__file__).parent.parent
TARGET_DIR = ROOT / 'public' / 'images' / 'blog-content'
MANIFEST_PATH = ROOT / 'scripts' / 'exif-manifest.json'

# ---------------------------------------------------------------------------
# 헬퍼
# ---------------------------------------------------------------------------


def _deg_to_dms_rational(value: float) -> list:
    """양수 도(°) → [(deg,1),(min,1),(sec*10000,10000)] DMS 형식."""
    value = abs(value)
    deg = int(value)
    remainder = (value - deg) * 60
    minutes = int(remainder)
    seconds = (remainder - minutes) * 60
    seconds_num = int(round(seconds * 10000))
    return [(deg, 1), (minutes, 1), (seconds_num, 10000)]


def _float_to_rational(value: float, denom: int = 1000) -> tuple:
    """부동소수 → (num, denom) 근사."""
    return (int(round(value * denom)), denom)


def _apex_aperture(fnumber_tuple: tuple) -> tuple:
    """FNumber (num,den) → ApertureValue APEX = 2 log2(FNumber)."""
    fnum = fnumber_tuple[0] / fnumber_tuple[1]
    apex = 2 * math.log2(fnum)
    return _float_to_rational(apex, 100)


def _apex_shutter(exposure_tuple: tuple) -> tuple:
    """ExposureTime (1, x) → ShutterSpeedValue APEX = -log2(exposure)."""
    exposure = exposure_tuple[0] / exposure_tuple[1]
    apex = -math.log2(exposure)
    return _float_to_rational(apex, 100)


# ---------------------------------------------------------------------------
# 레코드 생성 (시드 결정론)
# ---------------------------------------------------------------------------


def build_record(filename: str, index: int) -> dict:
    seed_bytes = hashlib.sha256(f'{filename}|{index}|v2'.encode()).digest()
    seed_int = int.from_bytes(seed_bytes[:8], 'big')
    rng = random.Random(seed_int)

    city_name, lat_base, lon_base, alt_base = CITIES[index % len(CITIES)]
    lat = round(lat_base + rng.uniform(-0.01, 0.01), 6)
    lon = round(lon_base + rng.uniform(-0.01, 0.01), 6)
    alt = alt_base + rng.randint(-5, 10)  # 고도 ±5~10m 자연 편차

    make, model, software, lens_model, focal, focal_35, fnumber = rng.choice(DEVICE_SPEC)
    iso = rng.choice(ISO_POOL)
    exposure = rng.choice(EXPOSURE_POOL)

    # 촬영 시각 + 밀리초
    ts = rng.randint(START_TS, END_TS)
    dt_local = time.localtime(ts)
    dt_str = time.strftime('%Y:%m:%d %H:%M:%S', dt_local)
    gps_date_str = time.strftime('%Y:%m:%d', dt_local)
    subsec_ms = rng.randint(0, 999)
    subsec_str = f'{subsec_ms:03d}'

    # GPS 시각 (UTC)
    dt_utc = time.gmtime(ts)
    gps_hour = dt_utc.tm_hour
    gps_min = dt_utc.tm_min
    gps_sec = dt_utc.tm_sec

    # Orientation 시드 분산: 1 가로 60%, 6 세로 20%, 8 세로 20%
    orient_pick = rng.random()
    if orient_pick < 0.6:
        orientation = 1
    elif orient_pick < 0.8:
        orientation = 6
    else:
        orientation = 8

    # ExposureBiasValue: -1 ~ +1 EV, 0 주로
    bias_choices = [(0, 1), (0, 1), (0, 1), (-1, 3), (1, 3), (-2, 3), (2, 3)]
    exposure_bias = rng.choice(bias_choices)

    intent = rng.choice(INTENT_POOL)
    context = rng.choice(CONTEXT_POOL)

    return {
        'filename':          filename,
        'index':             index,
        'city':              city_name,
        'lat':               lat,
        'lon':               lon,
        'alt':               alt,
        'make':              make,
        'model':             model,
        'software':          software,
        'lens_model':        lens_model,
        'focal':             focal,
        'focal_35':          focal_35,
        'fnumber':           list(fnumber),
        'exposure':          list(exposure),
        'exposure_bias':     list(exposure_bias),
        'iso':               iso,
        'datetime':          dt_str,
        'gps_date':          gps_date_str,
        'gps_time':          [gps_hour, gps_min, gps_sec],
        'subsec':             subsec_str,
        'orientation':       orientation,
        'image_description': f'{city_name} {context}',
        'user_comment':      f'{city_name} {context} - {intent}',
    }


# ---------------------------------------------------------------------------
# EXIF bytes 빌더 (완전형)
# ---------------------------------------------------------------------------


def _build_exif_bytes(r: dict) -> bytes:
    """실제 스마트폰 사진 수준 EXIF 생성."""
    fnumber = tuple(r['fnumber'])
    exposure = tuple(r['exposure'])
    exposure_bias = tuple(r['exposure_bias'])
    focal = tuple(r['focal'])

    # iPhone 여부 판별 (ColorSpace 분기)
    is_iphone = r['make'] == 'Apple'

    zeroth_ifd = {
        piexif.ImageIFD.Make:              r['make'].encode('ascii'),
        piexif.ImageIFD.Model:             r['model'].encode('ascii'),
        piexif.ImageIFD.Software:          r['software'].encode('ascii'),
        piexif.ImageIFD.Orientation:       r['orientation'],
        piexif.ImageIFD.XResolution:       (72, 1),
        piexif.ImageIFD.YResolution:       (72, 1),
        piexif.ImageIFD.ResolutionUnit:    2,  # inch
        piexif.ImageIFD.DateTime:          r['datetime'].encode('ascii'),
        piexif.ImageIFD.ImageDescription:  r['image_description'].encode('utf-8'),
        piexif.ImageIFD.YCbCrPositioning:  1,
    }

    exif_ifd = {
        # 버전·표준
        piexif.ExifIFD.ExifVersion:             b'0232',
        piexif.ExifIFD.ComponentsConfiguration: b'\x01\x02\x03\x00',  # YCbCr
        piexif.ExifIFD.FlashpixVersion:         b'0100',
        # iPhone=Uncalibrated(0xFFFF), Samsung=sRGB(1)
        piexif.ExifIFD.ColorSpace:              0xFFFF if is_iphone else 1,

        # 날짜·시각
        piexif.ExifIFD.DateTimeOriginal:        r['datetime'].encode('ascii'),
        piexif.ExifIFD.DateTimeDigitized:       r['datetime'].encode('ascii'),
        piexif.ExifIFD.OffsetTime:              b'+09:00',
        piexif.ExifIFD.OffsetTimeOriginal:      b'+09:00',
        piexif.ExifIFD.OffsetTimeDigitized:     b'+09:00',
        piexif.ExifIFD.SubSecTime:              r['subsec'].encode('ascii'),
        piexif.ExifIFD.SubSecTimeOriginal:      r['subsec'].encode('ascii'),
        piexif.ExifIFD.SubSecTimeDigitized:     r['subsec'].encode('ascii'),

        # 노출·감도
        piexif.ExifIFD.ExposureTime:            exposure,
        piexif.ExifIFD.FNumber:                 fnumber,
        piexif.ExifIFD.ExposureProgram:         2,  # Program AE
        piexif.ExifIFD.ISOSpeedRatings:         r['iso'],
        piexif.ExifIFD.ShutterSpeedValue:       _apex_shutter(exposure),
        piexif.ExifIFD.ApertureValue:           _apex_aperture(fnumber),
        piexif.ExifIFD.ExposureBiasValue:       exposure_bias,
        piexif.ExifIFD.MaxApertureValue:        _apex_aperture(fnumber),
        piexif.ExifIFD.MeteringMode:            5,  # Pattern
        piexif.ExifIFD.LightSource:             0,  # Unknown
        piexif.ExifIFD.Flash:                   0x10,  # Off, Did not fire (실내 작업)
        piexif.ExifIFD.FocalLength:             focal,
        piexif.ExifIFD.FocalLengthIn35mmFilm:   r['focal_35'],

        # 렌즈
        piexif.ExifIFD.LensMake:                r['make'].encode('ascii'),
        piexif.ExifIFD.LensModel:               r['lens_model'].encode('ascii'),

        # 이미지 속성
        piexif.ExifIFD.ExposureMode:            0,  # Auto Exposure
        piexif.ExifIFD.WhiteBalance:            0,  # Auto
        piexif.ExifIFD.DigitalZoomRatio:        (1, 1),
        piexif.ExifIFD.SceneCaptureType:        0,  # Standard
        piexif.ExifIFD.SceneType:               b'\x01',  # Directly photographed
        piexif.ExifIFD.SensingMethod:           2,  # One-chip color area sensor
        piexif.ExifIFD.CustomRendered:          0,  # Normal process
        piexif.ExifIFD.Contrast:                0,  # Normal
        piexif.ExifIFD.Saturation:              0,  # Normal
        piexif.ExifIFD.Sharpness:               0,  # Normal
        piexif.ExifIFD.SubjectDistanceRange:    0,  # Unknown

        # 사용자 코멘트 (UTF-8 prefix 공식 규격)
        piexif.ExifIFD.UserComment:
            b'UNICODE\x00' + r['user_comment'].encode('utf-16-be'),
    }

    # GPS
    lat_ref = b'N' if r['lat'] >= 0 else b'S'
    lon_ref = b'E' if r['lon'] >= 0 else b'W'
    gps_ifd = {
        piexif.GPSIFD.GPSVersionID:         (2, 3, 0, 0),
        piexif.GPSIFD.GPSLatitudeRef:       lat_ref,
        piexif.GPSIFD.GPSLatitude:          _deg_to_dms_rational(r['lat']),
        piexif.GPSIFD.GPSLongitudeRef:      lon_ref,
        piexif.GPSIFD.GPSLongitude:         _deg_to_dms_rational(r['lon']),
        piexif.GPSIFD.GPSAltitudeRef:       0,  # Above sea level
        piexif.GPSIFD.GPSAltitude:          (int(r['alt'] * 100), 100),
        piexif.GPSIFD.GPSTimeStamp:         [
            (r['gps_time'][0], 1),
            (r['gps_time'][1], 1),
            (r['gps_time'][2], 1),
        ],
        piexif.GPSIFD.GPSDateStamp:         r['gps_date'].encode('ascii'),
        piexif.GPSIFD.GPSProcessingMethod:  b'ASCII\x00\x00\x00GPS',
        piexif.GPSIFD.GPSHPositioningError: (5, 1),  # 5m 오차 (실제 폰과 유사)
    }

    # 1st IFD는 썸네일 용도 — 생략 (webp 내부 썸네일 미지원)
    exif_dict = {'0th': zeroth_ifd, 'Exif': exif_ifd, 'GPS': gps_ifd, '1st': {}, 'thumbnail': None}
    return piexif.dump(exif_dict)


# ---------------------------------------------------------------------------
# 처리
# ---------------------------------------------------------------------------


def process_one(path: Path, record: dict, dry_run: bool) -> Tuple[bool, str]:
    if dry_run:
        return True, 'dry-run'

    try:
        exif_bytes = _build_exif_bytes(record)
    except Exception as e:
        return False, f'exif-dump: {e}'

    try:
        with Image.open(path) as img:
            img.load()
            save_kwargs = {
                'format': 'WEBP',
                'exif': exif_bytes,
                'method': 4,
                'quality': 88,
                'lossless': False,
            }
            img.save(path, **save_kwargs)
    except Exception as e:
        return False, f'save: {e}'

    return True, 'ok'


def verify_dump(files: list, n: int = 3):
    """주입 후 샘플 N장 EXIF 덤프 — 육안 확인용."""
    print('\n=== 검증 (EXIF 덤프 샘플) ===')
    for f in files[:n]:
        try:
            exif = piexif.load(str(f))
            print(f'\n--- {f.name} ---')
            for ifd_name in ('0th', 'Exif', 'GPS'):
                for tag, value in exif.get(ifd_name, {}).items():
                    tag_name = piexif.TAGS[ifd_name].get(tag, {}).get('name', f'0x{tag:04x}')
                    # 바이트는 prefix 32자만
                    if isinstance(value, bytes):
                        display = value[:32]
                        try:
                            display = display.decode('ascii', errors='replace')
                        except Exception:
                            pass
                    elif isinstance(value, list) and len(value) > 10:
                        display = f'<list len={len(value)}>'
                    else:
                        display = value
                    print(f'  {ifd_name}.{tag_name:28s} = {display}')
        except Exception as e:
            print(f'  dump 실패 {f.name}: {e}')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=0, help='상위 N장만 처리 (0=전체)')
    parser.add_argument('--dry-run', action='store_true', help='파일 쓰지 않고 매니페스트만')
    parser.add_argument('--verify-dump', type=int, default=0, help='주입 후 샘플 N장 EXIF 덤프')
    args = parser.parse_args()

    if not TARGET_DIR.exists():
        print(f'ERROR: {TARGET_DIR} 없음', file=sys.stderr)
        return 1

    files = sorted(TARGET_DIR.rglob('*.webp'))
    if args.limit > 0:
        files = files[:args.limit]

    if not files:
        print('ERROR: 대상 WebP 파일 0건', file=sys.stderr)
        return 1

    print(f'대상 파일 수: {len(files):,}')
    print(f'dry-run: {args.dry_run}')
    print(f'DEVICE_SPEC: {len(DEVICE_SPEC)}종 (Samsung 6 + Apple 7)')

    manifest = {
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'version': 'v2',
        'dry_run': args.dry_run,
        'target_dir': str(TARGET_DIR),
        'total': len(files),
        'entries': [],
    }

    ok_count = 0
    fail_count = 0

    for i, path in enumerate(files):
        record = build_record(path.name, i)
        success, status = process_one(path, record, args.dry_run)
        record['status'] = status
        record['ok'] = success
        manifest['entries'].append(record)
        if success:
            ok_count += 1
        else:
            fail_count += 1

        if (i + 1) % 500 == 0 or i == len(files) - 1:
            print(f'  {i+1:5d}/{len(files):5d} ok={ok_count} fail={fail_count}')

    manifest['ok'] = ok_count
    manifest['fail'] = fail_count
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    print()
    print('=== 완료 ===')
    print(f'성공: {ok_count:,} / 실패: {fail_count:,}')
    print(f'매니페스트: {MANIFEST_PATH}')

    if args.verify_dump > 0 and ok_count > 0:
        verify_dump(files, args.verify_dump)

    return 0 if fail_count == 0 else 2


if __name__ == '__main__':
    sys.exit(main())
