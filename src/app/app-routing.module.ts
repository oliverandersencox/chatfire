import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthGuard } from './services/authGuard.service';


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'chats', component: ChatComponent, canActivate: [AuthGuard] },
    { path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
