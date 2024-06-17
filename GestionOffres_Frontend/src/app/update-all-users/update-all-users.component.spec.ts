import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAllUsersComponent } from './update-all-users.component';

describe('UpdateAllUsersComponent', () => {
  let component: UpdateAllUsersComponent;
  let fixture: ComponentFixture<UpdateAllUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAllUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateAllUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
