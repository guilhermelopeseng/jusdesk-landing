import { Component, ElementRef, input, signal } from '@angular/core';
import { afterNextRender } from '@angular/core';

@Component({
  selector: 'app-docket-stat',
  templateUrl: './docket-stat.html',
  styleUrl: './docket-stat.scss',
  host: {
    class: 'docket-stat',
  },
})
export class DocketStat {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly suffix = input<string>('');

  protected readonly revealed = signal(false);

  constructor(private readonly host: ElementRef<HTMLElement>) {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.revealed.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.revealed.set(true);
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(this.host.nativeElement);
    });
  }
}
