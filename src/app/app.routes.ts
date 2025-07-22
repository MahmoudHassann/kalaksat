import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductDetails } from './components/product-details/product-details';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home',component:Home},
    {path:'product/:id',component:ProductDetails},
];
