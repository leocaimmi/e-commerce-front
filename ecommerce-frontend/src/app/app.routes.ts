import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { LoginSuccessComponent } from './features/auth/pages/login-success/login-success.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        pathMatch: "full"
    },
    {
        path: "login-success",
        component: LoginSuccessComponent
    }
];
