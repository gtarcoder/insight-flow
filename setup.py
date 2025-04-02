from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="personal_info_assistant",
    version="0.1.0",
    author="YourName",
    author_email="your.email@example.com",
    description="一个基于LLM的个人信息助理系统",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/personal_info_assistant",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.0",
        "openai>=0.27.0",
        "pymongo>=4.0.0",
        "qdrant-client>=1.0.0",
        "neo4j>=4.4.0",
        "networkx>=2.6.0",
        "matplotlib>=3.4.0",
        "pyyaml>=6.0",
        "schedule>=1.1.0",
    ],
    entry_points={
        "console_scripts": [
            "info-assistant=src.app:main",
        ],
    },
) 