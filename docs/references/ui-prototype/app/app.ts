import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly mapLoading = signal(true);
  protected readonly mapError = signal(false);
  private map?: maplibregl.Map;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initializeMap(): void {
    try {
      this.map = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {
            'esri-dark': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: '&copy; Esri &copy; OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'esri-dark-layer',
              type: 'raster',
              source: 'esri-dark',
              minzoom: 0,
              maxzoom: 16
            }
          ]
        },
        center: [-43.1729, -22.9068],
        zoom: 10
      });

      this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      this.map.once('load', () => {
        this.mapLoading.set(false);
      });
      this.map.on('error', () => {
        if (this.mapLoading()) {
          this.mapLoading.set(false);
          this.mapError.set(true);
        }
      });
    } catch {
      this.mapLoading.set(false);
      this.mapError.set(true);
    }
  }
}
