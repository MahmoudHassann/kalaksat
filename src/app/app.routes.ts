import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductDetails } from './components/product-details/product-details';
import { Auth } from './components/auth/auth';
import { Finance } from './components/finance/finance';
import { BookingDetails } from './components/booking-details/booking-details';
import { Products } from './components/products/products';
import { About } from './components/about/about';
import { PersonalInfo } from './components/personal-info/personal-info';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'login',component:Auth},
    {path:'home',component:Home},
    {path:'products',component:Products},
    {path:'product/:id',component:ProductDetails},
    {path:'finance',component:Finance},
    {path:'booking',component:BookingDetails},
    {path:'about',component:About},
    {path:'info',component:PersonalInfo},
    {path:'**',component:ProductDetails},
];
