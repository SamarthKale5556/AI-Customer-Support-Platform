import os
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    try:
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY")
        print("Testing Gemini API using google-genai...")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Hello! Give me a one-word confirmation that you are working.'
        )
        print("Gemini API Successful. Response:", response.text.strip())
    except Exception as e:
        print("Gemini API Failed with 2.5, trying 1.5-flash:", e)
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents='Hello! Give me a one-word confirmation that you are working.'
            )
            print("Gemini API Successful (1.5-flash). Response:", response.text.strip())
        except Exception as e2:
            print("Gemini API Failed:", e2)

if __name__ == '__main__':
    test_gemini()
