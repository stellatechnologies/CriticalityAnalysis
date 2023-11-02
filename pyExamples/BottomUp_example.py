import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
import json

# Load JSON data from file
with open('networkData.json', 'r') as file:
    data = json.load(file)

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
    return [n for n in graph.nodes() if graph.out_degree(n) == 0]

# Determine traversal path
try:
    traversal_path = list(nx.topological_sort(M))
    traversal_path.reverse()  # Reverse the traversal path
    print("Traversal Path: ", traversal_path)
except nx.NetworkXUnfeasible:
    print("Graph has a cycle, so a topological sort is not possible.")

# Find leaf mission nodes
leaf_mission_nodes = find_leaf_mission_nodes(M)
print("Leaf Mission Nodes: ", leaf_mission_nodes)

# UUID to Index mappings
mission_to_index = {uuid: i for i, uuid in enumerate(missions)}
data_to_index = {uuid: i for i, uuid in enumerate(operational_data)}

for m_uuid in traversal_path:
    m_index = mission_to_index[m_uuid]
    print(f"Processing Mission: {missions[m_uuid]['label']} (UUID: {m_uuid})")

    if m_uuid in leaf_mission_nodes:
        connected_data_nodes = [n for n in G.predecessors(m_uuid) if n in operational_data]
        print(f"Leaf Node. Connected Data Nodes: {[operational_data[d_uuid]['label'] for d_uuid in connected_data_nodes]}")
        for d_uuid in connected_data_nodes:
            matrix[m_index][data_to_index[d_uuid]] = 100
    else:
        children = [n for n in M.successors(m_uuid) if n in missions]
        print(f"Non-Leaf Node. Children: {[missions[c]['label'] for c in children]}")
        
        children_rows = [matrix[mission_to_index[c]] for c in children]
        print(f"Children Rows: {children_rows}")

        if children_rows:
            # Calculate the average manually for better debugging
            calculated_mean = np.sum(children_rows, axis=0) / len(children_rows)
            print(f"Calculated Mean: {calculated_mean}")
            matrix[m_index] = calculated_mean
        else:
            matrix[m_index] = np.zeros(len(operational_data))

        print(f"Updated Matrix Row for {missions[m_uuid]['label']}: {matrix[m_index]}")
    print("---")


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

# Define colors for mission nodes and data nodes
mission_node_color = 'skyblue'
data_node_color = 'lightgreen'

# Plot Full graph
pos = nx.spring_layout(G)

nx.draw_networkx_nodes(G, pos, nodelist=missions.keys(), node_color=mission_node_color, node_size=500)
nx.draw_networkx_nodes(G, pos, nodelist=operational_data.keys(), node_color=data_node_color, node_size=500)

nx.draw_networkx_labels(G, pos, labels={**{uuid: missions[uuid]['label'] for uuid in missions}, **{uuid: operational_data[uuid]['label'] for uuid in operational_data}})
nx.draw_networkx_edges(G, pos, arrows=True)

# Show the plot
# plt.title("Mission and Data Dependency Graph")
# plt.show()
