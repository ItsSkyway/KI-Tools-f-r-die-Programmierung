import { useEffect, useRef, useState } from 'react';

/**
 * FPS Counter Component
 * 
 * Displays real-time frame rate performance metrics in development mode.
 * Shows instantaneous FPS, average FPS over 1 second, and frame time in milliseconds.
 * Color-coded performance indicator: green (60+ FPS), yellow (50-59), red (<50).
 * 
 * Requirements:
 * - Development mode only (process.env.NODE_ENV === 'development')
 * - RAF-based updates (not setInterval)
 * - Tracks frame times over 1-second window
 * - Performance warnings for low FPS
 */
export function FpsCounter() {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [fps, setFps] = useState(60);
  const [avgFps, setAvgFps] = useState(60);
  const [frameTime, setFrameTime] = useState(0);
  const [color, setColor] = useState('green');

  // Store frame times for 1-second window calculation
  const frameTimesRef = useRef([]);
  
  // Store last timestamp for delta calculation
  const lastTimeRef = useRef(Date.now());
  
  // Store RAF ID for cleanup
  const rafIdRef = useRef(null);

  useEffect(() => {
    /**
     * Recursive RAF loop that:
     * 1. Calculates delta time since last frame
     * 2. Converts to instantaneous FPS (1000ms / deltaTime)
     * 3. Stores frame times in a rolling 1-second window
     * 4. Calculates average FPS from the window
     * 5. Determines color based on FPS thresholds
     * 6. Cleans up old frame times outside the 1-second window
     */
    const measureFrameRate = () => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Avoid division by zero on first frame
      if (deltaTime === 0) {
        rafIdRef.current = requestAnimationFrame(measureFrameRate);
        return;
      }

      // Calculate instantaneous FPS: 1000ms / deltaTime in ms
      const instantFps = Math.round(1000 / deltaTime);
      const frameTimeMs = Math.round(deltaTime);

      // Add current frame time to rolling window
      frameTimesRef.current.push({ timestamp: now, deltaTime });

      // Remove frame times older than 1 second (1000ms)
      // This maintains a rolling 1-second window of frame data
      const oneSecondAgo = now - 1000;
      frameTimesRef.current = frameTimesRef.current.filter(
        (frame) => frame.timestamp > oneSecondAgo
      );

      // Calculate average FPS from 1-second window
      // Average FPS = number of frames in 1 second
      const frameCount = frameTimesRef.current.length;
      const averageFps = frameCount > 0 ? frameCount : 0;

      // Determine color based on performance thresholds
      let performanceColor;
      if (instantFps >= 60) {
        performanceColor = 'green'; // Excellent performance
      } else if (instantFps >= 50) {
        performanceColor = 'yellow'; // Acceptable but degraded
      } else {
        performanceColor = 'red'; // Poor performance
      }

      // Update state with metrics and color
      setFps(instantFps);
      setAvgFps(averageFps);
      setFrameTime(frameTimeMs);
      setColor(performanceColor);

      // Continue the RAF loop
      rafIdRef.current = requestAnimationFrame(measureFrameRate);
    };

    // Start the frame rate measurement loop
    rafIdRef.current = requestAnimationFrame(measureFrameRate);

    // Cleanup function to cancel RAF on unmount
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Color to hex mapping for visual clarity
  const colorMap = {
    green: '#10b981',  // Emerald for good performance
    yellow: '#f59e0b', // Amber for warning
    red: '#ef4444',    // Red for critical
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: '600',
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: '6px',
        border: `2px solid ${colorMap[color]}`,
        color: colorMap[color],
        textShadow: `0 0 8px ${colorMap[color]}`,
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(4px)',
        boxShadow: `0 0 16px ${colorMap[color]}80`,
        transition: 'all 0.1s ease',
      }}
    >
      {/* Display format: FPS | AVG | Frame time */}
      FPS: {fps} | AVG: {avgFps} | Frame: {frameTime}ms
    </div>
  );
}

export default FpsCounter;
