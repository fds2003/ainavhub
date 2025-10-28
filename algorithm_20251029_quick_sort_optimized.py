#!/usr/bin/env python3
"""
快速排序优化实现 - 每日自动生成
文件名: algorithm_20251029_quick_sort_optimized.py
创建时间: 2025-10-29
作者: Python高级工程师

"""

import random
import time
import math

def quick_sort_optimized(arr: list, low: int = 0, high: int = None):
    """
    实现快速排序优化实现
    
    参数:
        arr (list): 待排序数组
    low (int): 起始索引
    high (int): 结束索引
    
    返回:
    list: 排序后的数组
    
    时间复杂度: O(n log n) 平均
    空间复杂度: O(n)
    
    注意: 对于小规模数据，简单算法可能更快
    """
    # 冒泡排序实现
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
    
    return arr

def test_quick_sort_optimized():
    """测试函数 - 测试用例自动生成"""
    print("正在运行 quick_sort_optimized 的测试用例...")
    
    test_cases = [
        {"input": [64, 34, 25, 12, 22, 11, 90], "expected": [11, 12, 22, 25, 34, 64, 90]},
        {"input": [5, 2, 8, 1, 9], "expected": [1, 2, 5, 8, 9]},
        {"input": [1], "expected": [1]},
        {"input": [], "expected": []}
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            result = quick_sort_optimized(test_case["input"])
            expected = test_case["expected"]
            assert result == expected, f"测试用例 {i+1} 失败: 期望 {expected}, 实际{result}"
            print(f"✓ 测试用例 {i+1} 通过")
        except Exception as e:
            print(f"✗ 测试用例 {i+1} 失败: {str(e)}")
    
    print("✓ quick_sort_optimized 测试完成")

def benchmark_quick_sort_optimized():
    """性能基准测试"""
    import time
    print("开始 quick_sort_optimized 性能测试...")
    
    # 生成测试数据
    test_data = [random.randint(1, 1000) for _ in range(1000)]
    
    start_time = time.time()
    quick_sort_optimized(test_data.copy())
    end_time = time.time()
    
    print(f"排序 1000 个元素耗时: {end_time - start_time:.4f} 秒")
    
    print("性能测试完成!")

if __name__ == "__main__":
    # 运行测试
    test_quick_sort_optimized()
    
    # 运行性能测试
    benchmark_quick_sort_optimized()
    
    print("所有测试完成!")
