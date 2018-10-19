import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private auth: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.auth.authenticationState.subscribe((user) => {
      if (user) {
        this.router.navigate(['/chats']);
      }
    });
  }

  /**
   * Login
   * Runs the facebook login provider process
   */
  async login() {
    await this.auth.facebookSignIn();
    this.router.navigate(['/chat']);
  }

}
