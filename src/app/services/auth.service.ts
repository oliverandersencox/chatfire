import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { User } from '../models/user';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: BehaviorSubject<User> = new BehaviorSubject(null);
  authenticationState = new BehaviorSubject(false);

  constructor(private firestoreService: FirestoreService,
    private angularFireAuth: AngularFireAuth,
    private router: Router) {
    this.checkAuth();
  }

  /**
   * Check Auth
   * Gets the firebase auth object and checks for an active user
   */
  checkAuth() {
    this.angularFireAuth.authState
      .subscribe((user) => {

        this.getUserFromDatabase(user.uid);

        if (auth !== null) {
          this.authenticationState.next(true);
        } else {
          this.authenticationState.next(false);
        }
      });
  }

  /**
   * Is Authenticated
   * simple checks the authstate subject's value
   */
  isAuthenticated() {
    return this.authenticationState.value;
  }

  /**
   * Get User From Database
   * @param uid
   * Find the user in the database and returns it as a promise
   * Then adds to the subject
   */
  async getUserFromDatabase(uid: string) {
    const user = await this.firestoreService.doc$<User>(`users/${uid}`).pipe(first()).toPromise();
    this.user$.next(user);
  }

  /**
   * GetUser
   * Returns the user
   */
  getUser() {
    return this.user$;
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

    return this.firestoreService.update(`users/${userData.uid}`, userData);
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
