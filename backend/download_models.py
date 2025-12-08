#!/usr/bin/env python3
"""
Download YOLOv8 classification model for food recognition
"""

import os
import urllib.request
import sys

def download_yolo_model():
    """Download YOLOv8n classification model"""
    model_url = "https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n-cls.pt"
    model_path = "yolov8n-cls.pt"
    
    if os.path.exists(model_path):
        print(f"✅ {model_path} already exists")
        return True
    
    print(f"📥 Downloading YOLOv8n classification model...")
    print(f"URL: {model_url}")
    
    try:
        urllib.request.urlretrieve(model_url, model_path)
        print(f"✅ Downloaded {model_path} ({os.path.getsize(model_path) / 1024 / 1024:.1f} MB)")
        
        # Convert to ONNX format
        try:
            from ultralytics import YOLO
            model = YOLO(model_path)
            model.export(format='onnx', optimize=True)
            print("✅ Converted to ONNX format with INT8 quantization")
        except ImportError:
            print("⚠️ ultralytics not installed. Install with: pip install ultralytics")
            print("   Manual conversion needed: model.export(format='onnx')")
        
        return True
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return False

def main():
    print("🚀 Setting up AI models for food recognition...")
    
    if download_yolo_model():
        print("\n✅ Model setup complete!")
        print("\nNext steps:")
        print("1. Install ultralytics: pip install ultralytics")
        print("2. Convert model: python -c \"from ultralytics import YOLO; YOLO('yolov8n-cls.pt').export(format='onnx', int8=True)\"")
        print("3. Start ML service: python ml.py")
    else:
        print("\n❌ Model setup failed")
        sys.exit(1)

if __name__ == "__main__":
    main()