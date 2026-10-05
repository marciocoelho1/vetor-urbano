import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type * as maplibregl from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';

type Category = 'TRANSITO' | 'SEGURANCA' | 'CONTINGENCIA';
type ModuleId = 'intelligence' | 'information' | 'territory';
type DemoPoint = {
  id: string;
  name: string;
  description: string;
  location: string;
  kind: 'occurrence' | 'poi';
  category?: Category;
  group?: string;
  crime?: string;
  poiType?: string;
  occurredAt?: string;
  insertedAt: string;
  coordinates: [number, number];
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'TRANSITO', label: 'Trânsito', icon: '↗' },
  { id: 'SEGURANCA', label: 'Segurança', icon: '◇' },
  { id: 'CONTINGENCIA', label: 'Contingência', icon: '⌁' },
];

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly categories = CATEGORIES;
  protected readonly activeView = signal<'map' | 'report'>('map');
  protected readonly expandedModule = signal<ModuleId | null>('intelligence');
  protected readonly selectedCategory = signal<Category | null>(null);
  protected readonly activeFilters = signal<string[]>(['category:TRANSITO']);
  protected readonly period = signal('1m');
  protected readonly heatmap = signal(false);
  protected readonly mapError = signal(false);
  protected readonly mapReady = signal(false);
  protected readonly reportStatus = signal('');
  protected readonly pointConfirmed = signal(false);
  protected readonly coordinates = signal({ longitude: '-43.1729', latitude: '-22.9068' });
  protected readonly reportFields = signal<Record<string, string>>({});
  private readonly platformId = inject(PLATFORM_ID);
  private map?: maplibregl.Map;

  private readonly demoPoints: DemoPoint[] = [
    {
      id: 'demo-001',
      name: 'Sinalização sem funcionamento',
      description: 'Exemplo fictício para demonstração do filtro de trânsito.',
      location: 'Centro, Rio de Janeiro',
      kind: 'occurrence',
      category: 'TRANSITO',
      group: 'OUTROS_REGISTROS',
      occurredAt: this.hoursAgo(3),
      insertedAt: this.hoursAgo(2),
      coordinates: [-43.1812, -22.9035],
    },
    {
      id: 'demo-002',
      name: 'Interdição parcial simulada',
      description: 'Registro de demonstração; não corresponde a uma ocorrência real.',
      location: 'Glória, Rio de Janeiro',
      kind: 'occurrence',
      category: 'TRANSITO',
      group: 'ALERTA',
      occurredAt: this.hoursAgo(16),
      insertedAt: this.hoursAgo(15),
      coordinates: [-43.1748, -22.9194],
    },
    {
      id: 'demo-003',
      name: 'Exercício de classificação',
      description: 'Marcador sintético para validar filtros e acessibilidade.',
      location: 'Catete, Rio de Janeiro',
      kind: 'occurrence',
      category: 'SEGURANCA',
      group: 'CRIMES',
      crime: 'FURTO',
      occurredAt: this.hoursAgo(31),
      insertedAt: this.hoursAgo(28),
      coordinates: [-43.1817, -22.9264],
    },
    {
      id: 'demo-004',
      name: 'Ponto de alagamento de teste',
      description: 'Exemplo sintético de contingência, sem valor de alerta.',
      location: 'Cidade Nova, Rio de Janeiro',
      kind: 'occurrence',
      category: 'CONTINGENCIA',
      group: 'CALAMIDADE_PUBLICA',
      occurredAt: this.hoursAgo(52),
      insertedAt: this.hoursAgo(50),
      coordinates: [-43.2032, -22.9097],
    },
    {
      id: 'poi-001',
      name: 'Unidade de saúde demonstrativa',
      description: 'Ponto de interesse fictício, incluído apenas para demonstração.',
      location: 'Lapa, Rio de Janeiro',
      kind: 'poi',
      poiType: 'HOSPITAL_PUBLICO',
      insertedAt: this.hoursAgo(24),
      coordinates: [-43.1794, -22.9128],
    },
    {
      id: 'poi-002',
      name: 'Equipamento coletivo demonstrativo',
      description: 'Ponto de interesse fictício, não é um serviço real.',
      location: 'Saúde, Rio de Janeiro',
      kind: 'poi',
      poiType: 'ESTADIO',
      insertedAt: this.hoursAgo(24),
      coordinates: [-43.196, -22.895],
    },
  ];

  protected readonly visiblePoints = computed(() => {
    const filters = this.activeFilters();
    const periodStart = Date.now() - this.periodDuration();
    const selectedGroups = filters
      .filter((filter) => filter.startsWith('group:'))
      .map((filter) => filter.slice(6));
    const selectedCategories = filters
      .filter((filter) => filter.startsWith('category:'))
      .map((filter) => filter.slice(9));
    const selectedPois = filters
      .filter((filter) => filter.startsWith('poi:'))
      .map((filter) => filter.slice(4));
    const advancedCrimes = filters
      .filter((filter) => filter.startsWith('crime:'))
      .map((filter) => filter.slice(6));

    return this.demoPoints.filter((point) => {
      if (point.kind === 'occurrence') {
        const categoryMatch = !!point.category && selectedCategories.includes(point.category);
        const groupMatch = !!point.group && selectedGroups.includes(point.group);
        if (!categoryMatch && !groupMatch) return false;
        if (point.occurredAt && Date.parse(point.occurredAt) < periodStart) return false;
        if (
          groupMatch &&
          selectedGroups.includes('CRIMES') &&
          advancedCrimes.length &&
          point.crime &&
          !advancedCrimes.includes(point.crime)
        ) {
          return false;
        }
        return true;
      }
      return selectedPois.includes(point.poiType ?? '') || selectedPois.includes('EXCLUSIVO');
    });
  });

  protected readonly territorySelected = computed(() =>
    this.activeFilters().some((filter) => filter.startsWith('territory:')),
  );

  protected readonly eventCount = computed(
    () => this.visiblePoints().filter((point) => point.kind === 'occurrence').length,
  );

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected openView(view: 'map' | 'report'): void {
    this.activeView.set(view);
    this.reportStatus.set('');
    if (view === 'map') requestAnimationFrame(() => this.map?.resize());
  }

  protected toggleModule(module: ModuleId): void {
    this.expandedModule.update((current) => (current === module ? null : module));
  }

  protected toggleFilter(filter: string): void {
    this.activeFilters.update((filters) =>
      filters.includes(filter) ? filters.filter((item) => item !== filter) : [...filters, filter],
    );
    this.refreshMapData();
  }

  protected isFilterActive(filter: string): boolean {
    return this.activeFilters().includes(filter);
  }

  protected selectPeriod(period: string): void {
    this.period.set(period);
    this.refreshMapData();
  }

  protected toggleHeatmap(): void {
    this.heatmap.update((active) => !active);
    this.updateMapLayers();
  }

  protected chooseCategory(category: Category): void {
    this.selectedCategory.set(category);
    this.reportFields.set({});
    this.reportStatus.set('');
    this.pointConfirmed.set(false);
  }

  protected setField(name: string, value: string): void {
    this.reportFields.update((fields) => ({ ...fields, [name]: value }));
  }

  protected setCoordinate(axis: 'longitude' | 'latitude', value: string): void {
    this.coordinates.update((point) => ({ ...point, [axis]: value }));
    this.pointConfirmed.set(false);
  }

  protected confirmPoint(): void {
    const { longitude, latitude } = this.coordinates();
    const lon = Number(longitude);
    const lat = Number(latitude);
    if (
      longitude.trim() === '' ||
      latitude.trim() === '' ||
      !Number.isFinite(lon) ||
      !Number.isFinite(lat) ||
      lon < -180 ||
      lon > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      this.pointConfirmed.set(false);
      this.reportStatus.set('Informe longitude entre −180 e 180 e latitude entre −90 e 90.');
      return;
    }
    this.pointConfirmed.set(true);
    this.reportStatus.set('Ponto conferido. O envio ainda depende da API de cadastro.');
  }

  protected submitReport(event: Event): void {
    event.preventDefault();
    if (!this.selectedCategory()) {
      this.reportStatus.set('Escolha uma categoria para continuar.');
      return;
    }
    if (!this.pointConfirmed()) {
      this.reportStatus.set('Confirme as coordenadas antes de continuar.');
      return;
    }
    this.reportStatus.set('Cadastro indisponível nesta demonstração. Nenhum dado foi enviado.');
  }

  protected formatTime(iso: string): string {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(iso),
    );
  }

  private async initializeMap(): Promise<void> {
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      this.mapError.set(true);
      return;
    }
    try {
      const maplibregl = await import('maplibre-gl');
      maplibregl.setWorkerUrl(
        new URL('assets/maplibre/maplibre-gl-worker.mjs', document.baseURI).href,
      );
      this.map = new maplibregl.Map({
        container: 'map-canvas',
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            },
          },
          layers: [
            { id: 'osm-base', type: 'raster', source: 'osm', paint: { 'raster-opacity': 0.82 } },
          ],
        },
        center: [-43.19, -22.91],
        zoom: 12.2,
        minZoom: 9,
        maxZoom: 17,
        attributionControl: { compact: false },
      });
      this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      this.map.on('load', () => {
        this.mapReady.set(true);
        this.map?.addSource('demo-points', { type: 'geojson', data: this.toGeoJson() });
        this.map?.addLayer({
          id: 'demo-points-glow',
          type: 'circle',
          source: 'demo-points',
          paint: {
            'circle-radius': 13,
            'circle-color': '#10b981',
            'circle-opacity': 0.18,
            'circle-blur': 0.25,
          },
        });
        this.map?.addLayer({
          id: 'demo-points-dot',
          type: 'circle',
          source: 'demo-points',
          paint: {
            'circle-radius': 5,
            'circle-color': [
              'match',
              ['get', 'category'],
              'TRANSITO',
              '#38bdf8',
              'SEGURANCA',
              '#fb7185',
              'CONTINGENCIA',
              '#fbbf24',
              '#a3e635',
            ],
            'circle-stroke-color': '#f4f4f5',
            'circle-stroke-width': 1.5,
          },
        });
        this.map?.on('click', 'demo-points-dot', (event) => {
          const properties = event.features?.[0]?.properties as Record<string, string> | undefined;
          if (!properties || !this.map) return;
          const content = document.createElement('div');
          content.className = 'map-popup';
          const title = document.createElement('strong');
          title.textContent = properties['name'] ?? 'Registro demonstrativo';
          const description = document.createElement('p');
          description.textContent = properties['description'] ?? '';
          const location = document.createElement('span');
          location.textContent = properties['location'] ?? '';
          const inserted = document.createElement('small');
          inserted.textContent = `Inserido às ${this.formatTime(properties['insertedAt'] ?? new Date().toISOString())}`;
          content.append(title, description, location, inserted);
          new maplibregl.Popup({ closeButton: true, offset: 12 })
            .setLngLat(event.lngLat)
            .setDOMContent(content)
            .addTo(this.map);
        });
        this.map?.on('mouseenter', 'demo-points-dot', () => {
          if (this.map) this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map?.on('mouseleave', 'demo-points-dot', () => {
          if (this.map) this.map.getCanvas().style.cursor = '';
        });
        this.updateMapLayers();
      });
    } catch {
      this.mapError.set(true);
    }
  }

  private refreshMapData(): void {
    const source = this.map?.getSource('demo-points') as maplibregl.GeoJSONSource | undefined;
    source?.setData(this.toGeoJson());
  }

  private updateMapLayers(): void {
    const source = this.map?.getSource('demo-points') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(this.toGeoJson());
    if (this.heatmap() && this.map?.getLayer('demo-points-dot')) {
      this.map.setLayoutProperty('demo-points-dot', 'visibility', 'none');
      this.map.setLayoutProperty('demo-points-glow', 'visibility', 'none');
      if (!this.map.getLayer('demo-heatmap')) {
        this.map.addLayer({
          id: 'demo-heatmap',
          type: 'heatmap',
          source: 'demo-points',
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': 0.8,
            'heatmap-radius': 36,
            'heatmap-opacity': 0.78,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(16,185,129,0)',
              0.25,
              '#34d399',
              0.55,
              '#facc15',
              1,
              '#f87171',
            ],
          },
        });
      } else this.map.setLayoutProperty('demo-heatmap', 'visibility', 'visible');
    } else if (this.map?.getLayer('demo-points-dot')) {
      this.map.setLayoutProperty('demo-points-dot', 'visibility', 'visible');
      this.map.setLayoutProperty('demo-points-glow', 'visibility', 'visible');
      if (this.map.getLayer('demo-heatmap'))
        this.map.setLayoutProperty('demo-heatmap', 'visibility', 'none');
    }
  }

  private toGeoJson(): FeatureCollection<Point> {
    return {
      type: 'FeatureCollection',
      features: this.visiblePoints().map((point) => ({
        type: 'Feature',
        id: point.id,
        geometry: { type: 'Point', coordinates: point.coordinates },
        properties: {
          kind: point.kind,
          name: point.name,
          description: point.description,
          location: point.location,
          insertedAt: point.insertedAt,
          category: point.category ?? 'POI',
        },
      })),
    };
  }

  private periodDuration(): number {
    const durations: Record<string, number> = {
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 31 * 24 * 60 * 60 * 1000,
      '3m': 93 * 24 * 60 * 60 * 1000,
      '6m': 186 * 24 * 60 * 60 * 1000,
      '1y': 366 * 24 * 60 * 60 * 1000,
    };
    return durations[this.period()] ?? durations['1m'];
  }

  private hoursAgo(hours: number): string {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  }
}
