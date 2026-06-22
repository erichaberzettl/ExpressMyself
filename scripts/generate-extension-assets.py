from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "extension" / "assets"
STORE_DIR = ROOT / "extension" / "store-assets"
SCREENSHOT_DIR = STORE_DIR / "screenshots"


def ensure_dirs() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)


def font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/SFNS.ttf"
    ]

    for candidate in candidates:
      try:
        return ImageFont.truetype(candidate, size=size)
      except OSError:
        continue

    return ImageFont.load_default()


def draw_gradient(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), "#fff8ef")
    draw = ImageDraw.Draw(image)

    for y in range(size):
        ratio = y / max(size - 1, 1)
        r = int(255 - ratio * 24)
        g = int(248 - ratio * 32)
        b = int(239 - ratio * 48)
        draw.line((0, y, size, y), fill=(r, g, b, 255))

    return image


def create_icon(size: int) -> None:
    image = draw_gradient(size)
    draw = ImageDraw.Draw(image)

    ink = (214, 97, 60, 255)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (size * 0.16, size * 0.16, size * 0.84, size * 0.84),
        radius=size * 0.2,
        fill=(90, 63, 28, 52)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.04))
    image.alpha_composite(shadow)

    draw.rounded_rectangle(
        (size * 0.14, size * 0.14, size * 0.86, size * 0.82),
        radius=size * 0.2,
        fill=(255, 252, 247, 246),
        outline=(161, 123, 72, 34),
        width=max(1, size // 72)
    )

    letter_font = font(int(size * 0.56), bold=True)
    letter = "E"
    box = draw.textbbox((0, 0), letter, font=letter_font)
    text_width = box[2] - box[0]
    text_height = box[3] - box[1]
    text_x = (size - text_width) / 2 - box[0]
    text_y = (size - text_height) / 2 - box[1] - size * 0.015
    draw.text((text_x, text_y), letter, fill=ink, font=letter_font)

    image.save(ASSETS_DIR / f"icon-{size}.png")


def create_app_icons() -> None:
    for size in (16, 32, 48, 128, 256):
        create_icon(size)

    icon_256 = ASSETS_DIR / "icon-256.png"
    (ROOT / "app" / "icon.png").write_bytes(icon_256.read_bytes())
    (ROOT / "app" / "favicon.png").write_bytes(icon_256.read_bytes())


def create_store_banner() -> None:
    width, height = 1400, 560
    image = Image.new("RGBA", (width, height), "#f6f1e9")
    draw = ImageDraw.Draw(image)

    for y in range(height):
        ratio = y / max(height - 1, 1)
        r = int(255 - ratio * 28)
        g = int(248 - ratio * 22)
        b = int(239 - ratio * 38)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    draw.ellipse((-120, -80, 340, 380), fill=(255, 220, 186, 180))
    draw.ellipse((1040, 120, 1500, 620), fill=(224, 168, 132, 110))

    card_x, card_y = 90, 94
    card_w, card_h = 380, 360
    draw.rounded_rectangle((card_x, card_y, card_x + card_w, card_y + card_h), radius=34, fill=(255, 252, 247, 242), outline=(161, 123, 72, 70), width=2)
    draw.text((card_x + 28, card_y + 28), "Phrase of the day", fill=(143, 61, 33), font=font(26, bold=True))
    draw.text((card_x + 28, card_y + 84), "Break a leg", fill=(31, 26, 20), font=font(52, bold=True))
    draw.text((card_x + 28, card_y + 158), "Wish someone good luck before\na big moment or performance.", fill=(87, 73, 60), font=font(28))
    draw.rounded_rectangle((card_x + 28, card_y + 260, card_x + 186, card_y + 310), radius=24, fill=(184, 92, 56))
    draw.text((card_x + 66, card_y + 271), "Save", fill=(255, 255, 255), font=font(24, bold=True))
    draw.rounded_rectangle((card_x + 202, card_y + 260, card_x + 350, card_y + 310), radius=24, fill=(255, 255, 255), outline=(161, 123, 72, 70))
    draw.text((card_x + 240, card_y + 271), "Listen", fill=(31, 26, 20), font=font(24, bold=True))

    draw.text((560, 100), "ExpressMyself", fill=(31, 26, 20), font=font(64, bold=True))
    draw.text((560, 182), "Learn practical idioms and expressions right from Chrome.", fill=(87, 73, 60), font=font(34))
    bullets = [
        "Daily phrase popup",
        "Searchable phrase library",
        "Saved expressions in browser storage",
        "Ten supported languages"
    ]
    y = 266
    for item in bullets:
        draw.rounded_rectangle((560, y, 582, y + 22), radius=11, fill=(184, 92, 56))
        draw.text((602, y - 6), item, fill=(31, 26, 20), font=font(28))
        y += 58

    image.save(STORE_DIR / "store-marquee.png")


def wrap_text(text: str, max_chars: int) -> str:
    words = text.split()
    lines = []
    current = []
    length = 0

    for word in words:
        projected = length + len(word) + (1 if current else 0)
        if projected > max_chars and current:
            lines.append(" ".join(current))
            current = [word]
            length = len(word)
        else:
            current.append(word)
            length = projected

    if current:
        lines.append(" ".join(current))

    return "\n".join(lines)


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str) -> None:
    chip_font = font(20, bold=True)
    box = draw.textbbox((0, 0), text, font=chip_font)
    width = box[2] - box[0] + 30
    draw.rounded_rectangle((x, y, x + width, y + 36), radius=18, fill=(255, 255, 255, 220), outline=(161, 123, 72, 65), width=2)
    draw.text((x + 15, y + 7), text, fill=(143, 61, 33), font=chip_font)


