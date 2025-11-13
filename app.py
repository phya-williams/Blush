from flask import Flask, jsonify, request, make_response
import json
import datetime
import os

app = Flask(__name__, static_folder="web", static_url_path="", template_folder="web")

DATA_FILE = "blush_data.json"

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as file:
        json.dump({"users": {}}, file)

@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/data", methods=["GET", "POST"])
def data():
    with open(DATA_FILE, "r") as file:
        data = json.load(file)

    username = request.args.get("username", "").strip().lower()

    if request.method == "POST":
        mood = request.args.get("mood", "").strip().lower()
        if not username or not mood:
            return jsonify({"error": "Username and mood are required."}), 400

        if "users" not in data:
            data["users"] = {}

        if username not in data["users"]:
            data["users"][username] = {"moods": []}

        data["users"][username]["moods"].append({
            "mood": mood,
            "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        })

        with open(DATA_FILE, "w") as file:
            json.dump(data, file, indent=2)

        response_data = {"username": username, "moods": data["users"][username]["moods"]}
        print("📤 Sending JSON to client:", json.dumps(response_data, indent=2))

        # ✅ Explicit JSON response with headers
        response = make_response(jsonify(response_data))
        response.headers["Content-Type"] = "application/json"
        return response

    if username and username in data.get("users", {}):
        response_data = {"username": username, "moods": data["users"][username]["moods"]}
    else:
        response_data = {"username": username, "moods": []}

    response = make_response(jsonify(response_data))
    response.headers["Content-Type"] = "application/json"
    return response



if __name__ == "__main__":
    app.run(debug=True)
