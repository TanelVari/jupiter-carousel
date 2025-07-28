import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = []

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Enable for debugging only
      bindToComponentInputs: true, // Angular 16+ feature for better route data binding
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
