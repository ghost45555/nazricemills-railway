import { Component } from '@angular/core';
import { HeroComponent } from '../../shared/components/hero/hero.component';

@Component({
  selector: 'app-extra-info',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './extra-info.component.html',
  styleUrl: './extra-info.component.css'
})
export class ExtraInfoComponent {

}
