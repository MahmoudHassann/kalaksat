import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductDetails } from './components/product-details/product-details';
import { Auth } from './components/auth/auth';
import { Finance } from './components/finance/finance';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'login',component:Auth},
    {path:'home',component:Home},
    {path:'product/:id',component:ProductDetails},
    {path:'finance',component:Finance},
    {path:'**',component:ProductDetails},
];
