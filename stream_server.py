import cv2
import torch
from ultralytics import YOLO
from flask import Flask, Response, jsonify
import threading

app = Flask(__name__)

# Load the trained YOLO model (Replace "yolov5s.pt" with your trained pest detection model)
model = YOLO("yolov5su.pt")

pest_count = 0  # Global variable to store the number of detected pests

def generate_frames():
    global pest_count
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run YOLO model on the frame
        results = model(frame)

        detected_pests = 0  # Reset pest count

        # Draw bounding boxes & count pests
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = box.conf[0]
                label = "Pest" if conf > 0.4 else "Unknown"

                if label == "Pest":
                    detected_pests += 1

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"{label} ({conf:.2f})", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Update global pest count
        pest_count = detected_pests

        # Convert frame to JPEG format
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/pest_count', methods=['GET'])
def get_pest_count():
    return jsonify({"pest_count": pest_count})

def run_flask():
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()
