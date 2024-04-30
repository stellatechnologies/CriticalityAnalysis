import json
import uuid
import random

# load data from networkData.json
with open('networkData.json') as f:
    data = json.load(f)

missions = data['Mission']
mission_hierarchy = data['MissionHierarchy']

# Find all missions that have Child missions
mission_with_children = set(mh['ParentMission'] for mh in mission_hierarchy)

# Find all missions that don't have any Child missions
missions_without_children = [mission for mission in missions if mission['UUID'] not in mission_with_children]


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
            "ParentMission": target_mission['UUID'],
            "ChildMission": new_uuid
        })
    return new_missions, new_hierarchy

# Generate new missions and mission hierarchy
for mission in missions_without_children:
    # Choose a random number of new missions to create
    new_missions_count = random.choice([0, 2, 3])
    if new_missions_count:
        missions, hierarchy = generate_new_missions_and_hierarchy(mission, new_missions_count)
        data['Mission'].extend(missions)
        data['MissionHierarchy'].extend(hierarchy)

# Print the number of missions
print(f"Number of missions: {len(data['Mission'])}")

# Write updated data to file
with open('networkData.json', 'w') as f:
    json.dump(data, f, indent=2)
