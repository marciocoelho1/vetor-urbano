import { AfterViewInit, Component, signal } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  protected readonly title = signal('vetor-urbano-web');

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    const map = new maplibregl.Map({
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
      center: [-43.1729, -22.9068], // Rio de Janeiro
      zoom: 11
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
  }
}