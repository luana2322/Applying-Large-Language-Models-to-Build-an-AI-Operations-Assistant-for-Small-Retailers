import os
import datetime
from pathlib import Path

PROMPT_FILE = Path(__file__).resolve().parent.parent.parent / "prompts" / "retail_assistant_v1.txt"

class PromptBuilder:
    def __init__(self):
        self.base_prompt = ""
        if PROMPT_FILE.exists():
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                self.base_prompt = f.read()

    def build_system_instruction(self, timezone: str = "Asia/Ho_Chi_Minh") -> str:
        current_date_str = datetime.date.today().strftime("%Y-%m-%d")
        context_header = (
            f"### THÔNG TIN HỆ THỐNG HIỆN TẠI:\n"
            f"- Ngày hiện tại của hệ thống: {current_date_str}\n"
            f"- Múi giờ: {timezone}\n"
            f"- Đơn vị tiền tệ chuẩn: VND\n\n"
        )
        return context_header + self.base_prompt

prompt_builder = PromptBuilder()
