from TTS.api import TTS
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import torch
from transformers import AutoTokenizer, VitsModel
from pydantic import BaseModel
import nest_asyncio
import os
import asyncio
from fastapi.responses import FileResponse
import uvicorn
from fastapi.responses import JSONResponse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import time
import re
from typing import List
from elevenlabs import generate, play, set_api_key, save
from googletrans import Translator

device = torch.cuda.current_device() if torch.cuda.is_available() else 'cpu'
tts = TTS('tts_models/en/jenny/jenny').to(device)
model = MBartForConditionalGeneration.from_pretrained("facebook/mbart-large-50-many-to-many-mmt")
tokenizer = MBart50TokenizerFast.from_pretrained("facebook/mbart-large-50-many-to-many-mmt")

tam_model = VitsModel.from_pretrained("facebook/mms-tts-tam")
tam_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-tam")

guj_model = VitsModel.from_pretrained("facebook/mms-tts-guj")
guj_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-guj")
port = 8888

account_sid = "AC1966edb3d61979843cd38183dfcf8cb0"
auth_token = "b33d7f9292aea9e8c78cd034eb7bf6ed"
twilio_number = '+12059973367'

chrome_options = Options()
chrome_options.add_argument('--headless')  # Optional: Run Chrome in headless mode (no GUI)
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

chrome_options.binary_location = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

class TTSNER(BaseModel):
    text: str
    emotion: str = "Cheerful & Professional"

class TRANS(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

class TrainData1(BaseModel):
    train_name: List[str]
    train_no: List[str]
    total_votes: List[str]
    cleanliness: List[str]
    punctuality: List[str]
    food: List[str]
    ticket: List[str]
    safety: List[str]

class TrainData2(BaseModel):
    Type: List[str]
    Zone: List[str]
    From: List[str]
    PFfrom: List[str]
    Dep: List[str]
    AvgDelay: List[str]
    To: List[str]
    PFto: List[str]
    Arr: List[str]

class INFO(BaseModel):
    station_1: str
    station_2: str

class TrainSchedule(BaseModel):
    train_name: str
    platform_number: str
    departure_time: str
    train_no: str

# Second shell started from here---------------------------------------------------------------->

#It is used to call perform_search_util and fetch useful data from it
def extract_text_and_links(html_string):
    clean_text = []

    train_data1 = {
        "train_name": [],
        "train_no": [],
        "total_votes": [],
        "cleanliness": [],
        "punctuality": [],
        "food": [],
        "ticket": [],
        "safety": [],
    }

    train_data2 = {
        "Type": [],
        "Zone": [],
        "From": [],
        "PFfrom": [],
        "Dep": [],
        "AvgDelay": [],
        "To": [],
        "PFto": [],
        "Arr": [],
    }

    # Find all occurrences of text inside <div> tags
    matches = re.findall(r'<div.*?>(.*?)</div>', html_string, re.DOTALL)

    # Append each match to the clean_text list
    clean_text.extend(matches)
    # Remove unnecessary elements
    clean_text = clean_text[20:]

    name_pattern = r'title1="([^"]*)"'
    lengths = []
    votes_pattern = r'\((\d+) votes\)'
    votes_patter2 = r'\((\d+)\)'
    for i in range(0, len(clean_text)):
        if clean_text[i] == '':
            lengths.append(i)
    j=0
    while j<len(lengths) and j<5:  # Adjusted the loop range
        the_rest = []  # Moved inside the loop to reset for each segment
        for i in range(lengths[j], lengths[j + 1], 1):
            if "title1" in clean_text[i]:
                train_data1["train_name"].append(re.search(name_pattern, clean_text[i]).group(1))
                train_data1["train_no"].append(clean_text[i][-5:])
            elif "votes" in clean_text[i]:
                train_data1["total_votes"].append(re.search(votes_pattern,clean_text[i]).group(1))
            elif "cleanliness" in clean_text[i]:
                train_data1["cleanliness"].append(re.search(votes_patter2,clean_text[i]).group(1))
            elif "punctuality" in clean_text[i]:
                train_data1["punctuality"].append(re.search(votes_patter2,clean_text[i]).group(1))
            elif "food" in clean_text[i]:
                train_data1["food"].append(re.search(votes_patter2,clean_text[i]).group(1))
            elif "ticket" in clean_text[i]:
                train_data1["ticket"].append(re.search(votes_patter2,clean_text[i]).group(1))
            elif "safety" in clean_text[i]:
                train_data1["safety"].append(re.search(votes_patter2,clean_text[i]).group(1))
            else:
                if len(clean_text[i]) <= 6:
                    the_rest.append(clean_text[i])
        j += 1

        # Check if the_rest list has enough elements before accessing them
        if len(the_rest) >= len(train_data2):
            k = 1
            for keys in train_data2.keys():
                train_data2[keys].append(the_rest[k])
                k += 1
    return train_data1, train_data2

#It is called for get_train_details route and it goes on this url(https://indiarailinfo.com/) and then do 
# webscraping and fetch the data
def perform_search_util(station_1, station_2):

    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://indiarailinfo.com/")
    from_station = driver.find_element(By.XPATH, '//input[@placeholder="from station"]')
    from_station.clear()
    from_station.send_keys(station_1 + Keys.DOWN + Keys.ENTER)
    time.sleep(2)
    driver.find_element(By.XPATH, '//div[@class="list showslow"]/table/tbody/tr').click()



    to_station = driver.find_element(By.XPATH, '//input[@placeholder="to station"]')
    to_station.clear()
    to_station.send_keys(station_2 + Keys.DOWN+ Keys.ENTER)
    time.sleep(1)
    driver.find_element(By.XPATH, '//div[@class="list showslow"]').click()

    # Get the HTML content of the div with class "srhres newbg inline alt"
    driver.find_element(By.XPATH, '//div[@id="SrhDiv"]').click()
    try:
        div_content = driver.find_element(By.XPATH, "//div[@class ='srhres newbg inline alt']").get_attribute("outerHTML")
    except:
        return "No Trains Found"
    trian_data1,train_data2 = extract_text_and_links(div_content)
    driver.quit()
    return trian_data1, train_data2

# Shell 5 ----------------------------------------------------------->

app = FastAPI(title="SIH")

app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
) 

