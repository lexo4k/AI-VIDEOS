import React from 'react';
import { GeneratedVideo } from '../types';
import { Download, Share2, Clock } from 'lucide-react';

interface VideoGalleryProps {
  videos: GeneratedVideo[];
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-xl border-dashed">
        <p className="text-slate-500 text-lg">No videos generated yet.</p>
        <p className="text-slate-600 text-sm mt-2">Start creating your first masterpiece!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg">
          <div className={`relative bg-black ${video.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
            <video 
              src={video.uri} 
              controls 
              className="w-full h-full object-cover"
              poster="https://picsum.photos/800/450" // Fallback poster
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono border border-white/10">
              {video.model.includes('veo') ? 'VEO' : 'AI'}
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-slate-300 text-sm line-clamp-2 mb-4 h-10" title={video.prompt}>
              {video.prompt || "Image to Video"}
            </p>
            
            <div className="flex items-center justify-between text-slate-500 text-xs mt-2 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-1">
                 <Clock className="w-3 h-3" />
                 {new Date(video.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="hover:text-emerald-400 transition-colors" 
                  title="Download"
                  onClick={() => window.open(video.uri, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};