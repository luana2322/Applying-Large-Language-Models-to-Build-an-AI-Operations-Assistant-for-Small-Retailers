from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class EvaluationResult(BaseModel):
    case_id: str
    passed: bool
    question: str
    predicted_intent: str
    expected_intent: str
    tool_called: Optional[str] = None
    expected_tool: Optional[str] = None
    status: str
    answer_preview: str

class BenchmarkReport(BaseModel):
    total_cases: int
    passed_cases: int
    intent_accuracy: float
    tool_selection_accuracy: float
    clarification_accuracy: float
    details: List[EvaluationResult]

def calculate_benchmark_metrics(results: List[EvaluationResult]) -> BenchmarkReport:
    total = len(results)
    if total == 0:
        return BenchmarkReport(total_cases=0, passed_cases=0, intent_accuracy=0.0, tool_selection_accuracy=0.0, clarification_accuracy=0.0, details=[])

    passed_count = sum(1 for r in results if r.passed)
    intent_correct = sum(1 for r in results if r.predicted_intent == r.expected_intent)
    
    tool_cases = [r for r in results if r.expected_tool is not None]
    tool_correct = sum(1 for r in tool_cases if r.tool_called == r.expected_tool)
    tool_acc = (tool_correct / len(tool_cases) * 100.0) if tool_cases else 100.0

    clarification_cases = [r for r in results if r.expected_intent == "CLARIFICATION_REQUIRED"]
    clarification_correct = sum(1 for r in clarification_cases if r.status == "needs_clarification" or r.predicted_intent == "CLARIFICATION_REQUIRED")
    clarification_acc = (clarification_correct / len(clarification_cases) * 100.0) if clarification_cases else 100.0

    return BenchmarkReport(
        total_cases=total,
        passed_cases=passed_count,
        intent_accuracy=round(intent_correct / total * 100.0, 2),
        tool_selection_accuracy=round(tool_acc, 2),
        clarification_accuracy=round(clarification_acc, 2),
        details=results
    )
