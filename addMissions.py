import json
import uuid
import random

# load data from networkData.json
with open('networkData.json') as f:
    data = json.load(f)

missions = data['Mission']
mission_hierarchy = data['MissionHierarchy']

# Find all missions that have parent missions
missions_with_parent = set(mh['ChildMission'] for mh in mission_hierarchy)

# Find all missions that don't have any parent missions
missions_without_parent = [mission for mission in missions if mission['UUID'] not in missions_with_parent]

# Function to generate new missions and mission hierarchy entries feeding into a mission
def generate_new_missions_and_hierarchy(target_mission, count):
    new_missions = []
    new_hierarchy = []
    base_name = target_mission['Name']
    # Reset the next name suffix for each mission
    next_name_suffix = 1
    for i in range(count):
        name = f"{base_name}.{next_name_suffix + i}"
        new_uuid = str(uuid.uuid4())
        new_missions.append({
            "UUID": new_uuid,
            "Name": name,
            "Description": ""
        })
        new_hierarchy.append({
            "ParentMission": new_uuid,
            "ChildMission": target_mission['UUID']
        })
    return new_missions, new_hierarchy

# Generate new missions and mission hierarchy
for mission in missions_without_parent:
    # Choose a random number of new missions to create
    new_missions_count = random.choice([0, 2, 3])
    if new_missions_count:
        missions, hierarchy = generate_new_missions_and_hierarchy(mission, new_missions_count)
        data['Mission'].extend(missions)
        data['MissionHierarchy'].extend(hierarchy)

# Print updated data
print(json.dumps(data, indent=2))

# Write updated data to file
with open('networkData.json', 'w') as f:
    json.dump(data, f, indent=2)
