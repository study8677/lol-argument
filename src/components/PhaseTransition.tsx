"use client";

export function PhaseTransition() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-flip-darken bg-black">
      <div className="text-center animate-flip-text">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-4xl font-bold text-red-500 tracking-wider">
          翻 转
        </h2>
        <p className="text-neutral-400 mt-2 text-lg">
          从构建到摧毁
        </p>
      </div>
    </div>
  );
}
