"use client";

import React from "react";
import { KnowledgeNode, PrerequisiteEdge } from "@/src/domain/curriculum/types";
import { NodeMasteryState } from "@/src/domain/diagnostic/types";
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface PrerequisiteTreeProps {
  nodes: KnowledgeNode[];
  edges?: PrerequisiteEdge[];
  nodeStates?: Record<string, NodeMasteryState>;
  rootGapNodeId?: string;
  targetNodeId?: string;
}

export function PrerequisiteTree({
  nodes,
  nodeStates = {},
  rootGapNodeId,
  targetNodeId,
}: PrerequisiteTreeProps) {
  // Sort or layout nodes logically by stage & prerequisite progression
  const orderedNodeIds = [
    "NODE-MATH-6-INT-01",
    "NODE-MATH-4-FRAC-01",
    "NODE-MATH-6-FRAC-02",
    "NODE-MATH-6-FRAC-03",
  ];

  const sortedNodes = [...nodes].sort((a, b) => {
    const idxA = orderedNodeIds.indexOf(a.id);
    const idxB = orderedNodeIds.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return 0;
  });

  return (
    <div className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-warm-100 pb-3 mb-4 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cây Tri Thức Tiên Quyết (Prerequisite Knowledge Graph)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống truy vết ngược từ kỹ năng mục tiêu về các mắt xích nền tảng.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-edu-700 bg-edu-50 px-2.5 py-0.5 rounded-full border border-edu-200 dark:bg-edu-950 dark:text-edu-300 dark:border-edu-900">
          Toán Lớp 6
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedNodes.map((node, index) => {
          const stateRecord = nodeStates[node.id];
          const state = stateRecord?.state || "NOT_ASSESSED";
          const isRootGap = node.id === rootGapNodeId;
          const isTarget = node.id === targetNodeId;

          let badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
          let badgeText = "Chưa kiểm tra";
          let Icon = HelpCircle;

          if (state === "SECURE") {
            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
            badgeText = "Đã vững";
            Icon = CheckCircle2;
          } else if (state === "DEVELOPING") {
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
            badgeText = isRootGap ? "Lỗ hổng gốc rễ" : "Cần củng cố";
            Icon = isRootGap ? ShieldAlert : AlertTriangle;
          } else if (state === "UNCERTAIN") {
            badgeColor = "bg-slate-100 text-slate-700 border-slate-300";
            badgeText = "Chưa chắc chắn";
            Icon = HelpCircle;
          }

          return (
            <div
              key={node.id}
              className={`relative rounded-xl border p-3.5 transition-all ${
                isRootGap
                  ? "border-red-400 bg-red-50/40 ring-2 ring-red-300/60 dark:border-red-800 dark:bg-red-950/20"
                  : isTarget
                  ? "border-edu-300 bg-edu-50/20 dark:border-edu-800 dark:bg-edu-950/10"
                  : "border-warm-200 bg-warm-50/40 dark:border-slate-800 dark:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                <span className="font-mono">{node.code}</span>
                <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                  <Icon className="h-3 w-3" />
                  <span>{badgeText}</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {node.label}
              </h4>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {node.description}
              </p>

              {isRootGap && (
                <div className="mt-2.5 rounded-md bg-red-100/80 px-2 py-1 text-[10px] font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                  ⚠️ Nguyên nhân cốt lõi gây lỗi
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
