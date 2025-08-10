import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface VideoSlideProps {
  videos: {
    id: string;
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    likes: number;
    duration: string;
  }[];
}
const VideoSlide = ({
  videos
}: VideoSlideProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % videos.length);
    setIsPlaying(false);
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
  };
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleVideoClick = () => {
    togglePlay();
  };
  useEffect(() => {
    setIsPlaying(false);
    setLiked(false);
  }, [currentIndex]);
  if (!videos.length) return null;
  const currentVideo = videos[currentIndex];
  return <div className="flex justify-center items-center py-2">
      <div className="relative w-full max-w-md">
        <Card className="relative overflow-hidden bg-black rounded-2xl aspect-[9/16] max-h-[600px]">
        {/* Video Container */}
        <div ref={containerRef} className="relative w-full h-full cursor-pointer" onClick={handleVideoClick}>
          <video ref={videoRef} src={currentVideo.url} poster={currentVideo.thumbnail} className="w-full h-full object-cover" loop muted={isMuted} playsInline onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
          }} />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm" onClick={e => {
              e.stopPropagation();
              togglePlay();
            }}>
                <Play className="w-8 h-8 text-white ml-1" />
              </Button>
            </div>}
        </div>

        {/* Navigation Arrows */}
        <Button size="sm" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm" onClick={e => {
          e.stopPropagation();
          prevSlide();
        }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>

        <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm" onClick={e => {
          e.stopPropagation();
          nextSlide();
        }}>
          <ChevronRight className="w-5 h-5 text-white" />
        </Button>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          {/* Video Info */}
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
              {currentVideo.title}
            </h3>
            <p className="text-white/80 text-xs line-clamp-2">
              {currentVideo.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0" onClick={e => {
                e.stopPropagation();
                toggleMute();
              }}>
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0" onClick={e => {
                e.stopPropagation();
                setLiked(!liked);
              }}>
                <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-current' : 'text-white'}`} />
              </Button>

              <Button size="sm" variant="ghost" className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0" onClick={e => {
                e.stopPropagation();
                // Handle share
              }}>
                <Share className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Indicators */}
        <div className="absolute top-4 right-4 flex gap-1">
          {videos.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/40'}`} />)}
        </div>

        {/* Duration */}
        <div className="absolute top-4 left-4">
          <span className="text-white text-xs bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
            {currentVideo.duration}
          </span>
        </div>
      </Card>
      </div>
    </div>;
};
export default VideoSlide;