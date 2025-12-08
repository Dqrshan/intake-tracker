#!/usr/bin/env python3
"""
Test the medical AI functionality
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from ml import analyze_medical_query, format_medical_response

def test_medical_queries():
    """Test various medical queries"""
    
    test_queries = [
        "I have a headache and feel dizzy",
        "What should I eat for better nutrition?",
        "I'm experiencing chest pain",
        "How should I take my medications?",
        "I feel nauseous after eating",
        "I'm having trouble sleeping",
        "What exercises are good for me?",
        "I have diabetes, what should I know?",
        "My blood pressure is high",
        "I feel tired all the time"
    ]
    
    print("🧠 Testing Medical AI Responses\n")
    print("=" * 60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        print("-" * 40)
        
        # Analyze query
        analysis = analyze_medical_query(query)
        
        # Format response
        response = format_medical_response(analysis)
        
        print(f"Confidence: {analysis['confidence']:.2f}")
        print(f"Urgency: {analysis['urgency']}")
        print(f"Detected Symptoms: {analysis['symptoms']}")
        print(f"Detected Topics: {analysis['topics']}")
        print(f"\nResponse:\n{response}")
        print("=" * 60)

if __name__ == "__main__":
    test_medical_queries()