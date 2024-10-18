import sys
import time
from pathlib import Path

from colorama import Fore, init
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

init()

#tokenizer = AutoTokenizer.from_pretrained(Path.cwd() / 'model' / 'en-ru-local')
#model = AutoModelForSeq2SeqLM.from_pretrained(Path.cwd() / 'model' / 'en-ru-local')


#print(Path.cwd());

#tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-ru")
#model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-ru")

tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-ru-en")
model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-ru-en")

def translate_phrase(phrase: str) -> str:
    """
    Перевод фраз из файла, вывод перевода в терминал.
    Функция возвращает переведенную фразу.
    """
    inputs = tokenizer(phrase, return_tensors="pt")
    output = model.generate(**inputs, max_new_tokens=100)
    out_text = tokenizer.batch_decode(output, skip_special_tokens=True)
    #print(f'\r{Fore.YELLOW}   {out_text[0]}', end="")
    return out_text[0]

enText = translate_phrase("Кот оседлал белого кролика и едет на нём, мило, сказочно.")
print("Result: " + enText)
