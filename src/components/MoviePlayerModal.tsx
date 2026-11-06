import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
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
  Lock,
  Bookmark,
  Share2,
  Film,
  Star,
  Info,
  Radio,
  Clock
} from 'lucide-react';
import { Movie, UserAccount, formatDuration, canUserWatchMovie } from '../utils/movieEngine';

interface MoviePlayerModalProps {
  movie: Movie | null;
  user: UserAccount | null;
  allMovies?: Movie[];
  onSelectMovie?: (m: Movie) => void;
  onClose: () => void;
  onOpenSubscribe: (planId?: string) => void;
  onOpenAuth?: (tab?: 'login' | 'signup') => void;
  onUpdateContinueWatching: (movieId: string, currentTime: number, duration: number) => void;
  onToggleWatchlist?: (movieId: string) => void;
  initialTime?: number;
}

export const MoviePlayerModal: React.FC<MoviePlayerModalProps> = ({
  movie,
  user,
  allMovies = [],
  onSelectMovie,
  onClose,
  onOpenSubscribe,
  onOpenAuth,
  onUpdateContinueWatching,
  onToggleWatchlist,
  initialTime = 0
}) => {
  if (!movie) return null;

  // Strict paywall check: only admin or verified active subscriber can watch movies
  const watchCheck = canUserWatchMovie(user, movie);
  const isLocked = !watchCheck.canWatch;
  const isSavedInWatchlist = Boolean(user?.watchlist?.includes(movie.id));

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

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
  const [copiedShare, setCopiedShare] = useState(false);
  const [streamType, setStreamType] = useState<'HLS Stream' | 'MP4 Direct'>('MP4 Direct');

  const hideControlsTimer = useRef<any>(null);

  // 1. Setup Video & HLS Stream Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const isHlsStream = movie.videoUrl.includes('.m3u8') || movie.videoType === 'hls';

    if (isHlsStream) {
      setStreamType('HLS Stream');
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(movie.videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isLocked) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        video.src = movie.videoUrl;
      }
    } else {
      setStreamType('MP4 Direct');
      video.src = movie.videoUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [movie.videoUrl, movie.videoType, isLocked]);

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
      setDuration(videoRef.current.duration || 1);
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
    if (!playerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
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

  const handleShareMovie = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + `?watch=${movie.id}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Find related movies (same language or category, excluding current)
  const relatedMovies = allMovies
    .filter((m) => m.id !== movie.id && (m.language === movie.language || m.category === movie.category))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-[#07070a]/95 backdrop-blur-xl flex flex-col justify-start items-center overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl min-h-screen flex flex-col pb-16">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-40 bg-[#07070a]/90 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-600 text-white shadow-sm shadow-red-600">
              {movie.language} Cinema
            </span>
            <span className="text-xs text-zinc-400 hidden sm:inline">•</span>
            <span className="text-xs text-zinc-300 font-semibold hidden sm:inline">{movie.releaseYear}</span>
            <span className="text-xs text-zinc-400 hidden sm:inline">•</span>
            <span className="text-xs text-zinc-300 font-semibold hidden sm:inline">{movie.duration}</span>
            <h1 className="text-base sm:text-lg font-black text-white truncate max-w-xs sm:max-w-md ml-1">
              {movie.title}
            </h1>
          </div>

          <button
            onClick={() => {
              if (videoRef.current) {
                onUpdateContinueWatching(movie.id, videoRef.current.currentTime, videoRef.current.duration || 1);
              }
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            aria-label="Close Movie Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CINEMATIC VIDEO PLAYER CONTAINER */}
        <div className="px-3 sm:px-6 pt-4">
          <div
            ref={playerWrapperRef}
            onMouseMove={handleMouseMove}
            className="relative w-full aspect-video sm:aspect-[21/9] max-h-[70vh] bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(229,9,20,0.25)] border border-white/10 flex items-center justify-center select-none"
          >
            <video
              ref={videoRef}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-contain"
              playsInline
            />

            {/* Paywall Overlay if Not Verified Subscriber or Admin */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/94 backdrop-blur-md z-20 flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="max-w-md w-full bg-[#13141f] border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-5">
                  {watchCheck.reason === 'PENDING_VERIFICATION' ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                        <Clock className="w-9 h-9 stroke-[2.5]" />
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Verification in Progress</span>
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Payment Under Verification
                        </h3>
                        <p className="text-xs text-amber-300/90 font-medium mt-1">
                          پیمنٹ تصدیق زیرِ غور ہے • ایڈمن کی منظوری کے بعد مووی چلے گی
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed">
                          Your subscription payment has been received! The MovieDuniya administrator is currently reviewing your payment details. As soon as the payment is verified, full HD streaming will be unlocked immediately.
                        </p>
                        {user?.pendingTransactionRef && (
                          <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-left">
                            <span className="text-[10px] text-zinc-400 block uppercase font-bold">Transaction Reference</span>
                            <span className="text-xs font-mono font-bold text-amber-400">{user.pendingTransactionRef}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          onClick={() => window.location.reload()}
                          className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Refresh Verification Status</span>
                        </button>

                        <button
                          onClick={onClose}
                          className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Close Player
                        </button>
                      </div>
                    </>
                  ) : watchCheck.reason === 'LOGIN_REQUIRED' ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
                        <Lock className="w-9 h-9" />
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Account Required</span>
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Sign In to Stream
                        </h3>
                        <p className="text-xs text-red-300/90 font-medium mt-1">
                          مووی دیکھنے کے لیے پہلے اکاونٹ بنائیں یا لاگ ان کریں
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                          Please create an account or sign in to activate your MovieDuniya subscription and watch <span className="text-white font-bold">{movie.title}</span>.
                        </p>
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          onClick={() => {
                            onClose();
                            if (onOpenAuth) onOpenAuth('signup');
                          }}
                          className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-[0_0_25px_rgba(239,68,68,0.7)] cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Create Account / Sign In</span>
                        </button>

                        <button
                          onClick={onClose}
                          className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Browse Catalog
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                        <Crown className="w-9 h-9 fill-black text-black" />
                      </div>

                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Subscription Required</span>
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Active Plan Required
                        </h3>
                        <p className="text-xs text-amber-300/90 font-medium mt-1">
                          مووی دیکھنے کے لیے سبسکرپشن پلان لینا ضروری ہے
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                          All movies on MovieDuniya require an active verified subscription. Choose your plan to stream in full 1080p / 4K HD on any mobile, tablet or PC!
                        </p>
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenSubscribe('quarterly');
                          }}
                          className="w-full py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-[0_0_25px_rgba(239,68,68,0.7)] cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Subscribe Starting at Rs. 199/mo</span>
                        </button>

                        <button
                          onClick={onClose}
                          className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Back to Home
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Center Play Button Overlay on Pause */}
            {!isPlaying && !isLocked && (
              <button
                onClick={togglePlay}
                className="absolute z-10 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_35px_#ef4444] transform hover:scale-110 transition-all cursor-pointer"
                aria-label="Play Video"
              >
                <Play className="w-8 sm:w-9 h-8 sm:h-9 fill-white text-white ml-1" />
              </button>
            )}

            {/* Bottom Controls Bar */}
            {!isLocked && (
              <div
                className={`absolute bottom-0 inset-x-0 p-3 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 transition-opacity duration-300 ${
                  controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Scrubber Bar */}
                <div className="relative mb-3 group/scrub">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 group-hover/scrub:h-2 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all"
                  />
                  <div
                    className="absolute left-0 top-0 h-1.5 group-hover/scrub:h-2 bg-red-600 rounded-lg pointer-events-none"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Left Controls: Play, Skip, Volume, Timer */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 sm:w-5 h-4 sm:w-5 fill-white" /> : <Play className="w-4 sm:w-5 h-4 sm:w-5 fill-white ml-0.5" />}
                    </button>

                    <button
                      onClick={() => skipTime(-10)}
                      className="p-1.5 sm:p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Rewind 10 seconds"
                    >
                      <RotateCcw className="w-4 sm:w-5 h-4 sm:w-5" />
                    </button>

                    <button
                      onClick={() => skipTime(10)}
                      className="p-1.5 sm:p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Forward 10 seconds"
                    >
                      <RotateCw className="w-4 sm:w-5 h-4 sm:w-5" />
                    </button>

                    {/* Volume Slider */}
                    <div className="flex items-center gap-1 sm:gap-2 group/vol">
                      <button
                        onClick={toggleMute}
                        className="p-1.5 sm:p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 sm:w-5 h-4 sm:w-5 text-red-500" /> : <Volume2 className="w-4 sm:w-5 h-4 sm:w-5" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-12 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-600 opacity-80 group-hover/vol:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Time display */}
                    <div className="text-[11px] sm:text-xs font-mono text-zinc-300 ml-1 hidden sm:block">
                      <span>{formatDuration(currentTime)}</span>
                      <span className="text-zinc-500 mx-1">/</span>
                      <span className="text-zinc-500">{formatDuration(duration)}</span>
                    </div>
                  </div>

                  {/* Right Controls: Stream Badge, Quality, Subtitles, Fullscreen */}
                  <div className="flex items-center gap-1.5 sm:gap-3 relative">
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/5">
                      <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                      <span>{streamType}</span>
                    </span>

                    {/* Quality Selector */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowQualityMenu(!showQualityMenu);
                          setShowSubtitleMenu(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
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
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                      >
                        <Subtitles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CC</span>
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
                      className="p-1.5 sm:p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    >
                      {isFullscreen ? <Minimize className="w-4 sm:w-5 h-4 sm:w-5" /> : <Maximize className="w-4 sm:w-5 h-4 sm:w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. MOVIE INFORMATION SECTION (BELOW THE PLAYER) */}
        <div className="px-4 sm:px-6 mt-6">
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0f1019] border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Left details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-red-600 text-white">
                    {movie.language}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white/10 text-zinc-300">
                    {movie.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{movie.releaseYear}</span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{movie.duration}</span>
                  </span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </span>
                  {movie.isVIP ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-amber-300" />
                      <span>VIP EXCLUSIVE</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      FREE STREAM
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {movie.title}
                </h2>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
                  {movie.description}
                </p>

                {/* Genre Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-400 font-bold">Genres:</span>
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-row md:flex-col items-center gap-3 flex-shrink-0">
                {onToggleWatchlist && (
                  <button
                    onClick={() => onToggleWatchlist(movie.id)}
                    className={`w-full px-5 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSavedInWatchlist
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSavedInWatchlist ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{isSavedInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
                  </button>
                )}

                <button
                  onClick={handleShareMovie}
                  className="w-full px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShare ? 'Link Copied!' : 'Share Film'}</span>
                </button>

                <div className="text-[11px] text-zinc-400 text-center flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>HD Stream • Subtitles Ready</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. RELATED MOVIES SECTION */}
        {relatedMovies.length > 0 && (
          <div className="px-4 sm:px-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="text-lg sm:text-xl font-black text-white">
                  More Like This
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                {movie.language} &amp; {movie.category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {relatedMovies.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    if (onSelectMovie) {
                      onSelectMovie(rel);
                    }
                  }}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[#12131d] border border-white/5 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(229,9,20,0.3)] transition-all transform hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900 relative">
                    <img
                      src={rel.poster}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-2 left-2">
                      {rel.isVIP ? (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/90 text-black">
                          VIP
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/90 text-black">
                          FREE
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                      {rel.title}
                    </h4>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between mt-1">
                      <span>{rel.language}</span>
                      <span>{rel.releaseYear}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
