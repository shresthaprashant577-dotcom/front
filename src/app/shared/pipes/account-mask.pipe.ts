import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountMask',
  standalone: true
})
export class AccountMaskPipe implements PipeTransform {
  transform(value: string, visibleDigits: number = 4): string {
    if (!value) return '';
    
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= visibleDigits * 2) {
      return cleaned;
    }
    
    const lastDigits = cleaned.slice(-visibleDigits);
    const firstDigits = cleaned.slice(0, visibleDigits);
    const maskedLength = cleaned.length - (visibleDigits * 2);
    const mask = '*'.repeat(maskedLength);
    
    return `${firstDigits}${mask}${lastDigits}`;
  }
}