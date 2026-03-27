import { motion } from "motion/react";
import { Users } from "lucide-react";

interface StreamCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  streamerName: string;
  streamerAvatar: string;
  viewerCount: string;
  category?: string;
  tags?: string[];
}

export function StreamCard({ title, thumbnailUrl, streamerName, streamerAvatar, viewerCount }: StreamCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col cursor-pointer bg-white rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-slate-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          loading="lazy"
        />
        
        {/* Gradients for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover overlay Play button (matches design) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-all duration-500">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg transform scale-90 translate-y-2 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-500">
             <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1.5" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2.5 p-3.5">
        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug truncate group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src={streamerAvatar} 
              alt={streamerName}
              className="w-[22px] h-[22px] rounded-full object-cover shrink-0"
            />
            <span className="text-[13px] text-slate-500 truncate hover:text-slate-800 transition-colors">
              {streamerName}
            </span>
          </div>
          
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[12px] font-medium">{viewerCount}人在看</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
