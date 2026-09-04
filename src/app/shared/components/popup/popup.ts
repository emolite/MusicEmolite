import { Component, inject } from '@angular/core';
import { PopupService } from '../../../core/services/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class PopupComponent {

  popupService = inject(PopupService);

}