@app.get("/")
async def home():
    return "SIH"

#This route is used to convert given text of source language and convert it to target language (model used: mbart-large-50-many-to-many-mmt)
@app.post("/translate")
async def translate_text(request: TRANS):
    tokenizer.src_lang = request.src_lang
    encoded_text = tokenizer(request.text, return_tensors="pt")
    src_lang_code = tokenizer.lang_code_to_id[request.src_lang]
    tgt_lang_code = tokenizer.lang_code_to_id[request.tgt_lang]
    generated_tokens = model.generate(
        **encoded_text,
        forced_bos_token_id=tgt_lang_code,
    )
    translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    return {"translated_text": translated_text}

#This route is used to convert given text of source language and convert it to target language (model used: google translate)
@app.post("/gtranslate")
async def gtranslate_text(request: TRANS):
    try:
        translator = Translator()
        translation = translator.translate(request.text, src=request.src_lang, dest=request.tgt_lang)
        translated_text = translation.text
        
        response_data = {
            "original_text": request.text,
            "translated_text": translated_text,
            "source_language": translation.src,
            "target_language": translation.dest
        }
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
#This route is used to get train details between station1 and station2     
@app.post("/get_train_data")
async def perform_search(request: INFO):
    # Call your existing function to get train data
    train_data1, train_data2 = perform_search_util(request.station_1, request.station_2)

    # Create instances of the Pydantic models
    response_train_data1 = TrainData1(**train_data1)
    response_train_data2 = TrainData2(**train_data2)

    # Return the data as JSON
    data = {"train_data1": jsonable_encoder(response_train_data1), "train_data2": jsonable_encoder(response_train_data2)}
    return JSONResponse(content=data)

#This route is used to convert text to speech
@app.post("/speak")
async def speak(request: TTSNER = Body(...)):
    try:
      out = "voice.mp3"
      async def remove():
          loop = asyncio.get_event_loop()
          await loop.run_in_executor(None, lambda: os.remove(out))
      audio = generate(
        text=request.text,
        voice="Paul",
        model="eleven_multilingual_v1"
      )
      save(audio,out)
      return FileResponse(out,headers={"Content-Disposition":f"attachment; filename={out}"},background=remove)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__=="__main__":
    nest_asyncio.apply()
    uvicorn.run(app,port=port)