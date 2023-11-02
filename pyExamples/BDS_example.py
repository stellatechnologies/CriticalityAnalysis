import networkx as nx
import matplotlib.pyplot as plt

# Create a directed graph
G = nx.DiGraph()

# Define nodes and edges
nodes = [
    (1, {'label': 'Main Mission', 'color': 'red'}),
    (2, {'label': 'Sub-mission A', 'color': 'green'}),
    (3, {'label': 'Sub-mission B', 'color': 'blue'}),
    (4, {'label': 'Data 1', 'shape': 'box', 'color': 'grey'}),
    (5, {'label': 'Data 2', 'shape': 'box', 'color': 'grey'})
]

edges = [
    (1, 2),
    (1, 3),
    (2, 4),
    (3, 4),
    (2, 5)
]

G.add_nodes_from(nodes)
G.add_edges_from(edges)

# Depth and Breadth Analysis
def calculate_depth_from_root(graph, node_id, root_id=1, depth=0):
    if node_id == root_id:
        return depth
    predecessors = list(graph.predecessors(node_id))
    if not predecessors:
        return 0  # This node is not reachable from the root
    return min(calculate_depth_from_root(graph, p, root_id, depth + 1) for p in predecessors)

def calculate_breadth(graph, node_id):
    return len(list(graph.predecessors(node_id)))

criticality_scores = {}

for node_id, node_data in G.nodes(data=True):
    if node_data.get('shape') == 'box':  # only for data nodes
        depth = calculate_depth_from_root(G, node_id)
        breadth = calculate_breadth(G, node_id)
        criticality_scores[node_id] = breadth / depth if depth != 0 else 0

# Normalize the scores to a range of 1-4
max_score = max(criticality_scores.values())
min_score = min(criticality_scores.values())
normalized_scores = {}

# for node_id, score in criticality_scores.items():
#     normalized_scores[node_id] = 1 + 3 * (score - min_score) / (max_score - min_score)

# Display the normalized scores
print("Criticality Scores:")
for node_id, score in criticality_scores.items():
    print(f"{G.nodes[node_id]['label']}: {score:.2f}")

# Visualization
color_map = [G.nodes[node]['color'] for node in G.nodes]
labels = {node: G.nodes[node]['label'] for node in G.nodes}
nx.draw(G, node_color=color_map, labels=labels, with_labels=True, font_weight='bold')
plt.show()
