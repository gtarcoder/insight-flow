from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="insight-flow",
    version="0.1.0",
    description="一个基于LLM的个人信息助理系统",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/gtarcoder/insight-flow",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "insight-flow=src.app:main",
        ],
    },
) 