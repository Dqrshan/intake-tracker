# ML Service

FastAPI service for food recognition and nutrition analysis.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Download models (optional for production):
```bash
# YOLOv8n Classification model (~6MB)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n-cls.onnx

# Custom calorie model is included as mock
```

3. Start the service:
```bash
python ml.py
# or
uvicorn ml:app --reload --port 8001
```

## API

- `POST /infer` - Upload image file, returns nutrition analysis

## Models

- **YOLOv8n-cls.onnx**: Food classification (Ultralytics AGPL license)
- **calorie.onnx**: Custom calorie estimation model (mock implementation)

The service currently uses mock data for demonstration. In production, replace with actual ONNX model inference.