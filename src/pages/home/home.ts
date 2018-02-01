import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import * as socketIoClient from 'socket.io-client';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private message: string;
  private socket: SocketIOClient.Socket;
  private myName: string;
  private messages: any[] = [];
  constructor(public navCtrl: NavController, private alertCtrl: AlertController) {
    // this.myName = new Date().toISOString();
    this.presentPrompt();
  }

  connect() {
    this.socket = socketIoClient.connect("http://localhost:3000");
    this.socket.on('connect', () => {
      this.socket.emit('register', this.myName);
    });
    this.socket.on('broadcast', (data: any) => {
      this.messages.push({ name: data.name != this.myName ? data.name : 'Eu', message: data.message});
    });
    this.socket.on('user_entered', (data:any) => {
      if(data != this.myName)
        this.messages.push({ name: data, message: 'Entrou na sala'});
    });
    this.socket.on('user_exited', (data:any) => {
      if(data != this.myName)
        this.messages.push({ name: data, message: 'Saiu da sala'});
    });
  }

  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Bate-Papo TOTVS',
      inputs: [
        {
          name: 'myName',
          placeholder: 'Seu Nome'
        }
      ],
      buttons: [
        {
          text: 'Entrar',
          handler: data => {
            if(data.myName) {
              this.myName = data.myName;
              this.connect();
              return true;
            } else {
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  sendMessage(): void {
    this.socket.emit('message', this.message);
    this.message = '';
  }

}
