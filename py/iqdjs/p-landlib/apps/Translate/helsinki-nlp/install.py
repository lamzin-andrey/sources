# https://codeby.net/threads/perevodim-tekst-s-pomoschju-predobuchennoj-modeli-transformers-hugging-face-i-python.81875/

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_name = "Helsinki-NLP/opus-mt-ru-en"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

tokenizer.save_pretrained(Path.cwd() / 'model' / 'ru-en-local')
model.save_pretrained(Path.cwd() / 'model' / 'ru-en-local')
