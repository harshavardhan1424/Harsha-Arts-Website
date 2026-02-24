import shutil
import os

files = [
    ("C:/Users/Hp/.gemini/antigravity/brain/f1424399-6ed1-46ec-bcec-3894244794e7/uploaded_media_0_1769617321607.jpg", "bottle_small_design.jpg"),
    ("C:/Users/Hp/.gemini/antigravity/brain/f1424399-6ed1-46ec-bcec-3894244794e7/uploaded_media_1_1769617321607.jpg", "bottle_big_special.jpg"),
    ("C:/Users/Hp/.gemini/antigravity/brain/f1424399-6ed1-46ec-bcec-3894244794e7/uploaded_media_2_1769617321607.jpg", "bottle_small_normal.jpg")
]

for src, dest in files:
    try:
        # Normalize paths
        src = os.path.normpath(src)
        dest = os.path.normpath(dest)
        shutil.copy(src, dest)
        print(f"Copied {src} to {dest}")
    except Exception as e:
        print(f"Error copying {src}: {e}")
