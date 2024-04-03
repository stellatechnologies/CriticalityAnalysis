import pandas as pd

from flask import Flask, request, jsonify
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
from collections import deque
from datetime import datetime
import os
import json




def generate_filename(prefix, extension):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    directory = 'saved_files'
    if not os.path.exists(directory):
        os.makedirs(directory)
    filename = f"{prefix}_{timestamp}.{extension}"
    return os.path.join(directory, filename)

# Read json file
data = json.load(open('data.json'))

G = nx.DiGraph()

missions = [(mission['UUID'], {'label': mission['Name'], 'type': 'Mission', 'color': 'red'}) for mission in data['Mission']]
operational_data = [(op_data['UUID'], {'label': op_data['Name'], 'type': 'OperationalData', 'color': 'grey'}) for op_data in data['OperationalData']]
G.add_nodes_from(missions + operational_data)

mission_hierarchy_edges = [(hierarchy['ParentMission'], hierarchy['ChildMission']) for hierarchy in data['MissionHierarchy']]
mission_operational_data_edges = [(association['Mission'], association['OperationalData']) for association in data['Mission_OperationalData']]
G.add_edges_from(mission_hierarchy_edges + mission_operational_data_edges)

page_rank = nx.pagerank(G, alpha=0.85)

for n in G.nodes:
    G.nodes[n]['pageRank'] = page_rank[n]

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
            for neighbor in graph.successors(node):
                new_path = list(path) + [neighbor]
                queue.append(new_path)
    return []

def adjust_score_for_path_length(score, path_length):
    return score / path_length if path_length > 0 else 0

def get_all_dependencies(graph, node_id):
    direct_dependencies = list(graph.successors(node_id))
    all_dependencies = set(direct_dependencies)
    for dep_node_id in direct_dependencies:
        all_dependencies.update(get_all_dependencies(graph, dep_node_id))
    return list(all_dependencies)

missions_importance_scores = {}
for mission_uuid, mission_info in missions:
    print(f'Processing mission: {mission_info["label"]} ({mission_uuid})')
    dependencies = get_all_dependencies(G, mission_uuid)
    unique_dependencies = set(dependencies)
    adjusted_scores = {}
    total_adjusted_score = 0
    for node_id in unique_dependencies:
        if G.nodes[node_id].get('type') == 'OperationalData':
            path_length = len(find_shortest_path(G, mission_uuid, node_id))
            adjusted_score = adjust_score_for_path_length(G.nodes[node_id]['pageRank'], path_length)
            adjusted_scores[node_id] = adjusted_score
            total_adjusted_score += adjusted_score
    for node_id in adjusted_scores:
        adjusted_scores[node_id] /= total_adjusted_score if total_adjusted_score > 0 else 1
    missions_importance_scores[mission_uuid] = adjusted_scores

# Saving the scores (normalized and non-normalized) for each mission
json_filename = generate_filename("pagerank_analysis_missions", "json")

mission_data_scores = {mission_uuid: {node_id: score for node_id, score in mission_scores.items()} 
                for mission_uuid, mission_scores in missions_importance_scores.items()}


        

# Add the operational data that are not dependencies of the mission with a score of 0
for mission_idx, mission_dtl in enumerate(missions):
    mission_uuid = mission_dtl[0]
    mission_label = mission_dtl[1]['label']
    # print(mission_uuid, mission_label)
    
    
    
    for data_idx, data_dtl in enumerate(operational_data):
        data_uuid = data_dtl[0]
        data_label = data_dtl[1]['label']
        
        # Check if the operational data is a dependency of the mission (found in the mission_data_scores) and if not add a 0
        if data_uuid not in mission_data_scores[mission_uuid].keys():
            mission_data_scores[mission_uuid][data_uuid] = 0
        
        

# Create a matrix for the scores
matrix = np.zeros((len(missions), len(operational_data)))
  

with open(json_filename, 'w') as f:
    json.dump(mission_data_scores, f, indent=4)
    
    
    
# Fill the matrix with the scores
for mission_idx, mission_dtl in enumerate(missions):
    mission_uuid = mission_dtl[0]
    mission_label = mission_dtl[1]['label']
    # print(mission_uuid, mission_label)
    
    for data_idx, data_dtl in enumerate(operational_data):
        data_uuid = data_dtl[0]
        data_label = data_dtl[1]['label']
        # print(data_uuid, data_label)
        
        matrix[mission_idx, data_idx] = mission_data_scores[mission_uuid][data_uuid]
        
# Plot the matrix
plt.figure(figsize=(20, 10))
sns.heatmap(matrix, annot=True, xticklabels=[data_dtl[1]['label'] for data_dtl in operational_data], yticklabels=[mission_dtl[1]['label'] for mission_dtl in missions])
plt.xlabel('Operational Data')
plt.ylabel('Mission')
plt.title('Importance of Operational Data for each Mission')
# Save the image
image_filename = generate_filename("pagerank_analysis_missions", "png")
plt.savefig(image_filename)

# Save the matrix as a csv file with columns as operational data and rows as missions include labels
csv_filename = generate_filename("pagerank_analysis_missions", "csv")
df = pd.DataFrame(matrix, columns=[data_dtl[1]['label'] for data_dtl in operational_data], index=[mission_dtl[1]['label'] for mission_dtl in missions])
df.to_csv(csv_filename)

