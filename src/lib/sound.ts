export const playSound = (type: 'success' | 'error' | 'alert') => {
  try {
    let url = '';
    let volume = 0.5;
    
    switch (type) {
      case 'alert':
        url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Chime
        break;
      case 'success':
        url = 'https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3'; // Success pop
        volume = 0.4;
        break;
      case 'error':
        url = 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'; // Error buzz
        volume = 0.3;
        break;
    }
    
    if (url) {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  } catch (e) {}
};
