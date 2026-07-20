import weaviate

client = weaviate.connect_to_local()

collection = client.collections.get("CISControls")

response = collection.query.fetch_objects(limit=1, include_vector=True)

obj = response.objects[0]

print("Properties:")
print(obj.properties)

print("\nVector:")
print(obj.vector)

client.close()