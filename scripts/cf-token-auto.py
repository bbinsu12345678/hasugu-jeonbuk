"""CF API Token 자동 생성 — Playwright headed Chromium.

사용자 Chrome 프로필 재사용해서 CF Dashboard 로그인 상태 그대로 사용.
"Edit Cloudflare Workers" 템플릿 기반 토큰 생성 → Account/Zone All accounts 포함 → 토큰 문자열 추출 → .env.local 저장.

실행: python scripts/cf-token-auto.py
"""
from __future__ import annotations
import os
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

CF_TOKENS_URL = "https://dash.cloudflare.com/profile/api-tokens"
# Windows Chrome default user data dir
CHROME_PROFILE = Path(os.environ["LOCALAPPDATA"]) / "Google/Chrome/User Data"
ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local"


def main() -> int:
    print(f"[CF-AUTO] Chrome profile: {CHROME_PROFILE}")
    if not CHROME_PROFILE.exists():
        print("[CF-AUTO] Chrome 프로필 없음 — Edge/Firefox 등 다른 브라우저 사용 중일 수도")
        return 2

    with sync_playwright() as p:
        # Chromium with user profile (사용자 CF 로그인 재사용)
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=str(CHROME_PROFILE),
            headless=False,
            channel="chrome",  # 시스템 Chrome 바이너리 사용
            args=["--no-first-run", "--no-default-browser-check"],
            viewport={"width": 1400, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        print(f"[CF-AUTO] Dashboard 열기: {CF_TOKENS_URL}")
        page.goto(CF_TOKENS_URL, wait_until="domcontentloaded")

        # 로그인 확인 대기 (최대 5분 — 사용자가 이메일/비밀번호 입력 시간)
        print("[CF-AUTO] 로그인 상태 확인 중... (로그인 안 되어 있으면 창에서 직접 로그인)")
        try:
            page.wait_for_url("**/profile/api-tokens", timeout=300_000)
        except PWTimeout:
            print("[CF-AUTO] 5분 내 토큰 페이지 도달 실패 — 중단")
            ctx.close()
            return 3

        print("[CF-AUTO] 토큰 페이지 도달. UI 분석 중...")
        time.sleep(3)
        # 캡처
        page.screenshot(path="C:/Users/admin/AppData/Local/Temp/cf-dashboard.png")
        print("[CF-AUTO] 스크린샷: C:/Users/admin/AppData/Local/Temp/cf-dashboard.png")

        # 사용자가 직접 토큰 생성 (자동 클릭 경로는 CF UI 변경에 취약)
        print("[CF-AUTO] 이 창에서 아래 순서로 직접 토큰 생성해주세요:")
        print("  1. Create Token → Edit Cloudflare Workers → Use template")
        print("  2. Account Resources: Include All accounts")
        print("  3. Zone Resources: Include All zones")
        print("  4. Continue to summary → Create Token")
        print("  5. 뜨는 토큰 값 복사 → 이 터미널에 붙여넣기")

        token = input("[CF-AUTO] 생성된 토큰 입력 (Enter 치면 종료): ").strip()
        if not token.startswith(("cfut_", "v")) and len(token) < 30:
            print("[CF-AUTO] 토큰 형식 의심스러움 — 건너뜀")
            ctx.close()
            return 4

        # .env.local 덮어쓰기
        env_text = ENV_FILE.read_text(encoding="utf-8")
        new_line = f'CLOUDFLARE_API_TOKEN="{token}"'
        env_text = re.sub(
            r'^CLOUDFLARE_API_TOKEN=".*"$',
            new_line,
            env_text,
            flags=re.MULTILINE,
        )
        ENV_FILE.write_text(env_text, encoding="utf-8")
        print(f"[CF-AUTO] .env.local 갱신 완료")

        ctx.close()
        return 0


if __name__ == "__main__":
    sys.exit(main())
