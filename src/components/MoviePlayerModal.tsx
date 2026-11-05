import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Crown,
  Settings,
  Subtitles,
  Check,
  Sparkles,
  Lock
} from 'lucide-react';
import { Movie, UserAccount, formatDuration } from '../utils/movieEngine';

interface MoviePlayerModalProps {
  movie: Movie | null;
  user: UserAccount | null;
  onClose: () => void;
  onOpenSubscribe: (planId?: string) => void;
  onUpdateContinueWatching: (movieId: string, currentTime: number, duration: number) => void;
  initialTime?: number;
}

export const MoviePlayerModal: React.FC<MoviePlayerModalProps> = ({
  movie,
  user,
  onClose,
  onOpenSubscribe,
  onUpdateContinueWatching,
  initialTime = 0
}) => {
  if (!movie) return null;

  const isSubscribedOrAdmin = Boolean(
    user?.role === 'admin' || user?.hasActiveSubscription
  );
  const isLocked = movie.isVIP && !isSubscribedOrAdmin;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p Full HD');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimer = useRef<any>(null);

  // If locked, pause playback
  useEffect(() => {
    if (isLocked && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isLocked]);

  // Set initial time when video metadata loads
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0 && initialTime < videoRef.current.duration) {
        videoRef.current.currentTime = initialTime;
      }
      if (!isLocked) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setCurrentTime(curr);
      // Periodic sync to parent continue watching
      if (Math.floor(curr) % 5 === 0) {
        onUpdateContinueWatching(movie.id, curr, dur);
      }
    }
  };

  const togglePlay = () => {
    if (isLocked) {
      onOpenSubscribe('quarterly');
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const next = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = next;
      setCurrentTime(next);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center overflow-hidden select-none"
    >
      {/* Top Bar with Title and Close Button */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-600 text-white shadow-sm shadow-red-600">
              {movie.language}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">{movie.releaseYear}</span>
            <span className="text-xs text-zinc-400 font-semibold">•</span>
            <span className="text-xs text-zinc-400 font-semibold">{movie.duration}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white truncate max-w-md">
            {movie.title}
          </h2>
        </div>

        <button
          onClick={() => {
            if (videoRef.current) {
              onUpdateContinueWatching(movie.id, videoRef.current.currentTime, videoRef.current.duration || 1);
            }
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close Movie Player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Video Element */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={movie.videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="w-full h-full max-h-screen object-contain"
          playsInline
        />

        {/* Lock Paywall Overlay if VIP & Not Subscribed */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-[#13141f] border border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Crown className="w-9 h-9 fill-black text-black" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-wider mb-3">
                  <Lock className="w-3.5 h-3.5" />
                  <span>VIP Exclusive Movie</span>
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Subscription Required
                </h3>
                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                  <span className="text-white font-bold">{movie.title}</span> is available exclusively to MovieDuniya VIP subscribers. Subscribe today to enjoy unlimited streaming on all devices!
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscribe('quarterly');
                  }}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-[0_0_25px_rgba(239,68,68,0.7)] cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Unlock for Rs. 199 / Month</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Back to Free Movies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center Play Button Overlay on Pause */}
        {!isPlaying && !isLocked && (
          <button
            onClick={togglePlay}
            className="absolute z-10 w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_35px_#ef4444] transform hover:scale-110 transition-all cursor-pointer"
            aria-label="Play Video"
          >
            <Play className="w-9 h-9 fill-white text-white ml-1" />
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      {!isLocked && (
        <div
          className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 transition-opacity duration-300 ${
            controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Scrubber Bar */}
          <div className="relative mb-4 group/scrub">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 group-hover/scrub:h-2 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all"
            />
            {/* Visual buffered track */}
            <div
              className="absolute left-0 top-0 h-1.5 group-hover/scrub:h-2 bg-red-600 rounded-lg pointer-events-none"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Left Controls: Play, Skip, Volume, Timer */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                onClick={() => skipTime(-10)}
                className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-600 opacity-80 group-hover/vol:opacity-100 transition-opacity"
                />
              </div>

              {/* Time display */}
              <div className="text-xs font-mono text-zinc-300 ml-1">
                <span>{formatDuration(currentTime)}</span>
                <span className="text-zinc-500 mx-1">/</span>
                <span className="text-zinc-500">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Quality, Subtitles, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSubtitleMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{selectedQuality}</span>
                  <span className="sm:hidden">HD</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-[#151622] border border-white/10 shadow-2xl p-2 z-40 backdrop-blur-xl">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                      Video Quality
                    </div>
                    {['4K Ultra HD (VIP)', '1080p Full HD', '720p HD', '480p SD', 'Auto'].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSelectedQuality(q);
                          setShowQualityMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10"
                      >
                        <span>{q}</span>
                        {selectedQuality === q && <Check className="w-3.5 h-3.5 text-red-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitles Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSubtitleMenu(!showSubtitleMenu);
                    setShowQualityMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CC: {selectedSubtitle}</span>
                </button>

                {showSubtitleMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl bg-[#151622] border border-white/10 shadow-2xl p-2 z-40 backdrop-blur-xl">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                      Subtitles
                    </div>
                    {['English', 'Urdu / Hindi', 'Punjabi', 'Off'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubtitle(sub);
                          setShowSubtitleMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10"
                      >
                        <span>{sub}</span>
                        {selectedSubtitle === sub && <Check className="w-3.5 h-3.5 text-red-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
