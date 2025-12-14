import React, { useState, useEffect } from 'react';
import { User, VideoStatus, GeneratedVideo, VideoGenerationConfig } from './types';
import { checkAndRequestApiKey, openApiKeySelector, generateVideo } from './services/geminiService';
import { VideoGenerator } from './components/VideoGenerator';
import { VideoGallery } from './components/VideoGallery';
import { CreditCard } from './components/CreditCard';
import { Button } from './components/Button';
import { LogOut, LayoutDashboard, CreditCard as IconCredit, Play, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [apiKeyVerified, setApiKeyVerified] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'gallery' | 'credits'>('create');
  
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [status, setStatus] = useState<VideoStatus>(VideoStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // --- Effects ---

  // 1. Check API Key on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const hasKey = await checkAndRequestApiKey();
        setApiKeyVerified(hasKey);
      } catch (e) {
        console.error("Error checking API key", e);
        setApiKeyVerified(false);
      } finally {
        setCheckingKey(false);
      }
    };
    init();
  }, []);

  // 2. Simulated Login on Key Verify
  useEffect(() => {
    if (apiKeyVerified && !user) {
      // Mock login if key exists
      setUser({
        email: 'creator@videoja.ai',
        credits: 100 // Welcome bonus
      });
    }
  }, [apiKeyVerified, user]);


  // --- Handlers ---

  const handleKeySelection = async () => {
    await openApiKeySelector();
    // Re-check logic. In a real app, we might wait for a callback or poll, 
    // but here we optimistically check after user interaction returns
    const hasKey = await checkAndRequestApiKey();
    if (hasKey) {
      setApiKeyVerified(true);
    } else {
        // Retry check after a moment in case of race condition in standard window.aistudio
        setTimeout(async () => {
            const retryKey = await checkAndRequestApiKey();
            setApiKeyVerified(retryKey);
        }, 1000);
    }
  };

  const handleGenerate = async (config: VideoGenerationConfig) => {
    if (!user) return;
    
    // Deduct credits locally (optimistic)
    const cost = config.resolution === '1080p' ? 50 : 30;
    setUser(prev => prev ? ({ ...prev, credits: prev.credits - cost }) : null);

    setStatus(VideoStatus.GENERATING);
    setStatusMessage("Initializing Veo model...");

    try {
      const videoUri = await generateVideo(config);

      if (videoUri) {
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          uri: videoUri,
          prompt: config.prompt,
          createdAt: Date.now(),
          aspectRatio: config.aspectRatio,
          model: 'veo-3.1-fast-generate-preview'
        };
        setVideos(prev => [newVideo, ...prev]);
        setStatus(VideoStatus.COMPLETED);
        setActiveTab('gallery'); // Switch to gallery to show result
      } else {
        throw new Error("No video URI returned.");
      }
    } catch (error) {
      console.error(error);
      setStatus(VideoStatus.FAILED);
      // Refund on failure
      setUser(prev => prev ? ({ ...prev, credits: prev.credits + cost }) : null);
      alert("Generation failed. Credits refunded.");
    } finally {
      setStatus(VideoStatus.IDLE);
      setStatusMessage('');
    }
  };

  const handleAddCredits = (amount: number) => {
    // Mock Payment
    if (!user) return;
    setUser({ ...user, credits: user.credits + (amount * 10) }); // $1 = 10 credits logic
    alert(`Added ${amount * 10} credits!`);
  };

  // --- Render: Loading / Gate ---

  if (checkingKey) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">
      <div className="animate-pulse">Checking access...</div>
    </div>;
  }

  if (!apiKeyVerified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">VideoJá AI Studio</h1>
          <p className="text-slate-400 mb-8">
            To generate high-quality videos with Google Veo, you must connect a valid Google Cloud Project with billing enabled.
          </p>
          <Button onClick={handleKeySelection} className="w-full justify-center py-3 text-lg">
            Connect Google API Key
          </Button>
          <p className="mt-4 text-xs text-slate-500">
            Read more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-emerald-400 underline">billing & pricing</a>.
          </p>
        </div>
      </div>
    );
  }

  // --- Render: Main App ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">VideoJá<span className="text-emerald-400">AI</span></span>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono text-emerald-400">VEO-3.1-ACTIVE</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                   <div className="text-xs text-slate-400">Balance</div>
                   <div className="text-sm font-bold text-emerald-400">{user?.credits} Credits</div>
                </div>
                <button 
                  onClick={() => window.location.reload()} // Simple logout sim
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-400" />
                </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'create' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Studio
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'gallery' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            <Play className="w-4 h-4" /> Gallery <span className="ml-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs">{videos.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'credits' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
          >
            <IconCredit className="w-4 h-4" /> Top Up
          </button>
        </div>

        {/* Status Overlay */}
        {status === VideoStatus.GENERATING && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 p-4 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Generating Video</div>
              <div className="text-emerald-400 text-xs">This takes a few minutes...</div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {activeTab === 'create' && (
            <div className="max-w-3xl mx-auto">
              <VideoGenerator 
                onGenerate={handleGenerate} 
                status={status} 
                userCredits={user?.credits || 0}
              />
            </div>
          )}

          {activeTab === 'gallery' && (
            <VideoGallery videos={videos} />
          )}

          {activeTab === 'credits' && (
            <CreditCard 
              balance={user?.credits || 0} 
              onAddCredits={handleAddCredits} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;