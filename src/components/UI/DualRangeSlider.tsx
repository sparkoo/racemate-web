import { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface DualRangeSliderProps {
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  onReset?: () => void;
}

const DualRangeSlider: FunctionalComponent<DualRangeSliderProps> = ({
  minValue,
  maxValue,
  onChange,
  onReset,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  // Calculate positions for the handles
  const minHandlePosition = minValue * 100;
  const maxHandlePosition = maxValue * 100;
  
  // Handle mouse/touch events
  const handlePointerDown = (handle: 'min' | 'max') => (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setIsDragging(handle);
  };
  
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    if (isDragging === 'min') {
      // Prevent min handle from crossing max handle
      const newMin = Math.min(position, maxValue - 0.01);
      onChange(newMin, maxValue);
    } else {
      // Prevent max handle from crossing min handle
      const newMax = Math.max(position, minValue + 0.01);
      onChange(minValue, newMax);
    }
  };
  
  const handlePointerUp = () => {
    setIsDragging(null);
  };
  
  // Add and remove event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      
      // Touch events
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      window.addEventListener('touchcancel', handlePointerUp);
    }
    
    return () => {
      // Mouse events
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      
      // Touch events
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isDragging, minValue, maxValue]);
  
  return (
    <div className="mb-4">
      {/* Slider label */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Zoom Range</span>
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span className="bg-gray-800 px-2 py-1 rounded">{Math.round(minValue * 100)}%</span>
          <span>to</span>
          <span className="bg-gray-800 px-2 py-1 rounded">{Math.round(maxValue * 100)}%</span>
          <button 
            onClick={onReset}
            className="ml-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs transition-colors duration-150 flex items-center"
            title="Reset zoom to full range"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>
      </div>
      
      {/* Slider track */}
      <div 
        ref={sliderRef}
        className="relative h-2 bg-gray-800 rounded-md cursor-pointer my-4"
      >
        {/* Track markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-px h-1 bg-gray-600 self-center" />
          ))}
        </div>
        
        {/* Selected range fill */}
        <div 
          className="absolute h-full bg-blue-600 rounded-md" 
          style={{
            left: `${minHandlePosition}%`,
            width: `${maxHandlePosition - minHandlePosition}%`,
          }}
        />
        
        {/* Min handle */}
        <div 
          className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing -mt-1.5 -ml-2.5 flex items-center justify-center hover:bg-blue-100 transition-colors duration-150 border-2 border-blue-600"
          style={{ left: `${minHandlePosition}%` }}
          onMouseDown={handlePointerDown('min')}
          onTouchStart={handlePointerDown('min')}
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Max handle */}
        <div 
          className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing -mt-1.5 -ml-2.5 flex items-center justify-center hover:bg-blue-100 transition-colors duration-150 border-2 border-blue-600"
          style={{ left: `${maxHandlePosition}%` }}
          onMouseDown={handlePointerDown('max')}
          onTouchStart={handlePointerDown('max')}
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default DualRangeSlider;
