import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { firestore } from 'firebase';
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
    return this.firestoreService.doc$(`chats/${uid}`);
  }

  /**
   * Get All
   * returns all the chats in the database
   * Limited to 20 chats
   */
  getAll() {
    return this.firestoreService.colWithIds$(`chats`, ref =>
      ref.limit(20));
  }

  /**
   * Create
   * stores a new chat document to the database
   */
  async create(name: string) {
    const { uid } = await this.authService.getUser().value;

    const data = {
      uid,
      createdAt: Date.now(),
      count: 0,
      nickname: name,
      messages: []
    };

    const docRef = await this.firestoreService.add('chats', data);

  }

  /**
   * Send Message
   * @param chatId
   * @param content
   * Creates message object and adds it to the messages collection
   */
  async sendMessage(chatId, content) {
    const { uid } = await this.authService.getUser().value;

    const data = {
      uid,
      content,
      createdAt: Date.now()
    };

    if (uid) {
      this.firestoreService.update(`chats/${chatId}`, { messages: firestore.FieldValue.arrayUnion(data) });
    }
  }

  /**
   * Delete Message
   * @param chat
   * @param msg
   * Removes the message from the collection
   */
  async deleteMessage(chatId, messageId) {
    const { uid } = await this.authService.getUser().value;
    return this.firestoreService.delete(`chats/${chatId}/messages/${messageId}`);
  }

  /**
   * Join Users
   * @param chat$
   * Takes the chat document observable and extracts the messages
   * Takes the unqiue user ID's and retrives user data for each into an obervable
   * Joins these users to each message
   */
  joinUsers(chat$: Observable<any>) {
    let chat;
    const joinKeys = {};

    return chat$.pipe(
      switchMap(c => {
        // Unique User IDs
        chat = c;
        const uids = Array.from(new Set(c.messages.map(v => v.uid)));

        // Firestore User Doc Reads
        const userDocs = uids.map(u =>
          this.firestoreService.doc(`users/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map(arr => {
        arr.forEach(v => (joinKeys[(<any>v).uid] = v));
        chat.messages = chat.messages.map(v => {
          return { ...v, user: joinKeys[v.uid] };
        });

        return chat;
      })
    );
  }

}
