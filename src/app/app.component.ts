import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, RouterModule],
  template: `
  <body class=''>
        <h1 id="title" class='fw-semibold text-white'>CreateIt</h1>
    <section class="content">
      <router-outlet></router-outlet>
    </section>
  </body>
`,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'default';
}
