"""Centraliza a marca HCP e regenera os ícones Android por densidade."""

from pathlib import Path

from PIL import Image, ImageChops


MOBILE_ROOT = Path(__file__).resolve().parents[1]
SOURCE = MOBILE_ROOT / "assets" / "hcp-app-icon.png"
RES = MOBILE_ROOT / "android" / "app" / "src" / "main" / "res"

LEGACY_SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

FOREGROUND_SIZES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}


def visible_bbox(image: Image.Image, threshold: int = 8):
    rgb = image.convert("RGB")
    mask = Image.new("L", rgb.size)
    mask.putdata([
        255 if max(pixel) > threshold else 0
        for pixel in rgb.get_flattened_data()
    ])
    bbox = mask.getbbox()
    if bbox is None:
        raise RuntimeError("A marca não foi encontrada no arquivo de origem.")
    return bbox


def centered_source(source: Image.Image) -> Image.Image:
    source = source.convert("RGB")
    bbox = visible_bbox(source)
    mark = source.crop(bbox)
    canvas = Image.new("RGB", source.size, "#000000")
    x = (canvas.width - mark.width) // 2
    y = (canvas.height - mark.height) // 2
    canvas.paste(mark, (x, y))
    return canvas


def save_square(image: Image.Image, path: Path, size: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, "PNG", optimize=True)


def main() -> None:
    original = Image.open(SOURCE)
    centered = centered_source(original)
    centered.save(SOURCE, "PNG", optimize=True)

    for density, size in LEGACY_SIZES.items():
        folder = RES / f"mipmap-{density}"
        save_square(centered, folder / "ic_launcher.png", size)
        save_square(centered, folder / "ic_launcher_round.png", size)

    for density, size in FOREGROUND_SIZES.items():
        folder = RES / f"mipmap-{density}"
        save_square(centered, folder / "ic_launcher_foreground.png", size)

    bbox = visible_bbox(centered)
    content_center = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
    canvas_center = (centered.width / 2, centered.height / 2)
    print(f"Marca centralizada: conteúdo={content_center}, tela={canvas_center}")


if __name__ == "__main__":
    main()
