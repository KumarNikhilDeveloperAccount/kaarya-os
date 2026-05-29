import os
from huggingface_hub import login, whoami
from sentence_transformers import SentenceTransformer

print("Initializing Hugging Face integration for Kaarya OS...")
try:
    user = whoami()
    print(f"Logged in as: {user['name']}")
except Exception as e:
    print("Not logged in natively. The system can still download public models.")

print("Downloading lightweight SentenceTransformer model (all-MiniLM-L6-v2)...")
print("This model is highly optimized for systems with 8GB RAM and no GPU.")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Test it
sentences = ["Kaarya OS is an AI hiring platform.", "We are testing Hugging Face embeddings."]
embeddings = model.encode(sentences)

print(f"Success! Model loaded and generated {len(embeddings)} embeddings.")
print(f"Embedding shape: {embeddings[0].shape}")
