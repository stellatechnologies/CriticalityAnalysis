import networkx as nx
import matplotlib.pyplot as plt
from collections import deque

# Create a directed graph
G = nx.DiGraph()

# Define nodes and edges
nodes = [
    (1, {'label': 'Main Mission', 'color': 'red'}),
    (2, {'label': 'Sub-mission A', 'color': 'green'}),
    (3, {'label': 'Sub-mission B', 'color': 'green'}),
    (6, {'label': 'Sub-mission C', 'color': 'green'}),
    (4, {'label': 'Data 1', 'shape': 'box', 'color': 'grey'}),
    (5, {'label': 'Data 2', 'shape': 'box', 'color': 'grey'})
]

edges = [
    (1, 2),
    (1, 3),
    (1, 6),
    (2, 4),
    (3, 4),
    (2, 5)
]

G.add_nodes_from(nodes)
G.add_edges_from(edges)

# Calculate PageRank
page_rank = nx.pagerank(G, alpha=0.85)

# Update nodes with PageRank
for n in G.nodes:
    G.nodes[n]['pageRank'] = page_rank[n]

# Function to find the shortest path
def find_shortest_path(graph, start, end):
    visited = set()
    queue = deque([[start]])
    
    while queue:
        path = queue.popleft()
        node = path[-1]
        
        if node == end:
            return path
        
        if node not in visited:
            visited.add(node)
            neighbors = graph.successors(node)
            
            for neighbor in neighbors:
                new_path = list(path)
                new_path.append(neighbor)
                queue.append(new_path)
    
    return []

# Function to adjust score for path length
def adjust_score_for_path_length(score, path_length):
    return score / path_length if path_length > 0 else 0

# Function to get all dependencies
def get_all_dependencies(graph, node_id):
    direct_dependencies = list(graph.successors(node_id))
    all_dependencies = set(direct_dependencies)
    
    for dep_node_id in direct_dependencies:
        all_dependencies.update(get_all_dependencies(graph, dep_node_id))
    
    return list(all_dependencies)

# Calculate adjusted scores for data nodes in the dependencies
mission_of_interest_id = 1
dependencies = get_all_dependencies(G, mission_of_interest_id)
unique_dependencies = set(dependencies)

adjusted_scores = {}
total_adjusted_score = 0

for node_id in unique_dependencies:
    if 'shape' in G.nodes[node_id] and G.nodes[node_id]['shape'] == 'box':
        path_length = len(find_shortest_path(G, mission_of_interest_id, node_id))
        adjusted_score = adjust_score_for_path_length(G.nodes[node_id]['pageRank'], path_length)
        adjusted_scores[node_id] = adjusted_score
        total_adjusted_score += adjusted_score

# Normalize the adjusted scores to lie in [0,1]
for node_id in adjusted_scores:
    adjusted_scores[node_id] /= total_adjusted_score

# Print the normalized importance scores for data types
print("Importance Scores for Main Mission:")
for node_id, score in adjusted_scores.items():
    print(f"{G.nodes[node_id]['label']}: {score:.4f}")

# Visualization
color_map = [G.nodes[node]['color'] for node in G.nodes]
labels = {node: G.nodes[node]['label'] for node in G.nodes}
nx.draw(G, node_color=color_map, labels=labels, with_labels=True, font_weight='bold')
plt.show()
