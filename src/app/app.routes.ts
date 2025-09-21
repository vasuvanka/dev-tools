import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'todo', loadComponent: () => import('./todo/todo.component').then(m => m.TodoComponent) },
  { path: 'ip-address', loadComponent: () => import('./ip-address/ip-address.component').then(m => m.IpAddressComponent) },
  { path: 'url-shortener', loadComponent: () => import('./url-shortener/url-shortener.component').then(m => m.UrlShortenerComponent) },
  { path: 'timer', loadComponent: () => import('./timer/timer.component').then(m => m.TimerComponent) },
  { path: 'base64', loadComponent: () => import('./base64/base64.component').then(m => m.Base64Component) },
  { path: 'json-formatter', loadComponent: () => import('./json-formatter/json-formatter.component').then(m => m.JsonFormatterComponent) },
  { path: 'qr-generator', loadComponent: () => import('./qr-generator/qr-generator.component').then(m => m.QrGeneratorComponent) },
  { path: 'color-picker', loadComponent: () => import('./color-picker/color-picker.component').then(m => m.ColorPickerComponent) },
  { path: 'text-tools', loadComponent: () => import('./text-tools/text-tools.component').then(m => m.TextToolsComponent) },
  { path: 'news' , loadComponent: () => import('./news/news').then(m => m.News)},
  { path: 'resources' , loadComponent: () => import('./resources/resources').then(m => m.Resources)},
  { path: '**', redirectTo: '/' }
];
