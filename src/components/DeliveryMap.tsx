import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Delivery Center: Downtown Lisbon
const DELIVERY_CENTER = { lat: 38.711, lng: -9.139 };
const DELIVERY_RADIUS_METERS = 5000; // 5km radius

interface Place {
  id: string;
  location: google.maps.LatLngLiteral;
  formattedAddress: string;
}

const SearchInput = ({ onPlaceSelect }: { onPlaceSelect: (place: Place | null) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const placesLib = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    if (!placesLib) return;
    setAutocompleteService(new placesLib.AutocompleteService());
  }, [placesLib]);

  useEffect(() => {
    if (!map || !placesLib) return;
    setPlacesService(new placesLib.PlacesService(map));
  }, [map, placesLib]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value || !autocompleteService) {
      setPredictions([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      {
        input: value,
        locationBias: new google.maps.Circle({ center: DELIVERY_CENTER, radius: DELIVERY_RADIUS_METERS }).getBounds(),
        componentRestrictions: { country: 'pt' }
      },
      (preds) => {
        setPredictions(preds || []);
        setShowPredictions(true);
      }
    );
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService) return;

    setInputValue(prediction.description);
    setShowPredictions(false);

    placesService.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'formatted_address'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          onPlaceSelect({
            id: prediction.place_id,
            location,
            formattedAddress: place.formatted_address || ''
          });
          
          if (map) {
            map.panTo(location);
            map.setZoom(15);
          }
        }
      }
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto z-10">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Digite a sua morada em Lisboa..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <AnimatePresence>
        {showPredictions && predictions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden"
          >
            {predictions.map((p) => (
              <li
                key={p.place_id}
                onClick={() => handleSelectPrediction(p)}
                className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
              >
                {p.description}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const MapCircle = ({ center, radius }: { center: google.maps.LatLngLiteral; radius: number }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    circleRef.current = new google.maps.Circle({
      map,
      center,
      radius,
      fillColor: '#f97316',
      fillOpacity: 0.15,
      strokeColor: '#f97316',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      clickable: false
    });

    return () => {
      if (circleRef.current) circleRef.current.setMap(null);
    };
  }, [map, center, radius]);

  return null;
};

const DeliveryMap: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isInside, setIsInside] = useState<boolean | null>(null);

  useEffect(() => {
    if (!selectedPlace) {
      setIsInside(null);
      return;
    }

    // Basic calculation: distance between two lat/lng points
    const checkDistance = () => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = (DELIVERY_CENTER.lat * Math.PI) / 180;
      const φ2 = (selectedPlace.location.lat * Math.PI) / 180;
      const Δφ = ((selectedPlace.location.lat - DELIVERY_CENTER.lat) * Math.PI) / 180;
      const Δλ = ((selectedPlace.location.lng - DELIVERY_CENTER.lng) * Math.PI) / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      setIsInside(distance <= DELIVERY_RADIUS_METERS);
    };

    checkDistance();
  }, [selectedPlace]);

  if (!hasValidKey) {
    return (
      <section className="py-20 bg-gray-50 flex items-center justify-center min-h-[400px]">
        <div className="text-center px-6 max-w-lg">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Maps API Key Required</h2>
          <p className="text-gray-600 mb-8">
            Para visualizar o mapa de entregas, por favor adicione a sua chave de API nas configurações do projeto.
          </p>
          <div className="bg-white p-6 rounded-xl shadow-sm text-left border border-gray-200">
            <p className="font-medium text-gray-900 mb-2">Instruções:</p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
              <li>Open <strong>Settings</strong> (⚙️)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            </ol>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="delivery-zones" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif font-medium text-gray-900 mb-4"
          >
            {t.areas.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            delay={0.1}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Verifique se entregamos no seu alojamento. Operamos num raio de 5km a partir do centro de Lisboa.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600" />
                Verificar Morada
              </h3>
              
              <SearchInput onPlaceSelect={setSelectedPlace} />

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  {isInside === true && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-green-50 border border-green-100 rounded-2xl p-6 text-green-800 flex items-start gap-4"
                    >
                      <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600" />
                      <div>
                        <p className="font-semibold mb-1 italic uppercase tracking-wider text-xs">Sucesso!</p>
                        <p className="text-sm">Óptimas notícias! Entregamos nesta morada.</p>
                      </div>
                    </motion.div>
                  )}
                  {isInside === false && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-800 flex items-start gap-4"
                    >
                      <XCircle className="w-6 h-6 shrink-0 text-red-600" />
                      <div>
                        <p className="font-semibold mb-1 italic uppercase tracking-wider text-xs">Fora de Alcance</p>
                        <p className="text-sm">Infelizmente esta morada está fora da nossa zona de entrega atual.</p>
                      </div>
                    </motion.div>
                  )}
                  {isInside === null && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-400 text-sm">
                        Pesquise a sua morada acima para verificar a disponibilidade.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm">{t.areas.hours}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm">{t.areas.fee}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={DELIVERY_CENTER}
                  defaultZoom={12}
                  mapId="DELIVERY_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                  disableDefaultUI={true}
                  zoomControl={true}
                >
                  <MapCircle center={DELIVERY_CENTER} radius={DELIVERY_RADIUS_METERS} />
                  
                  {selectedPlace && (
                    <AdvancedMarker position={selectedPlace.location}>
                      <div className="bg-white p-2 rounded-full shadow-lg border-2 border-orange-500">
                        <MapPin className="w-6 h-6 text-orange-600 fill-orange-100" />
                      </div>
                    </AdvancedMarker>
                  )}
                  
                  <AdvancedMarker position={DELIVERY_CENTER} title="Breakfast in Bed Headquarters">
                    <div className="bg-orange-600 p-3 rounded-2xl shadow-lg border-4 border-white text-white">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryMap;
