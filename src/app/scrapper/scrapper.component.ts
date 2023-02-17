import { Component, OnInit } from '@angular/core';
import { API, Auth } from 'aws-amplify';
import { ICurrency, ICurrencyData } from "src/app/Interfaces/i-currency";
import { INews } from "src/app/Interfaces/i-news";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject } from 'rxjs';
import { start } from 'repl';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UrlSerializer } from '@angular/router';
import Swal from 'sweetalert2';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-scrapper',
  templateUrl: './scrapper.component.html',
  styleUrls: ['./scrapper.component.css'],
  animations: [
    trigger("load", [
      // ...
      state(
        "load",
        style({
          opacity: 1
        })
      ),
      state(
        "done",
        style({
          opacity: 0.1
        })
      ),
      transition("load => done", [animate(0)]),
      transition(":enter", [
        animate(
          "20s",
          keyframes([
            style({ transform: "rotate(0deg)", offset: 0 }),
            style({ transform: "rotate(9999deg)", offset: 1 })
          ])
        )
      ])
    ])
  ]
})

export class ScrapperComponent implements OnInit {
  isclick: boolean = false
  listCurr: ICurrency[] = [];
  listSort: ICurrency[] = [];
  PostCurr:any = [];
  listcheckCurr: ICurrency[] = [];
  private datastring: any;
  private TweetString: any = "";
  private TweetCurrencyString: any = "";
  twitterStatus = new FormControl();
  CurrencyStatus = new FormControl();
  public descriptionLength = new BehaviorSubject(0);
  public PostLength = new BehaviorSubject(0);
  listFlag?: ICurrencyData[];
  private checklength: any;
  InverseCurrList: any = [];
  DeInverseCurrList: any = [];
  public iteration: number = 1;
  inverseCurr: any = [];
  enableCurr: any = [];

  private headers = new Headers();
  
  constructor(private http:HttpClient) { 
    this.twitterStatus.valueChanges.subscribe((v)=>{
      if(v.length > 280){
        this.PostLength.next(v.length);
        Swal.fire('Twitter Limited Exceeded!', 'Kindly Limit Characters to 280 Chars!', 'warning');
      }
      else{
        this.PostLength.next(v.length);
      }
    });

    this.CurrencyStatus.valueChanges.subscribe((v)=>{
      if(v.length > 280){
        this.descriptionLength.next(v.length);
        Swal.fire('Twitter Limited Exceeded!', 'Kindly Limit Characters to 280 Chars!', 'warning');
      }
      else{
        this.descriptionLength.next(v.length);
      }
    });

  }

