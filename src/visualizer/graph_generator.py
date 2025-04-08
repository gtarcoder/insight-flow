import networkx as nx
import matplotlib.pyplot as plt
import matplotlib
import time
matplotlib.use('Agg')  # 非交互式后端

class GraphVisualizer:
    def __init__(self, db_manager):
        """初始化图可视化工具
        
        Args:
            db_manager: 必须提供的数据库管理器实例
        """
        assert db_manager is not None, "必须提供数据库管理器"
        self.db_manager = db_manager
    
    def generate_relationship_graph(self, central_content_id, depth=2):
        """生成以特定内容为中心的关系图"""
        # 查询图数据库获取关系数据
        with self.db_manager.graph_db.session() as session:
            result = session.run(
                """
                MATCH path = (c:Content {id: $content_id})-[*1..{depth}]-(related)
                RETURN path
                """,
                content_id=central_content_id,
                depth=depth
            )
            
            # 构建NetworkX图
            G = nx.DiGraph()
            edge_labels = {}
            
            # 添加中心节点
            central_content = self.db_manager.get_content(central_content_id)
            if central_content:
                G.add_node(central_content_id, label=central_content.title)
            
            for record in result:
                path = record["path"]
                # 处理路径中的节点和关系
                nodes = path.nodes
                relationships = path.relationships
                
                for node in nodes:
                    if node.id not in G:
                        G.add_node(node.id, label=node["title"])
                
                for rel in relationships:
                    start_node = rel.start_node.id
                    end_node = rel.end_node.id
                    rel_type = rel.type
                    
                    if (start_node, end_node) not in G.edges():
                        G.add_edge(start_node, end_node, type=rel_type)
                        edge_labels[(start_node, end_node)] = rel_type
                
            # 生成可视化图像
            plt.figure(figsize=(12, 10))
            pos = nx.spring_layout(G)
            
            # 绘制节点
            nx.draw_networkx_nodes(G, pos, node_color='skyblue', node_size=1500)
            
            # 绘制节点标签
            node_labels = {node: G.nodes[node]["label"] for node in G.nodes()}
            nx.draw_networkx_labels(G, pos, labels=node_labels, font_size=10)
            
            # 绘制边
            nx.draw_networkx_edges(G, pos, arrows=True)
            
            # 绘制边标签
            nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
            
            # 保存图像
            image_path = f"static/graphs/relationship_{central_content_id}.png"
            plt.savefig(image_path)
            plt.close()
            
            return image_path
            
    def generate_timeline_graph(self, events):
        """生成时间线图"""
        # 创建图
        fig, ax = plt.subplots(figsize=(15, 8))
        
        # 时间点
        times = [event["time"] for event in events]
        descriptions = [event["title"] for event in events]
        
        # 绘制时间线
        ax.scatter(times, [1] * len(times), s=100, color='blue')
        
        # 添加事件描述
        for i, (time, desc) in enumerate(zip(times, descriptions)):
            ax.annotate(desc, (time, 1), 
                       xytext=(0, (-1)**i * 20),  # 上下交错放置文本
                       textcoords='offset points',
                       ha='center', va='center',
                       bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.5))
        
        # 调整坐标轴
        ax.set_yticks([])
        ax.spines['left'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['top'].set_visible(False)
        
        ax.set_title('事件时间线')
        
        # 保存图像
        image_path = f"static/graphs/timeline_{int(time.time())}.png"
        plt.savefig(image_path)
        plt.close()
        
        return image_path
        
    def generate_causal_graph(self, causal_relations):
        """生成因果关系图"""
        G = nx.DiGraph()
        edge_labels = {}
        
        # 添加节点和边
        for relation in causal_relations:
            cause_id = relation["cause"]["id"]
            effect_id = relation["effect"]["id"]
            
            if cause_id not in G:
                G.add_node(cause_id, label=relation["cause"]["title"])
            
            if effect_id not in G:
                G.add_node(effect_id, label=relation["effect"]["title"])
            
            G.add_edge(cause_id, effect_id)
            edge_labels[(cause_id, effect_id)] = relation["description"]
        
        # 创建图
        plt.figure(figsize=(12, 10))
        pos = nx.spring_layout(G)
        
        # 绘制节点
        nx.draw_networkx_nodes(G, pos, node_color='lightgreen', node_size=1500)
        
        # 绘制节点标签
        node_labels = {node: G.nodes[node]["label"] for node in G.nodes()}
        nx.draw_networkx_labels(G, pos, labels=node_labels, font_size=10)
        
        # 绘制边
        nx.draw_networkx_edges(G, pos, arrows=True, arrowsize=20)
        
        # 绘制边标签
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
        
        plt.title("因果关系图")
        
        # 保存图像
        image_path = f"static/graphs/causal_{int(time.time())}.png"
        plt.savefig(image_path)
        plt.close()
        
        return image_path 