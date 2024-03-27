import json
import networkx as nx
from collections import deque

# Load JSON data from file
with open('data.json', 'r') as file:
    data = json.load(file)

# Create a directed graph
G = nx.DiGraph()

# Parse missions and operational data into nodes, tag them appropriately
missions = [(mission['UUID'], {'label': mission['Name'], 'type': 'Mission', 'color': 'red'}) for mission in data['Mission']]
operational_data = [(op_data['UUID'], {'label': op_data['Name'], 'type': 'OperationalData', 'color': 'grey'}) for op_data in data['OperationalData']]
G.add_nodes_from(missions + operational_data)

# Parse mission hierarchy and operational data links into edges
mission_hierarchy_edges = [(hierarchy['ParentMission'], hierarchy['ChildMission']) for hierarchy in data['MissionHierarchy']]
mission_operational_data_edges = [(association['Mission'], association['OperationalData']) for association in data['Mission_OperationalData']]
G.add_edges_from(mission_hierarchy_edges + mission_operational_data_edges)

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

# Identify the root mission (mission of interest)
all_child_missions = set(hierarchy['ChildMission'] for hierarchy in data['MissionHierarchy'])
root_mission_uuid = next(mission['UUID'] for mission in data['Mission'] if mission['UUID'] not in all_child_missions)

# Calculate adjusted scores for data nodes in the dependencies
dependencies = get_all_dependencies(G, root_mission_uuid)
unique_dependencies = set(dependencies)

adjusted_scores = {}
total_adjusted_score = 0

# Filter nodes based on whether they come from the OperationalData list
for node_id in unique_dependencies:
    if G.nodes[node_id].get('type') == 'OperationalData':
        path_length = len(find_shortest_path(G, root_mission_uuid, node_id))
        adjusted_score = adjust_score_for_path_length(G.nodes[node_id]['pageRank'], path_length)
        adjusted_scores[node_id] = adjusted_score
        total_adjusted_score += adjusted_score

# Normalize the adjusted scores to lie in [0,1]
for node_id in adjusted_scores:
    adjusted_scores[node_id] /= total_adjusted_score

# Print the normalized importance scores for data types
print("Importance Scores for Root Mission:")
for node_id, score in adjusted_scores.items():
    print(f"{G.nodes[node_id]['label']}: {score:.4f}")
