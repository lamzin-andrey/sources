# Никуда не подключать, просто открыть в IDE для подсказок.
class OpenAIChatCompletionClient:
	def __init__(self, model, api_key, base_url, api_type, temperature:float, timeout: int, max_tokens: int, model_info = None):
		return 0

def ModelInfoVendorEnum(openai, ollama, anthropic, cohere, custom):
	return 0;

def ModelInfoFamilyEnum(gpt, claude, llama, mistral, unknown, gemma):
	return 0;

# ## ===== ==== ====

class RoundRobinGroupChat:
	def __init__(self, participants:list, max_turns:int = 20):
		return 0
		
	def run(sekf, task, timeout:int):
		return 0;

class AssistantAgent:
	def __init__(self, name, model_client:OpenAIChatCompletionClient, system_message:StringOrArrayOfDict, tools:listOfCallable, reflect_on_tool_use, description, model_context, workbench, handoffs, max_tool_iterations, output_content_type, memory):
		return 0;
#human_input_mode = "NEVER", # TODO enum
#tools:ListOfDict, # TODO Enum, Enum
#tool_choice:ListOfMixed="auto", # TODO Enum, Enum
#code_execution_config:dict, # TODO createF
    
		# =========== СИСТЕМНЫЕ СООБЩЕНИЯ ===========
		#system_message="""Ты аналитик. Твоя задача..."""
		
		# Альтернатива: можно задавать через список сообщений
		#system_message=[
		#	{"role": "system", "content": "Ты опытный аналитик."},
		#	{"role": "system", "content": "Отвечай на русском языке."},
		#]
    
		# =========== НАСТРОЙКИ МОДЕЛИ ===========
		#model="gpt-4o"  # Явное указание модели (переопределяет model_client)
		#model_kwargs={  # Дополнительные параметры для модели
		#	"temperature": 0.1,
		#	"max_tokens": 1000,
		#	"top_p": 0.9,
		#	"frequency_penalty": 0.0,
		#	"presence_penalty": 0.0,
		#	"stop": ["\n\n", "###"],  # Стоп-последовательности
		#}
    
		# =========== ОГРАНИЧЕНИЯ И ТАЙМАУТЫ ===========
		#max_consecutive_auto_reply=5  # Макс авто-ответов подряд (0 = отключено)
		#human_input_mode="NEVER"  # Когда запрашивать ввод человека:
        #                       # "ALWAYS", "NEVER", "TERMINATE"
    
		# =========== РЕАКЦИИ НА СОБЫТИЯ ===========
		#on_receive_message=lambda msg: print(f"Получено: {msg}")  # При получении
		#on_send_message=lambda msg: print(f"Отправлено: {msg}")   # При отправке
    
		# =========== ИНСТРУМЕНТЫ (FUNCTIONS/TOOLS) ===========
		#tools=[  # Список инструментов, которые может использовать агент
		#	{
		#		"type": "function",
		#		"function": {
		#			"name": "search_files",
	#				"description": "Поиск файлов в директории",
	#				"parameters": {...}
	#			}
	#		}
	#	]
		#tool_choice="auto"  # Как выбирать инструменты:
        #                 # "auto", "none", {"type": "function", "function": {"name": "..."}}
    #
	#	# =========== КЕШИРОВАНИЕ ===========
		#cache_seed=None  # Seed для детерминированного кеширования
		#cache=None  # Объект кеша (например, RedisCache)
    #
		# =========== ОБРАБОТКА ОШИБОК ===========
		#retry_wait_seconds=5  # Пауза перед повторной попыткой при ошибке
		#max_retries=3  # Максимальное количество повторных попыток
    
		# =========== ИНТЕРФЕЙС ПОЛЬЗОВАТЕЛЯ ===========
		#ui=Console()  # Интерфейс для взаимодействия (консоль, веб и т.д.)
    
		# =========== РАСШИРЕННЫЕ НАСТРОЙКИ ===========
		#code_execution_config={  # Конфигурация выполнения кода (если поддерживается)
		#	"work_dir": "coding",
		#	"use_docker": False,
		#	"timeout": 30,
		#}
		# Для поддержки файлов и документов
		#document_manager=None  # Менеджер документов
		# Настройки форматирования
		#message_formatter=None  # Кастомный форматтер сообщений
		# Оптимизация стоимости
		#optimize_cost=False  # Включить оптимизацию стоимости запросов
