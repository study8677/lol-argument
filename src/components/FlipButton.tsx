"use client";

interface FlipButtonProps {
  onClick: () => void;
}

export function FlipButton({ onClick }: FlipButtonProps) {
  return (
    <div className="text-center py-8">
      <p className="text-neutral-500 text-sm mb-4">
        构建阶段完成。觉得论证够强了吗？
      </p>
      <button
        onClick={onClick}
        className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-lg font-medium transition-all animate-pulse-glow cursor-pointer"
      >
        我觉得够强了，翻转！
      </button>
      <p className="text-neutral-600 text-xs mt-3">
        点击后，反驳方智能体将对你的论证发起攻击
      </p>
    </div>
  );
}
