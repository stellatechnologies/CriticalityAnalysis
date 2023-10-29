import json
import uuid
import random

# load data from networkData.json
with open('networkData.json') as f:
    data = json.load(f)

# Find all the nodes that have edges pointing to them
nodes_with_incoming_edges = set(edge['to'] for edge in data['edges'])

# Find all nodes that don't have any nodes feeding into them
nodes_without_incoming_edges = [node for node in data['nodes'] if node['id'] not in nodes_with_incoming_edges]

# Function to generate new nodes and edges feeding into a node
def generate_new_nodes_and_edges(target_node, count):
    new_nodes = []
    new_edges = []
    base_label = target_node['label']
    # Determine the next label based on the target node's label
    next_label = int(base_label.split('.')[-1]) + 1
    for i in range(count):
        label = f"{base_label}.{next_label + i}"
        new_id = str(uuid.uuid4()).replace('-', '')
        new_nodes.append({
            "id": new_id,
            "label": label,
            "color": "#a79aff"
        })
        new_edges.append({
            "from": new_id,
            "to": target_node['id'],
            "arrows": "to",
            "id": str(uuid.uuid4())
        })
    return new_nodes, new_edges

# Generate new nodes and edges
for node in nodes_without_incoming_edges:
    # Choose a random number of new nodes to create
    new_nodes_count = random.choice([0, 2, 3])
    if new_nodes_count:
        nodes, edges = generate_new_nodes_and_edges(node, new_nodes_count)
        data['nodes'].extend(nodes)
        data['edges'].extend(edges)

# Print updated data
print(json.dumps(data, indent=2))

# Write updated data to file
with open('networkData.json', 'w') as f:
    json.dump(data, f, indent=2)
