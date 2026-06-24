import sys
sys.path.append("/opt/p-landlib/landdesk")
from IQdjs import *

from diffusers import (StableDiffusionPipeline)
from torch import (torch)

model_id = "dreamlike-art/dreamlike-diffusion-1.0"
#pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = StableDiffusionPipeline.from_pretrained(model_id)

print("Супер — модель выбрали, загрузили в пайплайн. \n")


pipe = pipe.to("cpu")

print("Try USE CPU... \n")

print("Arg: " + App.getArgs()[1]  + "\n")


images = pipe(
    #prompt = "photorealistic front view soft toy green dinosaur rex in a white T-shirt sat down behind a desk with computers and servers background is data centre",
    prompt = App.getArgs()[1],
    negative_prompt = "cut off, bad, boring background, simple background, More_than_two_legs, more_than_two_arms, (3d render), (blender model), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), ((extra arms)), ((extra legs)), mutated hands, (fused fingers), (too many fingers), ((long neck)), lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist's name",
    height = 512,
    width = 512,
    num_inference_steps = 20, #15,
    guidance_scale = 7.0, #0.2,
    num_images_per_prompt = 1
).images

#print("Array of Images done, try save \n ")

#print("type: \n")
#print(type(images[0]))
#print("\n\nend typeof\n\n")

#images[0].save("/home/lubuntu/0T1.png");

images[0].save("0T2.jpg");

print("Done! \n ")


