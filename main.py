from fastapi import FastAPI, UploadFile
import easyocr
import re

app = FastAPI()
reader = easyocr.Reader(['en'])

@app.post("/ocr")
async def ocr_image(file: UploadFile):
    img = await file.read()
    text = reader.readtext(img, detail=0)

    results = []
    for line in text:
        m = re.search(r'(\d)\s*(Red|Green|Violet)\s*(Big|Small)', line, re.I)
        if m:
            results.append({
                "num": int(m.group(1)),
                "color": m.group(2).lower(),
                "size": m.group(3)
            })
    return results
