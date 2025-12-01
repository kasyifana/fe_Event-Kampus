import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Peserta } from './peserta';

describe('Peserta', () => {
  let component: Peserta;
  let fixture: ComponentFixture<Peserta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Peserta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Peserta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
