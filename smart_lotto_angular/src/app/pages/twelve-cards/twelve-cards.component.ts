import { Component, OnInit } from '@angular/core';
import {CommonService} from '../../services/common.service';
import {DrawTime} from '../../models/DrawTime.model';
import {User} from '../../models/user.model';
import {AuthService} from '../../services/auth.service';
import {GameType} from '../../models/GameType.model';
import {GameTypeService} from '../../services/game-type.service';
import Swal from 'sweetalert2';
import {PlayGameService} from '../../services/play-game.service';
import {isEmpty} from 'rxjs/operators';
import {empty} from 'rxjs';

@Component({
  selector: 'app-twelve-cards',
  templateUrl: './twelve-cards.component.html',
  styleUrls: ['./twelve-cards.component.scss']
})
export class TwelveCardsComponent implements OnInit {
  cardActiveDrawTime: DrawTime;
  user: User;
  playDetails: any[] = [];
  gameTypes: GameType[] = [];
  inputData: any[];
  cardResultVisibility = false;
  totalPurchasedPrice = null;
  totalPurchasedQuantity = null;
  alwaysTime: number;
  remainingTime: number;
  mrp = null;

  public showResultSheet = false;




  constructor(private commonService: CommonService, private authService: AuthService, private gameTypeService: GameTypeService, private playGameService: PlayGameService) {
    this.gameTypes = this.gameTypeService.getGameType();
    this.gameTypeService.getGameTypeListener().subscribe((response: GameType[]) => {
      this.gameTypes = response;
      // console.log(this.gameTypes);
    });

    // console.log(this.gameTypes);
  }

  ngOnInit(): void {

    this.inputData = [];
    for (let i = 1; i <= 11 ; i++){
      this.inputData[i] = [];
    }
    this.cardResultVisibility = false;

    const user = JSON.parse(localStorage.getItem('user'));

    this.authService.userBehaviorSubject.subscribe(user => {
      this.user = user;
    });

    this.commonService.currentTimeBehaviorSubject.asObservable().subscribe(response => {
      this.alwaysTime = response;
    });
    this.commonService.CardRemainingTimeBehaviorSubject.asObservable().subscribe(response => {
      this.remainingTime = response;
      // console.log(this.remainingTime);
      // const x = String(this.remainingTime).split(':');
      // // tslint:disable-next-line:radix
      // this.value = (((parseInt(x[1])*60)+parseInt(x[2]))/(15*60))*100;
    });


    // @ts-ignore
    this.cardActiveDrawTime = this.commonService.getCardActiveDrawTime();
    this.commonService.getCardActiveDrawTimeListener().subscribe((response: DrawTime) => {
      this.cardActiveDrawTime = response;
    });

    console.log(this.cardActiveDrawTime);

  }

  detailsData(value: number, gameCombination){
    let totalPrice = 0;
    let totalQuantity = 0;

    const tempPlayDetail = {
      gameTypeId: this.gameTypes[0].gameTypeId,
      quantity: value ? value : 0,
      cardCombinationId: gameCombination,
      mrp: this.gameTypes[0].mrp,
      payout: this.gameTypes[0].payout,
      commission: this.gameTypes[0].commission
    };

    // @ts-ignore
    if (tempPlayDetail.quantity === 0){
      // tslint:disable-next-line:no-shadowed-variable
      const x = this.playDetails.findIndex(x => x.cardCombinationId === gameCombination);
      this.playDetails.splice(x, 1);
    }else{
      const x = this.playDetails.findIndex(x => x.cardCombinationId === gameCombination);
      if (x >= 0) {
        this.playDetails[x].quantity = tempPlayDetail.quantity;
      }else{
        this.playDetails.push(tempPlayDetail);
      }
    }

    this.playDetails.forEach(function(value){
      totalPrice = totalPrice + (value.quantity * value.mrp);
      // tslint:disable-next-line:radix
      totalQuantity = totalQuantity + parseInt(value.quantity) ;
    });
    // tslint:disable-next-line:radix triple-equals
    this.totalPurchasedPrice = totalPrice ? totalPrice : null;
    this.mrp = totalPrice ? this.gameTypes[0].mrp : null;
    this.totalPurchasedQuantity = totalQuantity ? totalQuantity : null;
  }

  clear(){
    this.inputData = [];
    for (let i = 1; i <= 11 ; i++){
      this.inputData[i] = [];
    }
    this.playDetails = [];
    this.totalPurchasedPrice = null;
    this.mrp = null;
    this.totalPurchasedQuantity = null;
  }

  saveUserInput(){
    // const playMaster = {
    //   drawMasterId: this.activeDrawTime.drawId,
    //   userId: this.user.userId,
    // };

    const masterData = {
      playMaster: {drawMasterId: this.cardActiveDrawTime.drawId, terminalId: this.user.userId},
      playDetails: this.playDetails
    };


    this.playGameService.saveUserPlayInputDetailsCard(masterData).subscribe(response => {
      if (response.success === 1){

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Ticket purchased',
          showConfirmButton: false,
          timer: 1000
        });

        this.authService.setUserBalanceBy(response.remainingBal);
        this.clear();
        // this.inputData = [];
        // for (let i = 1; i <= 11 ; i++){
        //   this.inputData[i] = [];
        // }
        // this.playDetails = [];
      }else{
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Validation error',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });

    // console.log(masterData);
    // console.log(this.playDetails);
  }

  viewResult(){
    this.showResultSheet = true ;
  }


}
