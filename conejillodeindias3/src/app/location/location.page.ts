import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationCoordinatesWithJSON extends GeolocationCoordinates {
  toJSON(): any;
}

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  map!: mapboxgl.Map;
  geocoder!: MapboxGeocoder;
  fromGeocoder!: MapboxGeocoder;
  toGeocoder!: MapboxGeocoder;

  async ngOnInit() {
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoidmEtbGF0b3JyZSIsImEiOiJjbTN4OHM2dWMxZzZ6Mmpvcm9mMXdwb3JzIn0.NM_QPXtsWhgSvRZ_NnKRxQ';

    this.map = new mapboxgl.Map({
      container: 'map', 
      style: 'mapbox://styles/mapbox/streets-v11', 
      center: [-74.006, 40.7128], 
      zoom: 12, 
    });

    this.geocoder = new MapboxGeocoder({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Search for a place', 
      zoom: 14, 
      flyTo: true, 
    });

    this.geocoder.on('result', (event: any) => {
      console.log('Search result:', event.result);
      const [lng, lat] = event.result.center;
      this.map.flyTo({ center: [lng, lat], zoom: 14 });
    });

    this.fromGeocoder = new MapboxGeocoder({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'From (e.g., 1600 Pennsylvania Ave, Washington, DC)', 
      zoom: 14,
      flyTo: false, 
    });

    this.toGeocoder = new MapboxGeocoder({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'To (e.g., Times Square, New York, NY)', 
      zoom: 14,
      flyTo: false, 
    });

    this.fromGeocoder.on('result', (event: any) => {
      console.log('From address result:', event.result);
      const [lng, lat] = event.result.center;
      this.map.setCenter([lng, lat]);
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);
    });

    this.toGeocoder.on('result', (event: any) => {
      console.log('To address result:', event.result);
      const [lng, lat] = event.result.center;
      this.map.setCenter([lng, lat]);
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(this.map);
    });

    const coordinates = await this.requestLocationPermission();
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      this.map.setCenter([longitude, latitude]);
      new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(this.map);
    }
  }

  async requestLocationPermission(): Promise<GeolocationCoordinatesWithJSON | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await Geolocation.requestPermissions();
        
        if (permission.location === 'granted') {
          const position = await Geolocation.getCurrentPosition();
          const coords: GeolocationCoordinatesWithJSON = position.coords as GeolocationCoordinatesWithJSON;
          return coords;
        } else {
          alert('Necesitamos acceso a tu ubicación para continuar');
          return null;
        }
      } catch (error) {
        console.error('Error al solicitar permisos de ubicación:', error);
        return null;
      }
    } else {
      console.warn('La plataforma no es nativa, no se puede solicitar permisos');
      return null;
    }
  }

  ionViewDidEnter() {
    const existingGeocoder = document.getElementById('geocoder')?.firstChild;
    if (existingGeocoder) {
      document.getElementById('geocoder')!.removeChild(existingGeocoder);
    }
    document.getElementById('from-geocoder')!.appendChild(this.fromGeocoder.onAdd(this.map));
    document.getElementById('to-geocoder')!.appendChild(this.toGeocoder.onAdd(this.map));
  }
  handleDirections() {
    const fromElement = document.getElementById('from') as HTMLInputElement;
    const toElement = document.getElementById('to') as HTMLInputElement;

    if (fromElement && toElement) {
      const from = fromElement.value;
      const to = toElement.value;

      if (from && to) {
        this.getDirections(from, to);
      } else {
        alert('Please enter both "From" and "To" addresses!');
      }
    } else {
      alert('One or both input fields are missing!');
    }
  }

  async getDirections(from: string, to: string) {
    const accessToken = (mapboxgl as any).accessToken;

    try {
      const fromCoords = await this.geocodeAddress(from, accessToken);
      const toCoords = await this.geocodeAddress(to, accessToken);

      if (!fromCoords || !toCoords) {
        alert('Unable to geocode one or both addresses. Please check and try again.');
        return;
      }

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords.join(
        ','
      )};${toCoords.join(',')}?geometries=geojson&access_token=${accessToken}`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates;

        if (this.map.getLayer('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route,
            },
          },
        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0074d9',
            'line-width': 5,
          },
        });

        const bounds = route.reduce(
          (bounds: any, coord: any) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(route[0], route[0])
        );
        this.map.fitBounds(bounds, { padding: 50 });
      } else {
        console.log('No route found!');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }

  async geocodeAddress(address: string, accessToken: string): Promise<[number, number] | null> {
    try {
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${accessToken}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      } else {
        console.error('No results found for the address:', address);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
} 