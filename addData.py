import json
import uuid
import random
import string

# Load data from networkData.json
with open('networkData.json') as f:
    data = json.load(f)

# Find all the nodes that have edges pointing to them
nodes_with_incoming_edges = set(edge['to'] for edge in data['edges'])

# Find all mission nodes that don't have any mission nodes feeding into them
mission_nodes_without_incoming_edges = [node for node in data['nodes'] if node['id'] not in nodes_with_incoming_edges and node['color'] != "#ffffa8"]

# Function to generate a random string of characters of length 3-4
def random_string():
    length = random.randint(3, 4)
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))

# Function to generate a new data node and edges feeding into mission nodes
def generate_data_node_and_edges(target_nodes):
    new_id = str(uuid.uuid4()).replace('-', '')
    data_node = {
        "id": new_id,
        "label": random_string(),
        "color": "#ffffa8"
    }
    new_edges = []
    for node in target_nodes:
        new_edges.append({
            "from": new_id,
            "to": node['id'],
            "arrows": "to",
            "id": str(uuid.uuid4())
        })
    return data_node, new_edges

# Generate 10 data nodes and their edges
for _ in range(10):
    # Randomly choose between 1 to 4 mission nodes for the data node to connect to
    chosen_mission_nodes = random.sample(mission_nodes_without_incoming_edges, random.randint(1, 4))
    data_node, edges = generate_data_node_and_edges(chosen_mission_nodes)
    data['nodes'].append(data_node)
    data['edges'].extend(edges)

# Print updated data
print(json.dumps(data, indent=2))

# Write updated data to file
with open('networkData.json', 'w') as f:
    json.dump(data, f, indent=2)
