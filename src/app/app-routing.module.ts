import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './chat/chat.component';


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'chats/:id', component: ChatComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}