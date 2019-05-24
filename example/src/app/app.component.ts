import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'example';

  constructor(
    private translateService: TranslateService,
  ) {
    this.title = translateService.instant('This is the key using by translate service in controller');
  }
}
