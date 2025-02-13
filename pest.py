import cv2
import torch
from ultralytics import YOLO

# Load the pre-trained YOLOv5 model (you can replace with a custom-trained model)
model = YOLO("yolov5s.pt")  # Default YOLO model(replace with trained pest model if available)
 
# Open the laptop camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture image.")
        break

    # Run YOLOv5 on the captured frame
    results = model(frame)

    # Draw bounding boxes & labels on detected pests
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box coordinates
            conf = box.conf[0]  # Confidence score
            label = "Pest" if conf > 0.4 else "Unknown"  # Set threshold for detection

            # Draw rectangle & label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(frame, f"{label} ({conf:.2f})", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Display the output
    cv2.imshow("Pest Detection", frame)

    # Press 'q' to exit the loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
