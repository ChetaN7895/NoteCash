import { isNotificationSoundMuted } from '@/hooks/useNotificationSound';

// Generates a subtle, pleasant notification sound using Web Audio API
export const playNotificationSound = () => {
  // Check if notifications are muted
  if (isNotificationSoundMuted()) {
    return;
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for the main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification frequency (C5 note)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Subtle volume with quick fade
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Add a second higher tone for a pleasant chime effect
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    // E5 note for harmony
    oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator2.type = 'sine';
    
    gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode2.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.15);
    gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
    
    oscillator2.start(audioContext.currentTime + 0.1);
    oscillator2.stop(audioContext.currentTime + 0.4);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Notification sound not available:', error);
  }
};
