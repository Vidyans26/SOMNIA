// utils/formatters.ts
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSeverityColor = (severity: string): string => {
  if (severity.includes('Normal')) return '#00ff88';
  if (severity.includes('Mild')) return '#ffaa00';
  if (severity.includes('Moderate')) return '#ff9500';
  if (severity.includes('Severe')) return '#ff4444';
  return '#4a9eff';
};

export const getAHISeverity = (ahi: number): string => {
  if (ahi < 5) return "Normal";
  if (ahi < 15) return "Mild Sleep Apnea";
  if (ahi < 30) return "Moderate Sleep Apnea";
  return "Severe Sleep Apnea";
};