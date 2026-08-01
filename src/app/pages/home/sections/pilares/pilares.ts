import { Component } from '@angular/core';
import { DocketStat } from '../../../../shared/components/docket-stat/docket-stat';

@Component({
  selector: 'app-pilares',
  imports: [DocketStat],
  templateUrl: './pilares.html',
  styleUrl: './pilares.scss',
  host: {
    id: 'pilares',
  },
})
export class Pilares {}
