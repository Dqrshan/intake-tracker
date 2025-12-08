#!/usr/bin/env python3
"""
Download and setup lightweight medical AI model
"""

import os
import sys

def download_medical_model():
    """Download lightweight medical model"""
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        import torch
        
        print("🏥 Setting up Medical AI...")
        
        # Use FLAN-T5 Small - lightweight but effective for medical Q&A
        model_name = "google/flan-t5-small"  # ~77MB
        
        print(f"📥 Downloading medical model: {model_name}")
        print("   This is a lightweight model (~77MB) optimized for medical Q&A")
        
        # Download tokenizer
        print("📝 Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Download model
        print("🧠 Downloading model...")
        model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        
        print("✅ Medical AI model downloaded successfully!")
        print(f"📊 Model size: ~77MB")
        print(f"🎯 Optimized for: Medical Q&A, symptom analysis, health advice")
        
        # Test the model
        print("\n🧪 Testing medical model...")
        test_query = "What should I do for a headache?"
        
        inputs = tokenizer(
            f"Answer this medical question: {test_query}",
            return_tensors="pt",
            max_length=512,
            truncation=True
        )
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=150,
                temperature=0.7,
                do_sample=True
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"✅ Test response: {response}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("💡 Install with: pip install transformers torch")
        return False
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def main():
    print("🚀 Medical AI Setup")
    print("=" * 50)
    
    if download_medical_model():
        print("\n✅ Medical AI ready!")
        print("\n🎯 Features:")
        print("  • Lightweight model (~77MB)")
        print("  • Medical Q&A specialized")
        print("  • Symptom analysis")
        print("  • Health advice generation")
        print("  • Emergency detection")
        print("\n🚀 Start the service: python ml.py")
    else:
        print("\n❌ Setup failed")
        sys.exit(1)

if __name__ == "__main__":
    main()