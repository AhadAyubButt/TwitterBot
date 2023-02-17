import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapperComponent } from './scrapper.component';

describe('ScrapperComponent', () => {
  let component: ScrapperComponent;
  let fixture: ComponentFixture<ScrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
