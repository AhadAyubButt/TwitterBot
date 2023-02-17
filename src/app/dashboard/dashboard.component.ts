import { Component, OnInit } from '@angular/core';
import { API } from 'aws-amplify';
import { ICurrency } from "src/app/Interfaces/i-currency";
import { INews, INewsData } from "src/app/Interfaces/i-news";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { kStringMaxLength } from 'buffer';
import { CheckboxComponent } from '@aws-amplify/ui-angular';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DatePipe],
})

export class DashboardComponent implements OnInit {
  listNews?: INews[];
  apiNews: any;
  newListNews?: any;
  isclick: boolean= false
  countryArr: any = [];
  newCountryArr: any = [];
  impactArr: any = [];
  newImpactArr: any = [];
  country = new FormControl;
  impact = new FormControl;
  StartDate = new FormControl;
  EndDate = new FormControl;
  newsArr: any = [];
  private TweetString: any = "";
  private checklength: any;
  NewsStatus = new FormControl();
  CheckBox = new CheckboxComponent;
  index: any;
  url: any;
  remainingText: any;
  public descriptionLength = new BehaviorSubject(0);

  constructor(private fb: FormBuilder, private http:HttpClient, public datepipe: DatePipe) {
    
    let dateTime = new Date();
    let NextDate = new Date();

    NextDate.setDate(dateTime.getDate() + 1);
    let latest_date = this.datepipe.transform(dateTime, 'yyyy-MM-dd');

    let Next_Date = this.datepipe.transform(NextDate, 'yyyy-MM-dd');
    this.StartDate.setValue(latest_date);

    this.EndDate.setValue(Next_Date);
    this.NewsStatus.valueChanges.subscribe((v)=>{
      
      if(v.length > 280){
        this.descriptionLength.next(v.length)
        Swal.fire('Twitter Limited Exceeded!', 'Kindly Limit Characters to 280 Chars!', 'warning');
      }
      else{
        this.descriptionLength.next(v.length)
      }
    });
  }

  ngOnInit(): void {}
  disable(){
    this.isclick = true
  }

  getDates(){
    this.http.get('https://financialmodelingprep.com/api/v3/economic_calendar?from='+this.StartDate.value+'&to='+this.EndDate.value+'&apikey=02a381e490e2ddd069b2f29403b1ff18').subscribe((data) => {
      this.apiNews = data;
      this.newListNews = data;
      this.apiNews.forEach((v:any)=>{
        // v.date = this.datepipe.transform(v.date, 'MMM-dd-YYYY h:mm', 'GMT-4');
        // v.date = new DatePipe('en-ca').transform(v.date, 'yyyy-MM-dd hh:mm:ss', 'GTM-4');
      })
      this.apiNews.forEach((v:any) => {
      this.countryArr.push(v.country);
      this.impactArr.push(v.impact);
      })

      this.newCountryArr = [...new Set(this.countryArr)];
      this.newCountryArr.sort();
      this.newImpactArr = [...new Set(this.impactArr)];
      this.newImpactArr.sort();
    });
  }

  get sortData() {
    return this.apiNews.sort((a:any, b:any) => {
      return <any>new Date(b.date) - <any>new Date(a.date);
    });
  }

  // onImpactSearch(){
  //   this.newListNews = []
  //   this.apiNews?.forEach((value:any) => {
  //     if (value.impact == this.impact.value) {
  //       this.newListNews!.push(value)
  //     }
  //   })
  // }

  clearFilters(){
    this.impact.setValue(null);
    this.country.setValue(null);
    this.http.get('https://financialmodelingprep.com/api/v3/economic_calendar?from='+this.StartDate.value+'&to='+this.EndDate.value+'&apikey=02a381e490e2ddd069b2f29403b1ff18').subscribe((data) => {
      this.newListNews = data;
    });
  }

  onSearch() {
    if(this.impact.value == null && this.country.value == null){
      Swal.fire('No Filter Selected!', 'Kindly select an option.', 'info');
    }
    else{
      if(this.impact.value == null && this.country.value != null){
        this.newListNews = [];
        this.apiNews?.forEach((value:any) => {
          if (value.country == this.country.value) {
            this.newListNews!.push(value)
          }
        });
      }
      else if(this.country.value == null && this.impact.value != null){
        this.newListNews = []
        this.apiNews?.forEach((value:any) => {
          if (value.impact == this.impact.value) {
            this.newListNews!.push(value)
          }
        });
      }
      else if(this.country.value != null && this.impact.value != null){
        this.newListNews = []
        this.apiNews?.forEach((value:any) => {
          if (value.impact == this.impact.value && value.country == this.country.value) {
            this.newListNews!.push(value)
          }
        });
      }
    }
  }

  onCheckboxChange(checked:any, event: any) {
    // console.log(checked.target.value)
    if(checked.target.checked){
      this.newsArr.push(event)
    }
    else{
      this.newsArr.pop[checked.length];
      this.newsArr.forEach((v:any) => {
        if(v.event == checked.target.value){
          this.index = this.newsArr.indexOf(v, 0);
          if (this.index > -1) {
            this.newsArr.splice(this.index, 1);
        }
        }
      })
    }
  }

  postNews(){
    this.checklength = this.NewsStatus.value;

    if(this.checklength.length <= 280){
      this.NewsStatus.setValue(this.checklength);
    }
    else{
      this.TweetString = "";
      Swal.fire('Twitter Limited Exceeded!', 'Kindly Limit Characters to 280 Chars!', 'warning');
    }
  }

  submit() {
    this.TweetString = "";

    this.newsArr.forEach((v: any)=>{
      let date = this.datepipe.transform(v.date, 'MMM-dd-YYYY h:mm', 'GMT+1');
      this.TweetString += "Event Name: " + v.event + ", Date: " + date + ", Country: " + v.country + ", Actual: " + v.actual
      + ", Previous: " + v.previous + ", Change: " + v.change + ", Change%: " + v.changePercentage + ", Estimate: " + v.estimate + ", Impact: " + v.impact + '\n';
    })

    this.NewsStatus.setValue(this.TweetString);
  }

  async postcheckTwitter() {
    this.checklength = this.NewsStatus.value;

    if(this.checklength.length <= 280){
      this.NewsStatus.setValue(this.checklength);
      API.post('TwiterBotCRUD', '/items/twitterpostall', {
        body: {
          twitterStatus: this.NewsStatus.value
        }
      }).then((v) => {
        Swal.fire('Successful', 'Your tweet was posted successfully!', 'success');
        window.location.reload()
      }).catch((error)=>{
        console.log(error)
        Swal.fire('Oops', 'Something went wrong!', 'error');
      })
    }
    else{
      this.TweetString = "";
      Swal.fire('Oops', 'Something went wrong!', 'error');
    }
  }

}
