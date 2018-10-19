import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chat$: Observable<any>;
  message: string;
  chatId: string;

  constructor(private route: ActivatedRoute,
              private chatService: ChatService) { }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.chat$ = this.chatService.get(this.chatId);
  }

  send() {
    if (!this.message) {
      console.log('%cNo message entered...', 'color: red; font-weight: bold');
    } else {
      this.chatService.sendMessage(this.chatId, this.message);
      this.message = '';
    }
  }

  trackByUpdatedAt(message) {
    return message.updatedAt;
  }

}
