import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlassThemeService {
  getGlassStyles() {
    return {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      webkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      borderRadius: '16px'
    };
  }

  getGlassCardStyles() {
    return {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(15px)',
      webkitBackdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px'
    };
  }

  getGlassInputStyles() {
    return {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      webkitBackdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      color: '#333',
      '::placeholder': {
        color: 'rgba(51, 51, 51, 0.6)'
      }
    };
  }

  getGlassButtonStyles() {
    return {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      webkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      color: '#333',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }
    };
  }
}
