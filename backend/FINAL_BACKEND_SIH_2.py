import whisper
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Depends, HTTPException, status, Header # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext# for password hashing
from fastapi.middleware.cors import CORSMiddleware#It acts as a middle layer between frontend and backend
from pydantic import BaseModel#It is a data validation library
import nest_asyncio#To allow async calls in the main event loop
import os#For accessing environment variables
import uvicorn#Used to run the server locally
import torch#PyTorch framework for deep learning
from TTS.api import TTS#Text-to-Speech API
from fastapi.responses import FileResponse#To send audio files back to the client
import asyncio#Asynchronous programming
import gc#Garbage collector
from transformers import AutoTokenizer, AutoModelForTokenClassification#Hugging Face models for Named entity recognition(NER)
import paddleocr#provides easy-to-use APIs for text detection, recognition, and other related tasks.
import google.generativeai as genai#Google's AI platform for generative models
from elevenlabs import generate, play, set_api_key, save
from googletrans import Translator#For translating languages using Google Translate

x="iUHP24k5tW9vMIWZ-2THC5A_5HWn6uWVu0VhQU_iultlHnb2mA9cNHntVYUsigK1v3W7JG7sRL-zcWWfGRccL8LZZz5RzhKJgbzwsII=s320"

device = torch.cuda.current_device() if torch.cuda.is_available() else 'cpu'
#Checking whether GPU is available or not

hi_ocr_reader = paddleocr.PaddleOCR(lang="hi",use_gpu=True)#Setting up PaddleOCR for Hindi language
ocr_reader = paddleocr.PaddleOCR(use_gpu=True)#Default setting for English language
voice_model = whisper.load_model("large-v3",device=torch.device('cpu'))#Loading Whisper voice model

tokenizer = AutoTokenizer.from_pretrained("ai4bharat/IndicNER")#Loading tokenizer from IndicNER model
model = AutoModelForTokenClassification.from_pretrained("ai4bharat/IndicNER")#Loading NER model
del model#Freeing memory occupied by the model
port=8888#Defining port number
gc.collect()#Collecting garbage


SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TTSNER(BaseModel):#Creating a class that inherits properties of Base Model 
    text: str
    emotion: str = "Cheerful & Professional"

class FaceResponse(BaseModel):#Creating another class which will be used to send response back to the client
    prediction: bool

class FaceDetect(BaseModel):
    prediction: str


class TRANS(BaseModel):#Translation Class 
    text: str
    src_lang: str
    tgt_lang: str

# 1st shell --------------------------------------------------------->
genai.configure(api_key='AIzaSyCdVuiKqy7-Hg0N3g46Hl-uUwBD8lNAvXk')
model = genai.GenerativeModel('gemini-pro')

# 2nd shell --------------------------------------------------------->
app = FastAPI(title="SIH")

app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)#Setting up middle ware for handling cross origin resource sharing requests

@app.get("/")
async def home():
    return "SIH"

#This route is used to convert audio to text and then return the text
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):#,token: str = Header(...)):
    try:
      audio_path = "recording.mp3"
      print("filepath:",audio_path);
      with open(audio_path, "wb") as f:
          f.write(await file.read())

      # Check if the file exists
      print("filepath2:",audio_path);
      if os.path.exists(audio_path):
        # Load the audio file and perform transcription
        print("fileExist:",os.path.exists(audio_path))
        result = voice_model.transcribe(whisper.pad_or_trim(whisper.load_audio(audio_path)))
        print("Transcription successful")
        
        # Extract text and language from the transcription result
        text = result["text"]
        src_lang = result["language"]
        
        # Remove the audio file
        os.remove(audio_path)
        print("File removed")
        
        return {"text": text, "src_lang": src_lang}
      else:
        raise HTTPException(status_code=404, detail="Audio file not found")
      #return {"text": text,"src_lang":language_mapping.get(src_lang, src_lang)}
     #   return {"text": text,"src_lang":src_lang}
    except HTTPException as e:
        print("RoshttpException",e) 
        raise e
    except Exception as e:
        print("RosException",e) 
        raise HTTPException(status_code=500, detail=str(e))

#This route is used to convert text to speech    
@app.post("/labs-tts")
async def labs_tts(request: TTSNER = Body(...)):
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

#This route is used to convert given text of source language and convert it to target language (model used: google translate)
@app.post("/gtranslate")
async def gtranslate_text(request: TRANS):
    try:
        translator = Translator()
        detected_lang = translator.detect(request.text)
        translation = translator.translate(request.text, src=detected_lang.lang, dest=request.tgt_lang)
        translated_text = translation.text
        
        response_data = {
            "original_text": request.text,
            "translated_text": translated_text,
            "source_language": detected_lang.lang,
            "target_language": request.tgt_lang
        }
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#This route is used in chatbot and the question asked is answered by gemini api key call within limit of 128 words
@app.post("/gemini/")
async def gemini(request: TTSNER = Body(...)):#,token: str = Header(...)):
    try:
      result = model.generate_content(request.text+". Make the output consise and limited within 128 words.").text
      return {"text":result}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__=="__main__":
    nest_asyncio.apply()
    uvicorn.run(app,port=port)