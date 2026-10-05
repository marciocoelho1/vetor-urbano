import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

const maplibreWorkerMock = vi.hoisted(() => {
  const calls: string[] = [];
  const map = {
    addControl: () => undefined,
    on: () => undefined,
    remove: () => undefined,
  };
  return {
    calls,
    map,
    Map: vi.fn(function MockMap() {
      calls.push('map');
      return map;
    }),
    NavigationControl: vi.fn(),
    setWorkerUrl: vi.fn((url: string) => calls.push(`worker:${url}`)),
  };
});

vi.mock('maplibre-gl', () => maplibreWorkerMock);

describe('Vetor Urbano', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('keeps the report form hidden until one category is chosen', () => {
    fixture.nativeElement.querySelector('button.nav-link:nth-child(2)').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="report-details"]')).toBeNull();

    fixture.nativeElement.querySelector('[data-category="SEGURANCA"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="report-details"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="security-fields"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="traffic-fields"]')).toBeNull();
  });

  it('allows only one module to expand without clearing another module’s active filters', () => {
    const intelligence = fixture.nativeElement.querySelector('[data-module="intelligence"]');
    const information = fixture.nativeElement.querySelector('[data-module="information"]');

    if (intelligence.getAttribute('aria-expanded') !== 'true') {
      intelligence.click();
      fixture.detectChanges();
    }
    fixture.nativeElement.querySelector('[data-filter="period-1m"]').click();
    fixture.detectChanges();
    information.click();
    fixture.detectChanges();

    expect(intelligence.getAttribute('aria-expanded')).toBe('false');
    expect(information.getAttribute('aria-expanded')).toBe('true');
    intelligence.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-filter="period-1m"]').checked).toBe(true);
  });

  it('labels the demo and keeps territorial polygons unavailable until a verified source exists', () => {
    expect(fixture.nativeElement.textContent).toContain('Dados fictícios');
    fixture.nativeElement.querySelector('[data-module="territory"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Fonte territorial em validação');
  });

  it('stacks an information layer with the active occurrence layer without mixing their counts', () => {
    fixture.nativeElement.querySelector('[data-module="information"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('input[data-filter="poi:HOSPITAL_PUBLICO"]')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.result-total strong').textContent).toBe('2');
    expect(fixture.nativeElement.textContent).toContain('3 itens');
    expect(fixture.nativeElement.textContent).toContain('Unidade de saúde demonstrativa');
  });

  it('rejects empty coordinates and makes clear that the demonstration never sends a report', () => {
    fixture.nativeElement.querySelector('button.nav-link:nth-child(2)').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-category="TRANSITO"]').click();
    fixture.detectChanges();

    const app = fixture.componentInstance as unknown as {
      setCoordinate: (axis: 'longitude' | 'latitude', value: string) => void;
      confirmPoint: () => void;
    };
    app.setCoordinate('longitude', '');
    app.setCoordinate('latitude', '');
    app.confirmPoint();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Informe longitude entre');
    expect(fixture.nativeElement.querySelector('.submit-note').textContent).toContain(
      'Nenhum dado será enviado',
    );
    expect(fixture.nativeElement.querySelector('.submit-button').textContent).toContain(
      'Verificar cadastro',
    );
  });

  it('sets the self-hosted MapLibre worker URL before creating the map', async () => {
    const previousDescriptor = Object.getOwnPropertyDescriptor(window, 'WebGLRenderingContext');
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: class WebGLRenderingContext {},
    });
    maplibreWorkerMock.calls.length = 0;
    maplibreWorkerMock.setWorkerUrl.mockClear();
    maplibreWorkerMock.Map.mockClear();

    try {
      const app = fixture.componentInstance as unknown as {
        initializeMap: () => Promise<void>;
      };
      await app.initializeMap();

      const expectedUrl = new URL('assets/maplibre/maplibre-gl-worker.mjs', document.baseURI).href;
      expect(maplibreWorkerMock.setWorkerUrl).toHaveBeenCalledWith(expectedUrl);
      expect(maplibreWorkerMock.calls).toEqual([`worker:${expectedUrl}`, 'map']);
    } finally {
      if (previousDescriptor) {
        Object.defineProperty(window, 'WebGLRenderingContext', previousDescriptor);
      } else {
        Reflect.deleteProperty(window, 'WebGLRenderingContext');
      }
    }
  });
});
