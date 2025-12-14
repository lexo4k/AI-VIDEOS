import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { VideoGenerationConfig, VideoStatus } from '../types';
import { generateScript } from '../services/geminiService';
import { Film, Upload, Sparkles, AlertCircle, Wand2 } from 'lucide-react';

interface VideoGeneratorProps {
  onGenerate: (config: VideoGenerationConfig) => void;
  status: VideoStatus;
  userCredits: number;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onGenerate, status, userCredits }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  
  const cost = resolution === '1080p' ? 50 : 30;
  const canAfford = userCredits >= cost;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check
        alert("Image too large. Please use an image under 5MB.");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract raw base64 data and mime type
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setSelectedImage({
            mimeType: matches[1],
            data: matches[2]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateScript = async () => {
    if (!prompt) {
      alert("Please enter a topic or basic idea first.");
      return;
    }
    
    setIsScriptLoading(true);
    try {
      const script = await generateScript(prompt);
      if (script) {
        setPrompt(script);
      } else {
        alert("Could not generate script. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating script.");
    } finally {
      setIsScriptLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt && !selectedImage) return;
    onGenerate({
      prompt,
      aspectRatio,
      resolution,
      image: selectedImage
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Film className="text-emerald-400" /> Create New Video
        </h2>

        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Describe your video <span className="text-slate-500 font-normal ml-1">(or enter topic for Script Writer)</span>
              </label>
              <button
                onClick={handleGenerateScript}
                disabled={isScriptLoading || !prompt}
                className="text-xs flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 border border-indigo-500/20"
              >
                {isScriptLoading ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {isScriptLoading ? 'Writing...' : 'AI Script Writer'}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Propaganda de tênis de corrida..."
              className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none placeholder-slate-600 font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Reference Image Input */}
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">
              Reference Image (Optional for Image-to-Video)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-lg border border-slate-700 transition-colors w-full border-dashed">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">{fileName || "Upload an image"}</span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              {selectedImage && (
                 <button 
                  onClick={() => { setSelectedImage(undefined); setFileName(''); }}
                  className="text-red-400 text-sm hover:underline"
                 >
                   Clear
                 </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Supports PNG, JPEG, WEBP. Used as the starting frame.</p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      aspectRatio === ratio
                        ? 'bg-slate-700 text-emerald-400 border border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quality
              </label>
              <div className="flex gap-2">
                {(['720p', '1080p'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      resolution === res
                        ? 'bg-slate-700 text-emerald-400 border border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm">Estimated Cost</span>
              <span className={`font-mono font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                {cost} Credits
              </span>
            </div>
            
            {!canAfford && (
              <div className="mb-4 bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4" /> Insufficient credits. Please top up.
              </div>
            )}

            <Button 
              className="w-full py-4 text-lg" 
              onClick={handleSubmit} 
              isLoading={status === VideoStatus.GENERATING}
              disabled={!prompt && !selectedImage || !canAfford}
            >
              <Sparkles className="w-5 h-5" /> Generate Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};