def base_screenshot(title: str, subtitle: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    width, height = 1280, 800
    image = Image.new("RGBA", (width, height), "#f6f1e9")
    draw = ImageDraw.Draw(image)

    for y in range(height):
        ratio = y / max(height - 1, 1)
        r = int(255 - ratio * 22)
        g = int(248 - ratio * 18)
        b = int(239 - ratio * 32)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    draw.ellipse((-100, -70, 320, 330), fill=(255, 224, 197, 170))
    draw.ellipse((970, 90, 1450, 610), fill=(227, 176, 145, 95))

    draw.rounded_rectangle((54, 42, 1226, 758), radius=38, fill=(255, 252, 247, 242), outline=(161, 123, 72, 55), width=2)
    draw.text((96, 86), title, fill=(31, 26, 20), font=font(54, bold=True))
    draw.text((96, 156), subtitle, fill=(103, 88, 71), font=font(28))

    return image, draw


def create_popup_screenshot() -> None:
    image, draw = base_screenshot("Popup view", "One-click daily review with listening and saved phrases.")

    draw.rounded_rectangle((108, 220, 520, 694), radius=34, fill=(248, 241, 233, 255), outline=(161, 123, 72, 55), width=2)
    draw.text((142, 256), "Phrase of the day", fill=(143, 61, 33), font=font(22, bold=True))
    draw.text((142, 316), "In bocca al lupo", fill=(31, 26, 20), font=font(42, bold=True))
    draw.text((142, 378), wrap_text("A common Italian way to wish someone good luck before an important moment.", 28), fill=(87, 73, 60), font=font(24))
    draw.text((142, 500), "Literal", fill=(143, 61, 33), font=font(18, bold=True))
    draw.text((142, 528), "Into the wolf's mouth", fill=(31, 26, 20), font=font(24))
    draw.rounded_rectangle((142, 602, 286, 648), radius=23, fill=(184, 92, 56))
    draw.text((186, 613), "Save", fill=(255, 255, 255), font=font(22, bold=True))
    draw.rounded_rectangle((306, 602, 460, 648), radius=23, fill=(255, 255, 255), outline=(161, 123, 72, 55), width=2)
    draw.text((344, 613), "Listen", fill=(31, 26, 20), font=font(22, bold=True))

    draw.rounded_rectangle((604, 234, 1138, 466), radius=30, fill=(255, 252, 247, 230), outline=(161, 123, 72, 45), width=2)
    draw.text((642, 278), "Why it works", fill=(31, 26, 20), font=font(34, bold=True))
    bullets = [
        "Daily expression surfaced instantly",
        "Works without signing in",
        "Saved review list follows you in Chrome storage"
    ]
    y = 340
    for item in bullets:
        draw.rounded_rectangle((644, y + 8, 662, y + 26), radius=9, fill=(184, 92, 56))
        draw.text((680, y), item, fill=(87, 73, 60), font=font(24))
        y += 48

    image.save(SCREENSHOT_DIR / "popup-daily.png")


def draw_library_card(draw: ImageDraw.ImageDraw, x: int, y: int, title: str, body: str, chips: list[str]) -> None:
    draw.rounded_rectangle((x, y, x + 332, y + 210), radius=26, fill=(255, 252, 247, 232), outline=(161, 123, 72, 45), width=2)
    draw.text((x + 24, y + 24), title, fill=(31, 26, 20), font=font(30, bold=True))
    draw.text((x + 24, y + 76), wrap_text(body, 27), fill=(87, 73, 60), font=font(20))
    chip_x = x + 24
    for chip in chips:
        draw_chip(draw, chip_x, y + 162, chip)
        chip_x += 110


def create_library_screenshot() -> None:
    image, draw = base_screenshot("Library view", "Search by phrase, language, topic, and content type.")

    draw.rounded_rectangle((92, 220, 1188, 312), radius=28, fill=(248, 241, 233, 255), outline=(161, 123, 72, 55), width=2)
    draw.text((122, 246), "Spanish", fill=(31, 26, 20), font=font(24, bold=True))
    draw_chip(draw, 252, 238, "Search: pan comido")
    draw_chip(draw, 560, 238, "Topic: all")
    draw_chip(draw, 738, 238, "Idioms")
    draw_chip(draw, 870, 238, "Colloquialisms")
    draw_chip(draw, 1072, 238, "Words")

    draw_library_card(draw, 92, 354, "Ser pan comido", "Use it like “piece of cake” when something is very easy to do.", ["Spanish", "Idioms"])
    draw_library_card(draw, 448, 354, "Meter la pata", "A casual way to admit you made a mistake or said something awkward.", ["Mistakes", "Saved"])
    draw_library_card(draw, 804, 354, "Tomar el pelo", "A playful phrase for teasing or joking with someone.", ["Humor", "Daily life"])

    image.save(SCREENSHOT_DIR / "library-view.png")


def create_saved_screenshot() -> None:
    image, draw = base_screenshot("Saved view", "Build a compact shelf of phrases to revisit later.")

    draw.rounded_rectangle((92, 220, 1188, 296), radius=28, fill=(248, 241, 233, 255), outline=(161, 123, 72, 55), width=2)
    draw.text((122, 246), "4 saved expressions", fill=(31, 26, 20), font=font(28, bold=True))
    draw.text((412, 248), "Stored locally in Chrome extension storage.", fill=(103, 88, 71), font=font(24))

    draw_library_card(draw, 92, 334, "Break a leg", "Wish someone good luck before a performance or big moment.", ["English", "Work"])
    draw_library_card(draw, 448, 334, "On the same page", "Use it when you want to check that people understand something the same way.", ["Communication", "Saved"])
    draw_library_card(draw, 804, 334, "In bocca al lupo", "A common Italian expression used to encourage someone before something important.", ["Italian", "Encouragement"])

    image.save(SCREENSHOT_DIR / "saved-view.png")


if __name__ == "__main__":
    ensure_dirs()
    create_app_icons()
    create_store_banner()
    create_popup_screenshot()
    create_library_screenshot()
    create_saved_screenshot()
