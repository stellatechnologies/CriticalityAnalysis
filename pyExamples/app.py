from flask import Flask, request, jsonify
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
from collections import deque

app = Flask(__name__)

@app.route('/bottom_up_process', methods=['POST'])
def bottom_up_process():
    data = request.json
    
    print(f'DATA: {data}')

    # Parse missions and operational data
    missions = {m['UUID']: {'label': m['Name']} for m in data['Mission']}
    operational_data = {d['UUID']: {'label': d['Name'], 'shape': 'box'} for d in data['OperationalData']}

    # Combine mission and data nodes
    full_nodes = {**missions, **operational_data}

    # Parse mission hierarchy and mission-operational data relationships
    mission_hierarchy = [(rel['ChildMission'], rel['ParentMission']) for rel in data['MissionHierarchy']]
    mission_data_relations = [(rel['OperationalData'], rel['Mission']) for rel in data['Mission_OperationalData']]

    # Create matrix
    matrix = np.zeros((len(missions), len(operational_data)))

    # Create and populate graph
    G = nx.DiGraph()
    G.add_nodes_from(full_nodes.keys())
    G.add_edges_from(mission_hierarchy + mission_data_relations)

    # Create mission-only graph
    M = nx.DiGraph()
    M.add_nodes_from(missions.keys())
    M.add_edges_from(mission_hierarchy)

    # Function to find leaf mission nodes
    def find_leaf_mission_nodes(graph):
        return [n for n in graph.nodes() if graph.in_degree(n) == 0]

    # Determine traversal path
    try:
        traversal_path = list(nx.topological_sort(M))
        print("Traversal Path: ", traversal_path)
    except nx.NetworkXUnfeasible:
        print("Graph has a cycle, so a topological sort is not possible.")

    # Find leaf mission nodes
    leaf_mission_nodes = find_leaf_mission_nodes(M)

    # UUID to Index mappings
    mission_to_index = {uuid: i for i, uuid in enumerate(missions)}
    data_to_index = {uuid: i for i, uuid in enumerate(operational_data)}

    for m_uuid in traversal_path:
        m_index = mission_to_index[m_uuid]

        if m_uuid in leaf_mission_nodes:
            connected_data_nodes = [n for n in G.predecessors(m_uuid) if n in operational_data]
            for d_uuid in connected_data_nodes:
                matrix[m_index][data_to_index[d_uuid]] = 100
        else:
            children = [n for n in M.predecessors(m_uuid) if n in missions]
            
            children_rows = [matrix[mission_to_index[c]] for c in children]

            if children_rows:
                # Calculate the average manually for better debugging
                calculated_mean = np.sum(children_rows, axis=0) / len(children_rows)
                matrix[m_index] = calculated_mean
            else:
                matrix[m_index] = np.zeros(len(operational_data))
       
        
        
    # Pretty print matrix
    mission_labels = [missions[uuid]['label'] for uuid in missions]
    data_labels = [operational_data[uuid]['label'] for uuid in operational_data]

    # Create a heatmap for the matrix
    plt.figure(figsize=(10, 6))
    sns.heatmap(matrix, annot=True, fmt=".2f", cmap="YlGnBu", xticklabels=data_labels, yticklabels=mission_labels)
    plt.title("Percentage Use of Data for Each Mission")
    plt.xlabel("Data")
    plt.ylabel("Missions")
    plt.show()

    # For simplicity, the response is just a confirmation message.
    # You can modify this to return any result you need.
    return jsonify({"message": "Data processed successfully"})




