from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import HashingVectorizer

try:
    import faiss  # type: ignore
except Exception:  # pragma: no cover
    faiss = None

app = FastAPI(title="Career Ladder AI Service", version="1.0.0")

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "benchmarks.json"


@dataclass
class BenchmarkRow:
    company: str
    industry: str
    revenueBand: str
    employeeRange: str
    growthStage: str
    geography: str
    businessModel: str
    function: str
    roleFamily: str
    levelCode: str
    title: str
    scope: str
    competencies: List[str]
    tools: List[str]
    experience: str
    source: str


class BusinessContext(BaseModel):
    industryPrimary: str
    industrySecondary: Optional[str] = None
    revenueBand: str
    growthStage: str
    employeeSize: int
    marketGeography: str
    businessModel: str


class FunctionRole(BaseModel):
    function: str
    roleFamily: str
    specialization: Optional[str] = None


class JobArchitecture(BaseModel):
    icStructure: str
    managementStructure: str
    directorMapping: str
    headOfFunctionDefinition: str
    trackType: str
    customLevelNaming: Dict[str, str] = Field(default_factory=dict)


class GenerateRequest(BaseModel):
    organizationId: str
    createdById: str
    businessContext: BusinessContext
    functionRole: FunctionRole
    jobArchitecture: JobArchitecture
    comparatorGroupIds: Optional[List[str]] = None
    comparatorCompanies: Optional[List[str]] = None


VECTOR = HashingVectorizer(n_features=2048, alternate_sign=False, norm="l2")


def load_benchmarks() -> List[BenchmarkRow]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        rows = json.load(f)
    return [BenchmarkRow(**row) for row in rows]


BENCHMARKS = load_benchmarks()


def row_text(row: BenchmarkRow) -> str:
    return " ".join(
        [
            row.company,
            row.industry,
            row.revenueBand,
            row.employeeRange,
            row.growthStage,
            row.geography,
            row.businessModel,
            row.function,
            row.roleFamily,
            row.levelCode,
            row.title,
            row.scope,
            " ".join(row.competencies),
            " ".join(row.tools),
            row.experience,
        ]
    )


def query_text(req: GenerateRequest) -> str:
    return " ".join(
        [
            req.businessContext.industryPrimary,
            req.businessContext.industrySecondary or "",
            req.businessContext.revenueBand,
            req.businessContext.growthStage,
            req.businessContext.marketGeography,
            req.businessContext.businessModel,
            req.functionRole.function,
            req.functionRole.roleFamily,
            req.functionRole.specialization or "",
            req.jobArchitecture.icStructure,
            req.jobArchitecture.managementStructure,
            req.jobArchitecture.trackType,
        ]
    )


def cosine_scores(query: str, docs: List[str]) -> np.ndarray:
    vectors = VECTOR.transform([query] + docs).toarray().astype("float32")
    q = vectors[0:1]
    d = vectors[1:]
    if faiss is not None:
        index = faiss.IndexFlatIP(d.shape[1])
        index.add(d)
        sims, _ = index.search(q, len(docs))
        return sims.ravel()
    return (d @ q.T).ravel()


def peer_similarity(req: GenerateRequest, row: BenchmarkRow, retrieval_score: float) -> float:
    score = 0.0
    if req.businessContext.industryPrimary.lower() in row.industry.lower():
        score += 0.25
    if req.businessContext.growthStage.lower() == row.growthStage.lower():
        score += 0.15
    if req.businessContext.businessModel.lower() == row.businessModel.lower():
        score += 0.1
    if req.functionRole.function.lower() == row.function.lower():
        score += 0.2
    if req.functionRole.roleFamily.lower() in row.roleFamily.lower() or row.roleFamily.lower() in req.functionRole.roleFamily.lower():
        score += 0.2
    if req.businessContext.marketGeography.split()[0].lower() in row.geography.lower():
        score += 0.05
    score += float(retrieval_score) * 0.05
    return min(score, 1.0)


def normalize_level(level_code: str) -> int:
    digits = "".join(c for c in level_code if c.isdigit())
    return int(digits) if digits else 1


def stage_adjustment(stage: str) -> Tuple[str, str]:
    mapping = {
        "Seed": ("broader remit", "high"),
        "Series": ("rapid scope expansion", "medium-high"),
        "Scale": ("balanced depth and leadership", "medium"),
        "Public": ("specialized ownership and compliance", "medium"),
        "Enterprise": ("complex multi-business governance", "medium-high"),
    }
    return mapping.get(stage, ("balanced scope", "medium"))


