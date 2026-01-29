import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'passwordStrength',
  standalone: true
})
export class PasswordStrengthPipe implements PipeTransform {
  transform(password: string): { score: number; label: string; color: string } {
    if (!password) {
      return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Cap at 5
    score = Math.min(score, 5);
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500', 'bg-green-600'];
    
    return {
      score,
      label: labels[score],
      color: colors[score]
    };
  }
}