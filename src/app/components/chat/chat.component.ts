import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  chats: any[] = [];
  chat$: Observable<any>;
  messages$: Observable<any>;
  message: string;
  chatId: string;

  constructor(private route: ActivatedRoute,
    private chatService: ChatService,
    private auth: AuthService) { }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.getAllChats();
  }

  /**
   * Go Back
   * Reset the chat observable and theirfore navgates back
   */
  goBack() {
    this.chat$ = null;
  }

  /**
   * Get All Chats
   */
  getAllChats() {
    this.chatService.getAll().subscribe((chats) => {
      this.chats = chats;
    });
  }

  /**
   * Send
   * @param chatId
   * Send a message if data is present
   */
  send(chatId: string) {
    if (!this.message) {
      console.log('%cNo message entered...', 'color: red; font-weight: bold');
    } else {
      this.chatService.sendMessage(chatId, this.message);
      this.message = '';
    }
  }

  /**
   * Track By
   * @param message
   * Keeps track of new and old data within the array
   */
  trackByUpdatedAt(message) {
    return message.updatedAt;
  }

  /**
   * Create
   * @param name
   * Creates a new chat document in the database
   */
  create(name: any) {
    this.chatService.create(name.value);
  }

  /**
   * Go To Chat
   * @param uid
   * Get the chat data as an observale
   * Run the join function to combine the messages with the owning users
   */
  goToChat(uid: string) {
    const start = this.chatService.get(uid);
    this.chat$ = this.chatService.joinUsers(start);
  }


}
