# Удобное создание modelInfo
def createModelInfo(model_name, context_window:int, supports_function_calling: bool, supports_vision: bool, vision: bool, function_calling: bool, json_output: bool, max_tokens:int, family, structured_output:bool, vendor="ollama"):
	return {
		"model_name": model_name,
		"vendor": vendor,
		"context_window": context_window,
		"supports_function_calling": supports_function_calling,
		"supports_vision": supports_vision,
		"function_calling": function_calling,
		"vision": vision,
		"json_output": json_output,
		"max_tokens": max_tokens,
		"family": family,
		"structured_output": structured_output
	}
	
def createDefaultOllamaModelInfo(model_name):
	return {
		"model_name": model_name,
		"vendor": "ollama",
		"context_window": 4096,
		"supports_function_calling": False,
		"function_calling": False,
		"supports_vision": False,
		"vision": False,
		"json_output": False,
		"max_tokens": 4096,
		"family": "unknown",
		"structured_output": False
	}
	
def createToolsOllamaModelInfo(model_name):
	return {
		"model_name": model_name,
		"vendor": "ollama",
		"context_window": 4096,
		"supports_function_calling": True,
		"function_calling": True,
		"supports_vision": False,
		"vision": False,
		"json_output": False,
		"max_tokens": 4096,
		"family": "unknown",
		"structured_output": False
	}
	
def saveAutogenResponse(_file, response):
	if hasattr(response, "messages") and response.messages:
		with open(_file, 'w', encoding = 'UTF-8') as f:
			for i, msg in enumerate(response.messages):
				if hasattr(msg, "source"):
					f.write(f"Agent {msg.source}:\n{msg.content}\n====\n\n")
			f.close()
