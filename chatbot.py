from flask import Flask, request

app = Flask(name)

@app.route('/', methods=["POST", "GET"])
def webhook():
    if request.method == "GET":
        return "Not connected to DF."
    elif request.method == "POST":
        try:
            payload = request.json
            user_response = payload.get('queryResult', {}).get('queryText', '')
            bot_response = payload.get('queryResult', {}).get('fulfillmentText', '')

            if user_response or bot_response:
                print("User: " + user_response)
                print("Bot: " + bot_response)
            
            response_message = f"User: {user_response}\nBot: {bot_response}"
            return response_message
        except ValueError:
            return "Invalid JSON data received."    
    else:
        print(request.data)
        return "200"

if name == 'main':
    app.run(debug=True)