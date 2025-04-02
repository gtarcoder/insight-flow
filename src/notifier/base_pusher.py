from abc import ABC, abstractmethod

class BasePusher(ABC):
    """推送服务基类，所有推送渠道需要继承此类"""
    
    @abstractmethod
    def evaluate_content_value(self, content):
        """评估内容是否值得推送"""
        pass
    
    @abstractmethod
    def push_content(self, content):
        """将内容推送到指定渠道"""
        pass 