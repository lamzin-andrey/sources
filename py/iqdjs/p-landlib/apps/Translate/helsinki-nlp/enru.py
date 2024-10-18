import sys
sys.path.append("/opt/p-landlib/landdesk")
from IQdjs import *
import time
from pathlib import Path

from colorama import Fore, init
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

init()

tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-ru", force_download=False, local_files_only= True)
model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-ru", force_download=False, local_files_only= True)

def translate_phrase(phrase: str) -> str:
    inputs = tokenizer(phrase, return_tensors="pt")
    output = model.generate(**inputs, max_new_tokens=100)
    out_text = tokenizer.batch_decode(output, skip_special_tokens=True)
    return out_text[0]

ruText = translate_phrase(App.getArgs()[1])
print("HNLPResultOutput: " + ruText + "/HNLPResultOutput")
