from flask import Flask, request
import subprocess, requests, os

app = Flask(__name__)

BOT_TOKEN = "7574745434:AAHC7KhZqBAS3NN0oDFj3Ijya-EvNpnkdpo"
CHANNEL_ID = "@eshgheabadi"

@app.route("/upload", methods=["POST"])
def upload():
    data = request.json
    video_id = data.get("videoId")
    title = data.get("title")

    url = f"https://youtube.com/watch?v={video_id}"

    caption = f"""{title}

@eshgheabadi 👈

📥 (اگر در پخش صدا یا تصویر مشکل داشتید از پخش‌کننده خارجی مانند VLC یا MX Player استفاده کنید)

#eshgheabadi #عشق_ابدی #جزیره_عشق_ابدی #eshghabadiofficial"""

    # دانلود ویدیو با yt-dlp
    filename = "video.mp4"
    subprocess.run([
        "yt-dlp", "-f", "best[height<=480][ext=mp4]",
        "-o", filename, url
    ])

    # آپلود به تلگرام
    with open(filename, "rb") as video:
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo",
            data={"chat_id": CHANNEL_ID, "caption": caption},
            files={"video": video}
        )

    os.remove(filename)
    return {"status": "done"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
