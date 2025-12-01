import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KelolaOrganisasi } from './kelola-organisasi';

describe('KelolaOrganisasi', () => {
  let component: KelolaOrganisasi;
  let fixture: ComponentFixture<KelolaOrganisasi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KelolaOrganisasi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KelolaOrganisasi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
