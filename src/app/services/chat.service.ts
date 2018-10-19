import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { switchMap, combineLatest, map } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router) { }

  /**
   * Get
   * @param uid
   * Gets a chat as document
   */
  get(uid: string) {
    return this.firestoreService.doc$(`chats/${uid}/messages`);
  }

  /**
   * Create
   * stores a new chat document to the database
   */
  async create() {
    const { uid } = await this.authService.getUser();

    const chat = {
      uid,
      count: 0,
      nickname: null
    };

    const ref = await this.firestoreService.add(`chats`, chat);

    return this.router.navigate(['chats', ref.id]);
  }

  /**
   * Send Message
   * @param chatId
   * @param content
   * Creates message object and adds it to the messages collection
   */
  async sendMessage(chatId, content) {
    const { uid } = await this.authService.getUser();

    const messageData = {
      uid,
      content
    };

    if (uid) {
      this.firestoreService.add(`chats/${chatId}/messages`, messageData);
    }
  }

  /**
   * Delete Message
   * @param chat
   * @param msg
   * Removes the message from the collection
   */
  async deleteMessage(chatId, messageId) {
    const { uid } = await this.authService.getUser();
    return this.firestoreService.delete(`chats/${chatId}/messages/${messageId}`);
  }

}
