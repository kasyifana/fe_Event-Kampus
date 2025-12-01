import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notifikasi } from './notifikasi';

describe('Notifikasi', () => {
  let component: Notifikasi;
  let fixture: ComponentFixture<Notifikasi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifikasi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Notifikasi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
