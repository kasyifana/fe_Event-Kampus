import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSaya } from './event-saya';

describe('EventSaya', () => {
  let component: EventSaya;
  let fixture: ComponentFixture<EventSaya>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSaya]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSaya);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
