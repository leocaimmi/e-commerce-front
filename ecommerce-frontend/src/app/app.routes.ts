import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        pathMatch: "full"
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "shop",
        redirectTo: "",
        pathMatch: "full"
    },
    {
        path: "categories",
        redirectTo: "",
        pathMatch: "full"
    }
];
