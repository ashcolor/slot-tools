import { Link } from "react-router";
import { tools } from "../tools";

export function Home() {
  return (
    <div className="pt-6 text-center">
      <p className="text-sm opacity-60 mb-8">スロット便利ツール集</p>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body p-4 flex-row items-center gap-3">
              <span className="text-3xl">{tool.emoji}</span>
              <div className="text-left">
                <div className="font-bold">{tool.title}</div>
                <div className="text-xs opacity-60">{tool.description}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
