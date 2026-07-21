from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017")

    # Test connection
    client.admin.command("ping")

    print("✅ MongoDB connection successful")

    print("Databases:")
    print(client.list_database_names())

except Exception as e:
    print("❌ MongoDB connection failed")
    print(e)