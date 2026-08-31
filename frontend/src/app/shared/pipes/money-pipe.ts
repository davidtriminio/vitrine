import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('es-HN', {
  style: 'currency',
  currency: 'HNL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats an amount as Honduran Lempira (LPS), e.g. 1020 -> "L 1,020.00". */
@Pipe({ name: 'money', pure: true })
export class MoneyPipe implements PipeTransform {
  transform(amount: number | null | undefined): string {
    return formatter.format(amount ?? 0);
  }
}