  ngOnInit(): void {
    this.listCurr = []
    this.listcheckCurr = []

    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/getCurrency').then((data:any) => {
      JSON.parse(data).forEach((va:any) => {
        const cur = va.RatePair.split("")
        cur.splice(0,3)
        va.RatePair = cur.join("")
        this.listCurr.push(va);
      })

      this.listCurr?.forEach((v)=>{
        v.Amount = (Math.round(Number(v.Amount) * 10000 ) / 10000).toString();
        if(Number(v.ChangePercent) == 0){
          v.ChangePercent = v.ChangePercent;
        }
        else{
          v.ChangePercent = (Math.round(Number(v.ChangePercent) * 100 ) / 100).toString();
        }
      });

      // @ts-ignore
      API.get('TwiterBotCRUD', '/items/listflag').then((value) => {
        this.listFlag = value.Items[0].FlagData;
        this.listFlag?.forEach((v:any) => {
          if(v.Value == true) {
            this.inverseCurr.push(v.Currency)
          }
        })
        this.inverseFlags();
      });

      //@ts-ignore
      API.get('TwiterBotCRUD', '/items/listenableflag').then((val:any) => {
        val.Items[0].FlagData?.forEach((v:any) => {
          if(v.Value == true) {
            this.enableCurr.push(v.Currency)
          }
        })
        this.enableFlags();
      })
    })


    setTimeout(() => {this.ngOnInit() }, 1000 * 60);
    console.log("Refreshed");
  }

  conditionalFetch() {
    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/getpercent').then((value) => {
      const negVal = Number(value.Items[0].NegValue)
      const posVal = Number(value.Items[0].PosValue)
      console.log(typeof negVal)
      this.listCurr.forEach((val:any) => {
        val.ChangePercent = Number(val.ChangePercent)
        if(val.ChangePercent > posVal) {
          this.listcheckCurr.push(val)
          // this.listcheckCurr.sort((a,b) => a.ChangePercent.toString().localeCompare(b.ChangePercent));
        }
        if(val.ChangePercent < negVal) {
          this.listcheckCurr.push(val)
        }
      })
      this.listcheckCurr.sort((a,b) => a.ChangePercent.toString().localeCompare(b.ChangePercent));
    })
  }

  inverseFlags() {
    this.listCurr.forEach((v:any) => {
      if(this.inverseCurr.includes(v.RatePair)) {
        v.Amount = (Math.round(((1/Number(v.Amount)) + Number.EPSILON) * 10000) / 10000).toString();
        v.ChangePercent = (-1 * Number(v.ChangePercent)).toString();
        this.TweetString = "";
      }
    })
    this.listCurr.sort((a,b) => a.ChangePercent.toString().localeCompare(b.ChangePercent));
    this.conditionalFetch();
  }

  enableFlags() {
    this.listCurr.forEach((v:any) => {
      if(this.enableCurr.includes(v.RatePair)) {
        v.Flag = true;
      }
      else {
        v.Flag = false;
      }
    })
  }

  disable(){
    this.isclick = true

  }

  FetchCurrencyPost(){
    this.TweetCurrencyString = "";
    this.PostCurr = [];

    this.listcheckCurr.forEach((val:any) => {
        if(this.inverseCurr.includes(val.RatePair)) {
          if(val.ChangePercent > '0'){
            this.TweetString += 'Currency: ' + 'CAD/' + val.RatePair + ', Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔺') + '\n';
          }
          else{
            this.TweetString += 'Currency: ' + 'CAD/' + val.RatePair + ', Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔻') + '\n';
          }
        }
  
        else {
          if(val.ChangePercent > '0'){
            this.TweetString += 'Currency: ' + val.RatePair + '/CAD, Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔺') + '\n';
          }
          else{
            this.TweetString += 'Currency: ' + val.RatePair + '/CAD, Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔻') + '\n';
          }
        }
        this.CurrencyStatus.setValue(this.TweetString);
    })
  }

  FetchTwitterPost(){
    this.TweetString = "";
    this.PostCurr = [];

    this.listCurr.forEach((val:any) => {
      if (this.enableCurr.includes(val.RatePair)) {
        if(this.inverseCurr.includes(val.RatePair)) {
          if(val.ChangePercent > '0'){
            this.TweetString += 'Currency: ' + val.RatePair + '/CAD, Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔺') + '\n';
          }
          else{
            this.TweetString += 'Currency: ' + val.RatePair + '/CAD, Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔻') + '\n';
          }
        }
  
        else {
          if(val.ChangePercent > '0'){
            this.TweetString += 'Currency: ' + 'CAD/' + val.RatePair + ', Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔺') + '\n';
          }
          else{
            this.TweetString += 'Currency: ' + 'CAD/' + val.RatePair + ', Rate: ' + val.Amount + ', Change: ' + val.ChangePercent + '%' + new String('🔻') + '\n';
          }
        }
        this.twitterStatus.setValue(this.TweetString);
      }
      else if(this.enableCurr.length == 0) {
        Swal.fire('No Currency Enabled', 'Nothing to Fetch here!', 'info');
      }
    })
  }

  async postallTwitter() {
    this.checklength = this.twitterStatus.value;
    if(this.checklength.length <= 280){
      API.post('TwiterBotCRUD', '/items/twitterpostall', {
        body: {
          twitterStatus: this.twitterStatus.value
        }
      }).then((v) => {
        Swal.fire('Successful', 'Your tweet was posted successfully!', 'success');
        window.location.reload()
      }).catch((error)=>{
        console.log(error);
        Swal.fire('Oops', 'Something went wrong!', 'error');
      })
    }
    else{
      Swal.fire('Oops', 'Something went wrong!', 'error');
    }
  }

  async postcheckTwitter() {
    API.post('TwiterBotCRUD', '/items/twitterpostall', {
      body: {
        twitterStatus: this.CurrencyStatus.value
      }
    }).then((v) => {
      Swal.fire('Successful', 'Your tweet was posted successfully!', 'success');
      window.location.reload()
    }).catch((error)=>{
      console.log(error);
      Swal.fire('Oops', 'Something went wrong!', 'error');
    })
  }
}