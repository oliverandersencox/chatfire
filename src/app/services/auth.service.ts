import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { take, switchMap, first, map } from 'rxjs/operators';
import { User } from '../models/user';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;

  constructor(private firestoreService: FirestoreService,
    private angularFireAuth: AngularFireAuth,
    private router: Router) { }


  /**
   * ListenToAuth
   * Listens to the authentication state and returns user when authenticated
   */
  listenToAuth() {
    this.user$ = this.angularFireAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestoreService.doc$<any>(`'users/${user.uid}`);
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * GetUser
   * Returns the user as a promise ready for use with async / await
   */
  getUser() {
    return this.user$.pipe(first()).toPromise();
  }

  /**
   * Facebook login
   * Gets the facebook Auth provider and signs the user in using a pop up auth window
   */
  facebookSignIn() {
    const provider = new auth.FacebookAuthProvider();
    return this.loginUsingPopup(provider);
  }

  /**
   * login Using Popup
   * @param provider
   * Authenticates the user and returns the data to be saved to the database
   */
  private async loginUsingPopup(provider) {
    const authCredential = await this.angularFireAuth.auth.signInWithPopup(provider);
    return this.updateUserData(authCredential.user);
  }

  /**
   * Update User Data
   * @param param0
   * Takes the user data and stores it to the database
   */
  private updateUserData({ uid, email, displayName, photoURL }) {

    const userData = {
      uid,
      email,
      displayName,
      photoURL
    };

    return this.firestoreService.upsert(`users/${userData.uid}`, userData);
  }

  /**
   * Sign Out
   * Unauthenticates the user
   * Returns the users to the home screen
   */
  async signOut() {
    await this.angularFireAuth.auth.signOut();
    return this.router.navigate(['/']);
  }
}
