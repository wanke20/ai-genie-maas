""""
Here are the models available right now:
gpt-4o
gpt-4o-mini
llama-3.3-70b-instruct
Phi-4
claude-3-7-sonnet-20250219
 
--- sample code ---
""" 
 
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

endpoint = os.getenv("AZURE_ENDPOINT")
subscription_key = os.getenv("AZURE_SUBSCRIPTION_KEY")
api_version = os.getenv("AZURE_API_VERSION")

client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

deployments = [
    "claude-3-7-sonnet-20250219", 
    "gpt-4o", 
    "gpt-4o-mini"
]

message_histories = {
    model_name: [
        {"role": "system", "content": "You are a helpful assistant."}
    ]
    for model_name in deployments
}

while True:
    try:
        user_input = input("You: ")
        if user_input.lower() in {"exit", "quit"}:
            print("Exiting chat.")
            break

        for history in message_histories.values():
            history.append({"role": "user", "content": user_input})

        for model_name in deployments:
            try:
                response = client.chat.completions.create(
                    messages=message_histories[model_name],
                    max_tokens=200,
                    temperature=1.0,
                    top_p=1.0,
                    model=model_name
                )
                reply = response.choices[0].message.content
                print(f"\n[{model_name}]: {reply}")
                message_histories[model_name].append({"role": "assistant", "content": reply})
            except Exception as model_error:
                print(f"\n[{model_name}]: Error - {model_error}")

    except KeyboardInterrupt:
        print("\nExiting chat.")
        break
    except Exception as e:
        print("Unexpected error:", e)
