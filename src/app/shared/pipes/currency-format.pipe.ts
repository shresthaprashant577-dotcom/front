import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currencyCode: string = 'USD', display: 'symbol' | 'code' | 'name' = 'symbol'): string {
    if (value == null) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: display,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}