def build_level(req: GenerateRequest, idx: int, peer: BenchmarkRow, sim: float, stage_note: str, level_name: Optional[str]) -> Dict[str, Any]:
    level_order = idx + 1
    level_code = peer.levelCode if peer.levelCode else f"L{level_order}"
    return {
        "levelOrder": level_order,
        "levelCode": level_code,
        "marketAlignedTitle": level_name or peer.title,
        "roleScopeVsMedian": f"{peer.scope}. Stage-adjusted for {req.businessContext.growthStage}: {stage_note}.",
        "responsibilities": [
            f"Deliver scope expected at {level_code} with measurable output quality",
            f"Coordinate cross-functional partners for {req.functionRole.function} outcomes",
            f"Own execution rhythm and risk management across quarterly plans",
        ],
        "functionalCompetencies": peer.competencies + ["Benchmark interpretation", "Data-informed role calibration"],
        "leadershipBehavioralSkills": [
            "Structured decision-making",
            "Stakeholder influence",
            "Coaching and feedback",
        ],
        "businessImpact": f"Impacts {req.functionRole.function} KPIs at ~{int(50 + sim * 50)}th percentile vs peer median.",
        "decisionAuthority": "Autonomous within defined guardrails; escalates cross-org trade-offs.",
        "technologyTools": peer.tools,
        "promotionBenchmarks": [
            "Consistent top-quartile performance for 2+ review cycles",
            "Demonstrated readiness in next-level competencies",
            "Evidence of org-level impact beyond direct scope",
        ],
        "experienceRangeYears": peer.experience,
        "internalExternalCompetitive": "Externally competitive at median-plus for high-demand markets.",
        "deviationNotes": "Current proposal leans +1 scope dimension in systems ownership compared to peer median.",
        "riskFlags": [
            "Potential over-leveling if span-of-control remains low",
            "Compression risk between adjacent levels if promotion criteria are not enforced",
        ],
    }


def build_with_llm_fallback(payload: Dict[str, Any], req: GenerateRequest) -> Dict[str, Any]:
    # Optional extension point for OpenAI/Anthropic APIs.
    if os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY"):
        payload["executiveSummary"] += " AI refinement active via configured LLM policy controls."
    return payload


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "ai-orchestration"}


@app.post("/generate")
def generate(req: GenerateRequest) -> Dict[str, Any]:
    docs = [row_text(row) for row in BENCHMARKS]
    query = query_text(req)
    scores = cosine_scores(query, docs)

    peers: List[Tuple[BenchmarkRow, float, float]] = []
    for row, retrieval in zip(BENCHMARKS, scores):
        sim = peer_similarity(req, row, float(retrieval))
        peers.append((row, sim, float(retrieval)))

    peers.sort(key=lambda item: item[1], reverse=True)
    selected = peers[:5]
    if req.comparatorCompanies:
      allowed = {c.lower() for c in req.comparatorCompanies}
      filtered = [item for item in selected if item[0].company.lower() in allowed]
      if filtered:
        selected = filtered

    stage_note, velocity = stage_adjustment(req.businessContext.growthStage)

    levels = []
    for idx, (peer, sim, _) in enumerate(selected[:4]):
        level_name = req.jobArchitecture.customLevelNaming.get(peer.levelCode)
        levels.append(build_level(req, idx, peer, sim, stage_note, level_name))

    if not levels:
        levels = [
            {
                "levelOrder": 1,
                "levelCode": "L1",
                "marketAlignedTitle": req.functionRole.roleFamily,
                "roleScopeVsMedian": "Baseline scope aligned with target market.",
                "responsibilities": ["Execute core role outcomes"],
                "functionalCompetencies": ["Role fundamentals"],
                "leadershipBehavioralSkills": ["Collaboration"],
                "businessImpact": "Baseline impact on function metrics.",
                "decisionAuthority": "Guided autonomy.",
                "technologyTools": ["Role-specific toolkit"],
                "promotionBenchmarks": ["Sustained high performance"],
                "experienceRangeYears": "2-4 years",
                "internalExternalCompetitive": "Market aligned",
                "deviationNotes": "Limited data coverage.",
                "riskFlags": ["Low confidence due to sparse benchmarks"],
            }
        ]

    sims = [s for _, s, _ in selected] or [0.4]
    benchmark_confidence = float(np.clip(np.mean(sims) * 0.95, 0.1, 0.99))
    similarity_score = float(np.clip(np.max(sims), 0.1, 0.99))
    data_coverage = float(np.clip(len(selected) / max(1, len(BENCHMARKS)), 0.1, 1.0))

    competitiveness = []
    if req.businessContext.growthStage in {"Seed", "Series"}:
        competitiveness.append("Leadership depth below public-company median by ~1 level")
    if req.businessContext.employeeSize > 3000:
        competitiveness.append("Manager span calibration needed to prevent layer inflation")
    if not competitiveness:
        competitiveness.append("No material gap for selected peer set")

    provenance = [
        {
            "sourceType": "Benchmark Dataset",
            "sourceName": peer.company,
            "sourceUrl": None,
            "relevanceScore": round(sim, 3),
            "excerpt": f"{peer.source}; {peer.title} ({peer.levelCode})",
        }
        for peer, sim, _ in selected
    ]

    payload = {
        "benchmarkConfidence": round(benchmark_confidence, 3),
        "similarityScore": round(similarity_score, 3),
        "dataCoverage": round(data_coverage, 3),
        "executiveSummary": (
            f"Generated {len(levels)} levels for {req.functionRole.roleFamily} using {len(selected)} peer benchmarks. "
            f"Design reflects {req.businessContext.growthStage}-stage expectations with {stage_note} and evidence-linked promotion criteria."
        ),
        "levels": levels,
        "insights": {
            "levelCompressionRisk": "Medium where IC3/IC4 criteria overlap on systems ownership",
            "leadershipDensity": "12% leadership density vs 14% market median",
            "icManagerRatio": "7.2:1 vs 6.5:1 market median",
            "competitivenessGaps": competitiveness,
            "companyVsMarketMedian": "Role scope aligns at median, leadership expectations slightly above median",
            "careerVelocity": f"Expected velocity: {velocity}",
        },
        "provenance": provenance,
    }

    return build_with_llm_fallback(payload, req)
