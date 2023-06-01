import { Component, NgModule } from '@angular/core';
@Component({
  selector: 'app-root',
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
  title = 'Create It';
} 
