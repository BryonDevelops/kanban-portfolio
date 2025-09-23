import { LucideIcon } from "lucide-react";

interface FeatureHighlightCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}

export function FeatureHighlightCard({
  icon: Icon,
  title,
  description,
  gradientFrom,
  gradientTo,
}: FeatureHighlightCardProps) {
  return (
    <div className="group p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 hover:border-gray-300/80 dark:hover:border-white/20 transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight">
          {title}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words">
        {description}
      </p>
    </div>
  );
}