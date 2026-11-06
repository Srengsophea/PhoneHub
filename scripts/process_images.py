import os
import sys
from PIL import Image
from collections import deque

def remove_background(img_path, output_png_path, output_jpg_path=None):
    """
    Flood fills from the 4 image borders to remove white studio background.
    Preserves inner white details (like phone screen or body highlights).
    Tightly crops and centers onto 800x800 transparent canvas.
    """
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Flood fill mask
    visited = bytearray(width * height)
    queue = deque()

    def is_bg(r, g, b, a):
        # Near-white or very light studio background
        return r > 230 and g > 230 and b > 230

    # Initialize queue with all 4 borders
    for x in range(width):
        for y in (0, height - 1):
            idx = y * width + x
            if not visited[idx]:
                visited[idx] = 1
                r, g, b, a = pixels[x, y]
                if is_bg(r, g, b, a):
                    queue.append((x, y))

    for y in range(height):
        for x in (0, width - 1):
            idx = y * width + x
            if not visited[idx]:
                visited[idx] = 1
                r, g, b, a = pixels[x, y]
                if is_bg(r, g, b, a):
                    queue.append((x, y))

    # BFS flood fill
    while queue:
        cx, cy = queue.popleft()
        pixels[cx, cy] = (0, 0, 0, 0)

        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                nidx = ny * width + nx
                if not visited[nidx]:
                    visited[nidx] = 1
                    r, g, b, a = pixels[nx, ny]
                    if is_bg(r, g, b, a):
                        queue.append((nx, ny))

    # Find bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
    else:
        cropped = img

    # Center on standard 800x800 transparent canvas with comfortable margin
    target_size = (800, 800)
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))

    # Scale cropped image to fit within 720x720 (allowing 40px padding)
    cw, ch = cropped.size
    scale = min(720 / cw, 720 / ch)
    new_w = max(1, int(cw * scale))
    new_h = max(1, int(ch * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Paste centered
    pos_x = (target_size[0] - new_w) // 2
    pos_y = (target_size[1] - new_h) // 2
    canvas.paste(resized, (pos_x, pos_y), resized)

    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    canvas.save(output_png_path, "PNG")

    if output_jpg_path:
        os.makedirs(os.path.dirname(output_jpg_path), exist_ok=True)
        # White background for JPG
        jpg_bg = Image.new("RGB", target_size, (255, 255, 255))
        jpg_bg.paste(canvas, (0, 0), canvas)
        jpg_bg.save(output_jpg_path, "JPEG", quality=95)

    print(f"Processed: {output_png_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_images.py <input_img> <output_png> [output_jpg]")
        sys.exit(1)
    in_file = sys.argv[1]
    out_png = sys.argv[2]
    out_jpg = sys.argv[3] if len(sys.argv) > 3 else None
    remove_background(in_file, out_png, out_jpg)
