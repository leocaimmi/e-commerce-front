import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { LoginSuccessComponent } from './features/auth/pages/login-success/login-success.component';
import { HomeComponent } from './pages/home/home.component';
import { CreateProductComponent } from './features/products/components/create-product.component';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ROLES } from './core/interfaces/Auth-request';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        pathMatch: "full"
    },
    {
        path: "login-success",
        component: LoginSuccessComponent
    },
    {
        path: "admin/create-product",
        component: CreateProductComponent,
        canActivate: [authGuard, roleGuard([ROLES.ADMIN])]
    }
];
