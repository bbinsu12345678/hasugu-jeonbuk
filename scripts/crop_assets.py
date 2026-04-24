from PIL import Image
import os

def crop_batch(input_path, output_prefix, cols, rows):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    
    img = Image.open(input_path)
    width, height = img.size
    
    tile_width = width // cols
    tile_height = height // rows
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * tile_width
            top = r * tile_height
            right = left + tile_width
            bottom = top + tile_height
            
            # Crop
            tile = img.crop((left, top, right, bottom))
            output_path = f"public/images/{output_prefix}-{count}.png"
            tile.save(output_path)
            print(f"Saved: {output_path}")
            count += 1

def convert_to_webp(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    img = Image.open(input_path)
    img.save(output_path, "WEBP", quality=90)
    print(f"Converted: {output_path}")

if __name__ == "__main__":
    # Base path for brain artifacts
    brain_path = "C:/Users/admin/.gemini/antigravity/brain/349b29d4-6e47-4fb4-a3db-7f7968a24e03"
    
    # Crop and convert avatars
    crop_batch("public/images/avatars_batch.png", "avatar", 2, 2)
    for i in range(1, 5):
        convert_to_webp(f"public/images/avatar-{i}.png", f"public/images/avatar-{i}.webp")
    
    # 1-4: Toilet, Sink, Drain, Leak (Individual high quality)
    convert_to_webp(f"{brain_path}/service_toilet_korean_1776679165749.png", "public/images/service-toilet.webp")
    convert_to_webp(f"{brain_path}/service_sink_korean_1776679180861.png", "public/images/service-sink.webp")
    convert_to_webp(f"{brain_path}/service_drain_korean_1776679192508.png", "public/images/service-drain.webp")
    convert_to_webp(f"{brain_path}/service_leak_korean_1776679208953.png", "public/images/service-leak.webp")
    
    # 5-8: Aircon, Sewage, Stormwater, Manhole (From Batch 2)
    crop_batch("public/images/service_batch2.png", "service-batch2", 2, 2)
    # Mapping Batch 2 positions to service names
    services_5_8 = ["aircon", "sewage", "stormwater", "manhole"]
    for i, name in enumerate(services_5_8):
        convert_to_webp(f"public/images/service-batch2-{i+1}.png", f"public/images/service-{name}.webp")
    
    # Cleanup PNGs if desired (optional)
