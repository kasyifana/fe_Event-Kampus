import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KelolaEvent } from './kelola-event';

describe('KelolaEvent', () => {
  let component: KelolaEvent;
  let fixture: ComponentFixture<KelolaEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KelolaEvent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KelolaEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
