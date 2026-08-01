import { Component } from '@angular/core';
import { DocketStat } from '../../../../shared/components/docket-stat/docket-stat';

@Component({
  selector: 'app-hero',
  imports: [DocketStat],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