@app.route('/bfs_dfs_analysis', methods=['POST'])
def bfs_dfs_analysis():
    data = request.json

    # Parse missions and operational data
    missions = {m['UUID']: {'label': m['Name']} for m in data['Mission']}
    operational_data = {d['UUID']: {'label': d['Name'], 'shape': 'box'} for d in data['OperationalData']}

    print(f'Missions: {missions}')

    # Combine mission and data nodes
    full_nodes = {**missions, **operational_data}

    # Parse mission hierarchy and mission-operational data relationships
    mission_hierarchy = [(rel['ChildMission'], rel['ParentMission']) for rel in data['MissionHierarchy']]
    mission_data_relations = [(rel['OperationalData'], rel['Mission']) for rel in data['Mission_OperationalData']]

    # # Create and populate graph
    # G = nx.DiGraph()
    # G.add_nodes_from(full_nodes.keys())
    # for edge in mission_hierarchy + mission_data_relations:
    #     G.add_edge(edge[1], edge[0])  # Note the order: (Parent, Child)

    # # Identify root missions (no incoming edges)
    # root_missions = [node for node in G.nodes if G.in_degree(node) == 0 and node in missions]

    # # Perform BFS and DFS for each root mission
    # bfs_paths = {}
    # dfs_paths = {}
    # for root in root_missions:
    #     bfs_paths[root] = list(nx.bfs_edges(G, root))
    #     dfs_paths[root] = list(nx.dfs_edges(G, root))

    # def get_node_label(node_id):
    #     # Check if the node is in missions, otherwise fall back to operational_data or use a default value
    #     return missions.get(node_id, operational_data.get(node_id, {'label': 'Unknown'}))['label']

    # # Use the get_node_label function to safely access node labels
    # bfs_labels = {get_node_label(root): [(get_node_label(u), get_node_label(v)) for u, v in bfs_paths[root]] for root in root_missions}
    # dfs_labels = {get_node_label(root): [(get_node_label(u), get_node_label(v)) for u, v in dfs_paths[root]] for root in root_missions}


    # response = {
    #     "message": "BFS and DFS analysis completed",
    #     "BFS": bfs_labels,
    #     "DFS": dfs_labels
    # }
    
    # print(response)

    # return jsonify(response)
    
    # Create and populate graph
    G = nx.DiGraph()
    G.add_nodes_from(full_nodes.keys())
    G.add_edges_from(mission_hierarchy + mission_data_relations)

    # Calculating Depth and Breadth
    def calculate_depth(graph, node_id, visited=set()):
        if node_id in visited:
            return 0
        visited.add(node_id)
        depths = [calculate_depth(graph, predecessor, visited) for predecessor in graph.predecessors(node_id)]
        return 1 + max(depths) if depths else 0

    def calculate_breadth(graph, node_id):
        return len(list(graph.successors(node_id)))

    criticality_scores = {}
    for node_id in operational_data:
        depth = calculate_depth(G, node_id)
        breadth = calculate_breadth(G, node_id)
        # Simple criticality score: higher values for more "leaf" nodes, adjusted by depth
        criticality_scores[node_id] = breadth + 1 / (depth + 1)  # Avoid division by zero

    # Normalize the criticality scores to a 1-4 range
    max_score = max(criticality_scores.values(), default=1)
    min_score = min(criticality_scores.values(), default=0)
    normalized_scores = {node_id: 1 + 3 * (score - min_score) / (max_score - min_score) if max_score > min_score else 1 for node_id, score in criticality_scores.items()}

    # Prepare scores with labels for response
    scores_with_labels = {operational_data[node_id]['label']: score for node_id, score in normalized_scores.items()}

    response = {
        "message": "Depth and Breadth analysis completed",
        "criticality_scores": scores_with_labels
    }
    
    print(response)

    return jsonify(response)

    
    
    
    
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
    direct_dependencies = list(graph.predecessors(node_id))
    # print(f'Direct Dependencies: {direct_dependencies}')
    all_dependencies = set(direct_dependencies)
    # print(f'All Dependencies: {all_dependencies}')
    
    for dep_node_id in direct_dependencies:
        all_dependencies.update(get_all_dependencies(graph, dep_node_id))
    
    return list(all_dependencies)


@app.route('/pagerank_analysis', methods=['POST'])
def pagerank_analysis():
    data = request.json
    
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
        
        
    response = {
        "message": "PageRank analysis completed",
        "importance_scores": adjusted_scores
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port = 6868)
