#!/usr/bin/env python3
"""
Daily Code Generator and Git Manager
自动化生成代码文件并管理Git仓库 - 增强随机版本
作者: Python高级工程师
创建时间: 2024
"""

import os
import sys
import datetime
import subprocess
import json
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

class DailyCodeGenerator:
    def __init__(self, base_dir=None):
        self.base_dir = base_dir or os.getcwd()
        self.today = datetime.datetime.now().strftime("%Y%m%d")
        self.config_file = os.path.join(self.base_dir, "code_generator_config.json")
        self.seed = self._generate_daily_seed()
        random.seed(self.seed)
        self.load_config()
        
    def _generate_daily_seed(self):
        """生成基于日期的种子，确保每天不同但可重复"""
        date_str = datetime.datetime.now().strftime("%Y%m%d")
        return int(hashlib.md5(date_str.encode()).hexdigest()[:8], 16)
    
    def load_config(self):
        """加载配置文件"""
        default_config = {
            "author": "Python高级工程师",
            "email": "your-email@example.com",
            "remote_repo": "origin",
            "branch": "main",
            "file_templates": {
                "algorithm": {
                    "extension": ".py",
                    "template": '''#!/usr/bin/env python3
"""
{algorithm_name} - {description}
文件名: {filename}
创建时间: {date}
作者: {author}
{additional_notes}
"""

import random
{additional_imports}

def {function_name}({parameters}):
    """
    {function_description}
    
    参数:
    {param_docs}
    
    返回:
    {return_docs}
    
    时间复杂度: {time_complexity}
    空间复杂度: {space_complexity}
    {complexity_notes}
    """
    {implementation}
    
    return {return_value}

def test_{function_name}():
    """测试函数 - 测试用例自动生成"""
    print("正在运行 {function_name} 的测试用例...")
    
    {test_cases}
    
    print("✓ {function_name} 测试完成")

def benchmark_{function_name}():
    """性能基准测试"""
    import time
    print("开始 {function_name} 性能测试...")
    
    {benchmark_code}
    
    print("性能测试完成!")

if __name__ == "__main__":
    # 运行测试
    test_{function_name}()
    
    # 运行性能测试
    benchmark_{function_name}()
    
    print("所有测试完成!")
'''
                },
                "utility": {
                    "extension": ".py", 
                    "template": '''#!/usr/bin/env python3
"""
{utility_name} - {description}
文件名: {filename}
创建时间: {date}
作者: {author}
{additional_notes}
"""

import os
import sys
{additional_imports}

class {class_name}:
    """
    {class_description}
    {class_notes}
    """
    
    def __init__(self{init_parameters}):
        """
        初始化 {class_name}
        
        参数:
        {init_param_docs}
        """
        {init_implementation}
    
    {additional_methods}
    
    def {main_method}(self{method_parameters}):
        """
        {method_description}
        
        参数:
        {method_param_docs}
        
        返回:
        {method_return_docs}
        """
        {method_implementation}
        
        return {return_value}
    
    def __str__(self):
        """字符串表示"""
        return "{class_name}({{0}})".format({str_representation})

def example_usage():
    """使用示例"""
    print("使用示例:")
    {usage_example}

def main():
    """主函数"""
    print("{utility_name} 执行开始...")
    
    # 显示使用示例
    example_usage()
    
    print("{utility_name} 执行完成!")

if __name__ == "__main__":
    main()
'''
                }
            },
            "algorithm_categories": [
                "sorting", "searching", "graph", "dynamic_programming", 
                "string_manipulation", "mathematical", "data_structures"
            ]
        }
        
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = {**default_config, **json.load(f)}
        else:
            self.config = default_config
            self.save_config()
    
    def save_config(self):
        """保存配置"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def _get_random_algorithm_idea(self):
        """获取随机的算法想法"""
        # 生成函数名
        func_name = f"quick_sort_{random.choice(['optimized', 'efficient', 'three_way', 'randomized'])}"
        
        algorithm_ideas = [
            # 排序算法
            {
                "category": "sorting",
                "name": "快速排序优化实现",
                "function": func_name,
                "params": "arr: list, low: int = 0, high: int = None",
                "param_docs": "    arr (list): 待排序数组\n    low (int): 起始索引\n    high (int): 结束索引",
                "return_docs": "list: 排序后的数组",
                "time_complexity": f"{random.choice(['O(n log n)', 'O(n log n) 平均', 'O(n²) 最坏'])}",
                "space_complexity": f"{random.choice(['O(log n)', 'O(n)', 'O(1)'])}",
                "implementation": self._generate_sorting_implementation(),
                "test_cases": self._generate_sorting_test_cases(func_name),
                "benchmark_code": self._generate_sorting_benchmark(func_name)
            },
        ]
        
        # 根据日期选择不同的算法类别
        day_of_year = datetime.datetime.now().timetuple().tm_yday
        category_index = day_of_year % len(self.config["algorithm_categories"])
        target_category = self.config["algorithm_categories"][category_index]
        
        # 过滤出目标类别的算法
        category_algorithms = [algo for algo in algorithm_ideas if algo["category"] == target_category]
        
        if category_algorithms:
            return random.choice(category_algorithms)
        else:
            return random.choice(algorithm_ideas)
    
    def _get_random_utility_idea(self):
        """获取随机的工具类想法"""
        utility_ideas = [
            {
                "name": f"{random.choice(['文件', '数据', '图像', '文本'])}处理器",
                "class": f"{random.choice(['File', 'Data', 'Image', 'Text'])}Processor",
                "description": f"{random.choice(['高效', '智能', '并行', '批量'])}处理{random.choice(['文件', '数据', '图像', '文本'])}",
                "main_method": f"{random.choice(['process', 'transform', 'analyze', 'validate'])}",
                "init_params": self._generate_utility_init_params(),
                "init_implementation": self._generate_utility_init_impl(),
                "method_params": self._generate_utility_method_params(),
                "method_implementation": self._generate_utility_method_impl(),
                "additional_methods": self._generate_additional_methods(),
                "usage_example": self._generate_usage_example()
            },
            {
                "name": f"{random.choice(['数据验证', '格式转换', '性能监控', '缓存管理'])}工具",
                "class": f"{random.choice(['Validator', 'Converter', 'Monitor', 'Cache'])}Tool",
                "description": f"{random.choice(['强大', '灵活', '高效', '可靠'])}的{random.choice(['数据验证', '格式转换', '性能监控', '缓存管理'])}工具",
                "main_method": f"{random.choice(['validate', 'convert', 'monitor', 'get'])}",
                "init_params": self._generate_utility_init_params(),
                "init_implementation": self._generate_utility_init_impl(),
                "method_params": self._generate_utility_method_params(),
                "method_implementation": self._generate_utility_method_impl(),
                "additional_methods": self._generate_additional_methods(),
                "usage_example": self._generate_usage_example()
            },
            {
                "name": f"{random.choice(['网络请求', '数据库操作', '日志记录', '配置管理'])}助手",
                "class": f"{random.choice(['Network', 'Database', 'Logger', 'Config'])}Helper",
                "description": f"{random.choice(['简单', '强大', '异步', '安全'])}的{random.choice(['网络请求', '数据库操作', '日志记录', '配置管理'])}助手",
                "main_method": f"{random.choice(['request', 'query', 'log', 'get'])}",
                "init_params": self._generate_utility_init_params(),
                "init_implementation": self._generate_utility_init_impl(),
                "method_params": self._generate_utility_method_params(),
                "method_implementation": self._generate_utility_method_impl(),
                "additional_methods": self._generate_additional_methods(),
                "usage_example": self._generate_usage_example()
            }
        ]
        
        return random.choice(utility_ideas)
    
    def _generate_sorting_implementation(self):
        """生成排序算法实现"""
        implementations = [
            '''if high is None:
        high = len(arr) - 1
    
    if low < high:
        # 分区操作
        pivot_index = self._partition(arr, low, high)
        
        # 递归排序
        {function_name}(arr, low, pivot_index - 1)
        {function_name}(arr, pivot_index + 1, high)
    
    return arr''',
            '''n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr''',
            '''if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = {function_name}(arr[:mid])
    right = {function_name}(arr[mid:])
    
    return self._merge(left, right)'''
        ]
        return random.choice(implementations)
    
    def _generate_search_implementation(self):
        """生成搜索算法实现"""
        implementations = [
            '''left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1''',
            '''for i, num in enumerate(arr):
        if num == target:
            return i
    return -1'''
        ]
        return random.choice(implementations)
    
    def _generate_graph_implementation(self):
        """生成图算法实现"""
        implementations = [
            '''visited = set()
    stack = [start]
    result = []
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            result.append(node)
            stack.extend(reversed(graph.get(node, [])))
    
    return result''',
            '''from collections import deque
    
    visited = set()
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            result.append(node)
            queue.extend(graph.get(node, []))
    
    return result'''
        ]
        return random.choice(implementations)
    
    def _generate_dp_implementation(self):
        """生成动态规划实现"""
        implementations = [
            '''if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]''',
            '''m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]'''
        ]
        return random.choice(implementations)
    
    def _generate_utility_init_params(self):
        """生成工具类初始化参数"""
        params_options = [
            "self, config: dict = None",
            "self, input_path: str, output_path: str",
            "self, timeout: int = 30, retries: int = 3",
            "self, debug: bool = False, verbose: bool = True"
        ]
        return random.choice(params_options)
    
    def _generate_utility_init_impl(self):
        """生成工具类初始化实现"""
        impl_options = [
            "self.config = config or {}",
            "self.input_path = input_path\n        self.output_path = output_path",
            "self.timeout = timeout\n        self.retries = retries",
            "self.debug = debug\n        self.verbose = verbose"
        ]
        return random.choice(impl_options)
    
    def _generate_utility_method_params(self):
        """生成工具类方法参数"""
        param_options = [
            "self, data: Any",
            "self, items: list, callback: callable = None",
            "self, *args, **kwargs",
            "self, input_data: Any, options: dict = None"
        ]
        return random.choice(param_options)
    
    def _generate_utility_method_impl(self):
        """生成工具类方法实现"""
        impl_options = [
            '''# 处理数据
        if self.verbose:
            print(f"处理数据: {{data}}")
        
        result = {"status": "success", "processed": True}
        return result''',
            '''# 处理项目列表
        results = []
        for i, item in enumerate(items):
            try:
                if callback:
                    result = callback(item)
                else:
                    result = self._process_item(item)
                results.append(result)
            except Exception as e:
                results.append({"error": str(e)})
        
        return {"processed": len(results), "results": results}''',
            '''# 执行操作
        if self.debug:
            print(f"参数: args={{args}}, kwargs={{kwargs}}")
        
        return {"executed": True, "timestamp": "2024-01-01"}'''
        ]
        return random.choice(impl_options)
    
    def _generate_additional_methods(self):
        """生成额外的方法"""
        methods = [
            '''
    def _process_item(self, item):
        """处理单个项目"""
        return {"item": item, "processed": True}
            ''',
            '''
    def validate_input(self, data):
        """验证输入数据"""
        if not data:
            raise ValueError("输入数据不能为空")
        return True
            ''',
            '''
    def get_stats(self):
        """获取统计信息"""
        return {"operations": 0, "success_rate": 1.0}
            '''
        ]
        return random.choice(methods) if random.random() > 0.3 else ""
    
    def _generate_usage_example(self):
        """生成使用示例"""
        examples = [
            '''# 创建实例并使用方法
    processor = {class_name}()
    result = processor.{main_method}("example_data")
    print(f"处理结果: {{result}}")''',
            '''# 配置并使用工具
    config = {{"setting": "value"}}
    tool = {class_name}(config)
    output = tool.{main_method}([1, 2, 3, 4, 5])
    print(f"输出: {{output}}")''',
            '''# 高级使用示例
    helper = {class_name}(debug=True)
    data = {{"key": "value"}}
    processed = helper.{main_method}(data, options={{"mode": "fast"}})
    print(f"处理完成: {{processed}}")'''
        ]
        return random.choice(examples)
    
    def _generate_sorting_test_cases(self, function_name):
        """生成排序测试用例"""
        return f'''test_cases = [
        {{"input": [64, 34, 25, 12, 22, 11, 90], "expected": [11, 12, 22, 25, 34, 64, 90]}},
        {{"input": [5, 2, 8, 1, 9], "expected": [1, 2, 5, 8, 9]}},
        {{"input": [1], "expected": [1]}},
        {{"input": [], "expected": []}}
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            result = {function_name}(test_case["input"])
            expected = test_case["expected"]
            assert result == expected, f"测试用例 {{i+1}} 失败: 期望 {{expected}}, 实际{{result}}"
            print(f"✓ 测试用例 {{i+1}} 通过")
        except Exception as e:
            print(f"✗ 测试用例 {{i+1}} 失败: {{str(e)}}")'''
    
    def _generate_search_test_cases(self, function_name):
        """生成搜索测试用例"""
        return f'''test_cases = [
        {{"input": ([1, 2, 3, 4, 5], 3), "expected": 2}},
        {{"input": ([1, 2, 3, 4, 5], 6), "expected": -1}},
        {{"input": ([], 1), "expected": -1}}
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            result = {function_name}(*test_case["input"])
            expected = test_case["expected"]
            assert result == expected, f"测试用例 {{i+1}} 失败: 期望 {{expected}}, 实际 {{result}}"
            print(f"✓ 测试用例 {{i+1}} 通过")
        except Exception as e:
            print(f"✗ 测试用例 {{i+1}} 失败: {{str(e)}}")'''
    
    def _generate_graph_test_cases(self, function_name):
        """生成图算法测试用例"""
        return f'''# 图测试用例
    graph = {{
        'A': ['B', 'C'],
        'B': ['D', 'E'],
        'C': ['F'],
        'D': [],
        'E': ['F'],
        'F': []
    }}
    
    result = {function_name}(graph, 'A')
    print(f"遍历结果: {{result}}")
    assert len(result) == 6, f"应该访问6个节点，实际访问了{{len(result)}}个"'''
    
    def _generate_dp_test_cases(self, function_name):
        """生成动态规划测试用例"""
        return f'''test_cases = [
        {{"input": (10,), "expected": 55}},  # 斐波那契
        {{"input": ("ABCDGH", "AEDFHR"), "expected": 3}},  # LCS
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            result = {function_name}(*test_case["input"])
            expected = test_case["expected"]
            assert result == expected, f"测试用例 {{i+1}} 失败: 期望 {{expected}}, 实际 {{result}}"
            print(f"✓ 测试用例 {{i+1}} 通过")
        except Exception as e:
            print(f"✗ 测试用例 {{i+1}} 失败: {{str(e)}}")'''
    
    def _generate_sorting_benchmark(self, function_name):
        """生成排序性能测试"""
        return f'''# 生成测试数据
    test_data = [random.randint(1, 1000) for _ in range(1000)]
    
    start_time = time.time()
    {function_name}(test_data.copy())
    end_time = time.time()
    
    print(f"排序 1000 个元素耗时: {{end_time - start_time:.4f}} 秒")'''
    
    def _generate_search_benchmark(self, function_name):
        """生成搜索性能测试"""
        return f'''# 生成测试数据
    test_data = list(range(1, 10001))
    target = random.choice(test_data)
    
    start_time = time.time()
    result = {function_name}(test_data, target)
    end_time = time.time()
    
    print(f"在 10000 个元素中搜索耗时: {{end_time - start_time:.6f}} 秒")
    print(f"找到目标在索引: {{result}}")'''
    
    def _generate_graph_benchmark(self, function_name):
        """生成图算法性能测试"""
        return f'''# 创建大型测试图
    large_graph = {{i: [i+1, i+2] for i in range(1000)}}
    large_graph[999] = []
    large_graph[1000] = []
    
    start_time = time.time()
    result = {function_name}(large_graph, 0)
    end_time = time.time()
    
    print(f"遍历 1000 个节点的图耗时: {{end_time - start_time:.4f}} 秒")'''
    
    def _generate_dp_benchmark(self, function_name):
        """生成动态规划性能测试"""
        return f'''start_time = time.time()
    result = {function_name}(30)  # 计算第30个Fibonacci数
    end_time = time.time()
    
    print(f"计算 Fibonacci(30) 耗时: {{end_time - start_time:.6f}} 秒")
    print(f"结果: {{result}}")'''
    
    def _generate_dp_param_docs(self):
        """生成动态规划参数文档"""
        return random.choice([
            "    n (int): 斐波那契数列位置",
            "    s1 (str): 第一个字符串\n    s2 (str): 第二个字符串",
            "    weights (list): 物品重量列表\n    values (list): 物品价值列表\n    capacity (int): 背包容量"
        ])
    
    def _generate_dp_return_docs(self):
        """生成动态规划返回文档"""
        return random.choice([
            "int: 斐波那契数列第n个值",
            "int: 最长公共子序列长度",
            "int: 最大价值"
        ])
    
    def generate_algorithm_file(self):
        """生成算法文件"""
        idea = self._get_random_algorithm_idea()
        
        filename = f"algorithm_{self.today}_{idea['function']}.py"
        filepath = os.path.join(self.base_dir, filename)
        
        # 随机添加额外的导入
        additional_imports = ""
        if random.random() > 0.7:
            additional_imports = "import time\nimport math"
        
        # 随机添加额外说明
        additional_notes = ""
        if random.random() > 0.5:
            notes = [
                "注意: 这是一个优化版本，包含额外的边界检查",
                "注意: 该实现包含详细的错误处理和日志记录",
                "注意: 支持多种输入格式和自定义比较函数"
            ]
            additional_notes = random.choice(notes)
        
        # 随机添加复杂度说明
        complexity_notes = ""
        if random.random() > 0.6:
            notes = [
                "注意: 在最坏情况下性能会下降",
                "注意: 对于小规模数据，简单算法可能更快",
                "注意: 空间复杂度可以通过优化降低"
            ]
            complexity_notes = f"\n    {random.choice(notes)}"
        
        content = self.config["file_templates"]["algorithm"]["template"].format(
            algorithm_name=idea["name"],
            description=f"每日自动生成",
            filename=filename,
            date=datetime.datetime.now().strftime("%Y-%m-%d"),
            author=self.config["author"],
            function_name=idea["function"],
            parameters=idea["params"],
            function_description=f"实现{idea['name']}",
            param_docs=idea["param_docs"],
            return_docs=idea["return_docs"],
            time_complexity=idea["time_complexity"],
            space_complexity=idea["space_complexity"],
            complexity_notes=complexity_notes,
            implementation=idea["implementation"],
            return_value=random.choice(["result", "arr", "dp[n]", "visited"]),
            test_cases=idea["test_cases"],
            benchmark_code=idea["benchmark_code"],
            additional_imports=additional_imports,
            additional_notes=additional_notes
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ 生成算法文件: {filename}")
        return filepath
    
    def generate_utility_file(self):
        """生成工具类文件"""
        idea = self._get_random_utility_idea()
        
        filename = f"utility_{self.today}_{idea['class'].lower()}.py"
        filepath = os.path.join(self.base_dir, filename)
        
        # 随机添加额外的导入
        additional_imports = ""
        if random.random() > 0.5:
            imports = [
                "import json",
                "import time",
                "from typing import Any, List, Dict, Optional",
                "import logging"
            ]
            additional_imports = random.choice(imports)
        
        # 随机添加额外说明
        additional_notes = ""
        if random.random() > 0.4:
            notes = [
                "注意: 这个工具类支持线程安全操作",
                "注意: 包含完整的错误处理和日志记录",
                "注意: 支持配置文件和命令行参数"
            ]
            additional_notes = random.choice(notes)
        
        # 随机添加类说明
        class_notes = ""
        if random.random() > 0.6:
            notes = [
                "这个类使用单例模式确保资源高效利用",
                "支持链式调用和方法组合",
                "包含完整的单元测试和性能监控"
            ]
            class_notes = f"\n    {random.choice(notes)}"
        
        content = self.config["file_templates"]["utility"]["template"].format(
            utility_name=idea["name"],
            description=f"{idea['name']} - 每日自动生成",
            filename=filename,
            date=datetime.datetime.now().strftime("%Y-%m-%d"),
            author=self.config["author"],
            class_name=idea["class"],
            class_description=f"{idea['name']}类",
            class_notes=class_notes,
            additional_imports=additional_imports,
            additional_notes=additional_notes,
            init_parameters=idea["init_params"],
            init_param_docs=idea.get("init_param_docs", "    配置参数"),
            init_implementation=idea["init_implementation"],
            additional_methods=idea["additional_methods"],
            main_method=idea["main_method"],
            method_description=f"{random.choice(['主要', '核心', '重要'])}方法",
            method_parameters=idea["method_params"],
            method_param_docs=idea.get("method_param_docs", "    输入参数"),
            method_return_docs=idea.get("method_return_docs", "处理结果"),
            method_implementation=idea["method_implementation"],
            return_value=random.choice(["result", "output", "data", "processed"]),
            str_representation=random.choice(["config", "input_path", "timeout"]),
            usage_example=idea["usage_example"]
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ 生成工具文件: {filename}")
        return filepath
    
    def git_add_and_commit(self, files):
        """Git添加和提交"""
        try:
            # 检查文件是否有变化（在add之前）
            has_changes = False
            for file in files:
                result = subprocess.run(['git', 'status', '--porcelain', file], 
                                      capture_output=True, text=True, cwd=self.base_dir)
                if result.stdout.strip():
                    has_changes = True
                    break
            
            if not has_changes:
                print("⚠️  文件已存在且没有变化，跳过提交")
                return True
            
            # 添加文件到Git
            subprocess.run(['git', 'add'] + files, check=True, cwd=self.base_dir)
            print("✓ 文件已添加到Git暂存区")
            
            # 提交更改
            commit_message = f"每日代码提交 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} - 种子:{self.seed}"
            subprocess.run(['git', 'commit', '-m', commit_message], check=True, cwd=self.base_dir)
            print("✓ 更改已提交到本地仓库")
            
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Git操作失败: {e}")
            return False
    
    def git_push(self):
        """推送到远程仓库"""
        try:
            subprocess.run(['git', 'push', self.config['remote_repo'], self.config['branch']], 
                         check=True, cwd=self.base_dir)
            print("✓ 代码已推送到远程仓库")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Git推送失败: {e}")
            return False
    
    def run_daily_generation(self):
        """执行每日代码生成流程"""
        print("=" * 60)
        print("🚀 开始每日代码生成流程")
        print(f"📅 日期: {datetime.datetime.now().strftime('%Y-%m-%d')}")
        print(f"🎲 随机种子: {self.seed}")
        print("=" * 60)
        
        # 生成两个代码文件
        file1 = self.generate_algorithm_file()
        file2 = self.generate_utility_file()
        
        generated_files = [file1, file2]
        
        print("=" * 60)
        print("🎉 代码生成完成!")
        print(f"📁 生成文件:")
        for file in generated_files:
            print(f"   📄 {os.path.basename(file)}")
        print(f"🎲 今日种子: {self.seed} (用于重现)")
        print("\n💡 提示: 生成的文件仅供本地使用，不会提交到Git仓库")
        print("=" * 60)

def main():
    """主函数"""
    # 检查是否在Git仓库中
    if not os.path.exists(os.path.join(os.getcwd(), '.git')):
        print("错误: 当前目录不是Git仓库")
        print("请在有.git目录的文件夹中运行此脚本")
        sys.exit(1)
    
    # 创建生成器实例并运行
    generator = DailyCodeGenerator()
    generator.run_daily_generation()

if __name__ == "__main__":
    main()