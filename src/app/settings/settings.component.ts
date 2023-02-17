import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { API } from 'aws-amplify';
import { ICurrency, ICurrencyData } from '../Interfaces/i-currency';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  posPercent = new FormControl
  negPercent = new FormControl
  listCurr?: ICurrency[];
  listFlag?: ICurrencyData[];
  listenableFlag?: any;
  postSchedule!: boolean;
  isEnable!: boolean;
  isDisable!: boolean;

  constructor() {
   }

  ngOnInit(): void {
    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/getpercent').then((value) => {
      this.posPercent.setValue(value.Items[0].PosValue)
      this.negPercent.setValue(value.Items[0].NegValue)
    });

     //@ts-ignore
     API.get('TwiterBotCRUD', '/items/getpostschedule').then((value) => {
      this.postSchedule = value.Items[0].Post
    });

    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/listallcurrency').then((value) => {
      // console.log(value.Items)
      this.listCurr = value.Items
     
    });

    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/listflag').then((value) => {
      // console.log(value.Items)
      this.listFlag = value.Items[0].FlagData;
    });

    //@ts-ignore
    API.get('TwiterBotCRUD', '/items/listenableflag').then((value) => {
      // console.log(value.Items)
      this.listenableFlag = value.Items[0];
      this.listenableFlag.FlagData.forEach((v: any)=>{
        if(v.Value == true){
          this.isEnable = false;
          this.isDisable = true;
        }else if(v.Value == false){
          this.isEnable = true;
          this.isDisable = false;
        }  
      })
    });
    
  }

  setPercent() {
    API.post('TwiterBotCRUD', '/items/setpercent', {
      body: {
        PosValue: this.posPercent.value,
        NegValue: this.negPercent.value
      }
    })
  }

  pausePostSchedule() {
    if(this.postSchedule == true) {
      API.post('TwiterBotCRUD', '/items/setpostschedule', {
        body: {
          Value: false
        }
      })
      this.postSchedule = false
    }
  }

  resumePostSchedule() {
    if(this.postSchedule == false) {
      API.post('TwiterBotCRUD', '/items/setpostschedule', {
        body: {
          Value: true
        }
      })
      this.postSchedule = true
    }
  }

  deInverseflag(list:any) {
    list.Value = false
    API.put('TwiterBotCRUD', '/items/updateflag', {
      body: {
        Pk: list.Pk,
        Sk: list.Sk,
        FlagData: this.listFlag
      }
    });
  }

  inverseflag(list:any) {
    list.Value = true
    API.put('TwiterBotCRUD', '/items/updateflag', {
      body: {
        Pk: list.Pk,
        Sk: list.Sk,
        FlagData: this.listFlag
      }
    });
  }

  enableAll(){
    this.listenableFlag.FlagData.forEach((v: any)=>{
      v.Value = true;
      this.isEnable = false;
      this.isDisable = true;
    })
    API.put('TwiterBotCRUD', '/items/updateenableflag', {
      body: {
        Pk: this.listenableFlag.Pk,
        Sk: this.listenableFlag.Sk,
        FlagData: this.listenableFlag.FlagData
      }
    })
  }

  disableAll(){
    this.listenableFlag.FlagData.forEach((v: any)=>{
      v.Value = false;
      this.isDisable = false;
      this.isEnable = true;
    })
    API.put('TwiterBotCRUD', '/items/updateenableflag', {
      body: {
        Pk: this.listenableFlag.Pk,
        Sk: this.listenableFlag.Sk,
        FlagData: this.listenableFlag.FlagData
      }
    })
  }

  enableFlag(list:any) {
    list.Value = true
    API.put('TwiterBotCRUD', '/items/updateenableflag', {
      body: {
        Pk: list.Pk,
        Sk: list.Sk,
        FlagData: this.listenableFlag.FlagData
      }
    }).then((v)=>{
      console.log(v)
    });
  }

  disbaleFlag(list:any) {
    list.Value = false
    API.put('TwiterBotCRUD', '/items/updateenableflag', {
      body: {
        Pk: list.Pk,
        Sk: list.Sk,
        FlagData: this.listenableFlag.FlagData
      }
    }).then((v)=>{
      console.log(v)
    });
  }

}
