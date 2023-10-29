import json
import uuid
import random
import string

# Load data from networkData.json
with open('networkData.json') as f:
    data = json.load(f)

missions = data['Mission']
mission_hierarchy = data['MissionHierarchy']

# Find all missions that have parent missions
missions_with_parent = set(mh['ChildMission'] for mh in mission_hierarchy)

# Find all missions that don't have any parent missions
missions_without_parent = [mission for mission in missions if mission['UUID'] not in missions_with_parent]

# Function to generate a random string of characters of length 3-4
def random_string():
    length = random.randint(3, 4)
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

# Function to generate a new data node and hierarchy entries feeding into mission nodes
def generate_data_node_and_hierarchy(target_missions):
    new_uuid = str(uuid.uuid4())
    data_node = {
        "UUID": new_uuid,
        "Name": random_string(),
        "Description": ""
    }
    new_hierarchy = []
    for mission in target_missions:
        new_hierarchy.append({
            "ParentMission": new_uuid,
            "ChildMission": mission['UUID']
        })
    return data_node, new_hierarchy

# Generate 10 data nodes and their hierarchy
for _ in range(10):
    if missions_without_parent:
        # Randomly choose between 1 to 4 mission nodes for the data node to connect to
        num_missions = min(random.randint(1, 4), len(missions_without_parent))
        chosen_missions = random.sample(missions_without_parent, num_missions)
        data_node, hierarchy = generate_data_node_and_hierarchy(chosen_missions)
        data['OperationalData'].append(data_node)
        data['MissionHierarchy'].extend(hierarchy)

# Print updated data
print(json.dumps(data, indent=2))

# Write updated data to file
with open('networkData.json', 'w') as f:
    json.dump(data, f, indent=2)
