import { City, Attraction, Accommodation, Restaurant } from '../types';

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)', rate: 1, symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', rate: 0.92, symbol: '€' },
  { code: 'GBP', name: 'British Pound (£)', rate: 0.79, symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen (¥)', rate: 150, symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee (₹)', rate: 83.5, symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar (A$)', rate: 1.52, symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', rate: 1.36, symbol: 'C$' },
  { code: 'CNY', name: 'Chinese Yuan (¥)', rate: 7.23, symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc (Fr)', rate: 0.91, symbol: 'Fr' },
  { code: 'AED', name: 'UAE Dirham (dh)', rate: 3.67, symbol: 'dh' },
];

export const formatCurrency = (value: number, currencyCode: string) => {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const converted = value * currency.rate;
  return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
};

export const LANGUAGES = [
  'English', 'Kannada', 'Hindi', 'Spanish', 'French', 
  'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 
  'Japanese', 'Arabic', 'Korean', 'Turkish', 'Dutch'
];

export const TRANSLATIONS: any = {
  'English': {
    'nav_home': 'Home',
    'nav_explore': 'Explore',
    'nav_wishlist': 'Wishlist',
    'nav_emergency': 'Emergency',
    'nav_profile': 'My Account',
    'nav_login': 'Log In',
    'nav_my_plans': 'My_Plans',
    'nav_add': 'Add',
    'hero_title': 'Your Stress-Free Travel Planner',
    'hero_subtitle': 'Discover destinations, build itineraries, and travel smarter with our AI companion.',
    'search_placeholder': 'Where do you want to go?',
    'search_btn': 'Search',
    'featured': 'Featured Destinations',
    'results': 'results',
    'saved': 'Saved',
    'add_wishlist': 'Add to Wishlist',
    'plan_trip': 'Plan My Trip',
    'visitor_info': 'Visitor Info',
    'website': 'Website',
    'map': 'Map',
    'photos': 'Photos',
    'ai_insight_title': 'Go Pro AI Insight',
    'ai_summary': 'Get AI Summary',
    'generating': 'Generating...',
    'generated_by': 'Powered by GoTrip AI',
    'wishlist_title': 'Your Wishlist',
    'wishlist_empty': 'Your wishlist is empty. Start exploring!',
    'profile_edit': 'Edit Profile',
    'label_age': 'Age',
    'label_gender': 'Gender',
    'label_currency': 'Currency',
    'label_language': 'Language',
    'label_country': 'Country',
    'theme_dark': 'Dark Mode',
    'theme_light': 'Light Mode',
    'remove': 'Remove',
    'notifications': 'Notifications',
    'no_notifications': 'No notifications',
    'mark_read': 'Mark all as read',
    'my_plans_title': 'My Saved Plans',
    'no_plans': 'No plans yet',
    'no_plans_sub': 'Use the AI Smart Planner to create your first trip!',
    'view_details': 'View Details',
    'est_cost': 'Est. Cost',
    'settings': 'Settings',
    'privacy': 'Privacy & Security',
    'help': 'Help & Support',
    'logout': 'Log Out',
    'personal_info': 'Personal Info',
    'about_place': 'About this place',
    'amenities': 'Amenities',
    'ready_book': 'Ready to book?',
    'reserve': 'Reserve Table',
    'view_rooms': 'View Rooms & Book',
    'check_in': 'Check-in',
    'check_out': 'Check-out',
    'opening': 'Opening',
    'closing': 'Closing',
    'per_night': 'per night',
    'per_person': 'approx. per person',
    'nearby_acc': 'Nearby Accommodations',
    'top_rest': 'Top Restaurants',
    'view_less': 'View Less',
    'view_all': 'View All',
    'top_attractions': 'Top Attractions in',
    'local_exp': 'Local Experiences',
    'good_know': 'Good to Know',
    'share': 'Share Location',
    'copied': 'Copied!',
    'thinking': 'Thinking...',
    'chat_sources': 'Sources',
    'chat_related': 'Related',
    'plan_overview': 'Overview',
    'plan_itinerary': 'Itinerary',
    'plan_hotel': 'Accommodation',
    'plan_visa': 'Visa Requirements',
    'plan_cta': 'Generate My Plan'
  },
  'Kannada': {
    'nav_home': 'ಮನೆ',
    'nav_explore': 'ಅನ್ವೇಷಿಸಿ',
    'nav_wishlist': 'ಇಚ್ಛೆಯ ಪಟ್ಟಿ',
    'nav_emergency': 'ತುರ್ತು',
    'nav_profile': 'ನನ್ನ ಖಾತೆ',
    'nav_login': 'ಲಾಗಿನ್',
    'nav_my_plans': 'ನನ್ನ ಯೋಜನೆಗಳು',
    'nav_add': 'ಸೇರಿಸಿ',
    'hero_title': 'ನಿಮ್ಮ ಒತ್ತಡ ರಹಿತ ಪ್ರಯಾಣ ಯೋಜಕ',
    'hero_subtitle': 'ಗಮ್ಯಸ್ಥಾನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ಪ್ರವಾಸಗಳನ್ನು ಯೋಜಿಸಿ ಮತ್ತು ನಮ್ಮ AI ಜೊತೆ ಚುರುಕಾಗಿ ಪ್ರಯಾಣಿಸಿ.',
    'search_placeholder': 'ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಲು ಬಯಸುತ್ತೀರಿ?',
    'search_btn': 'ಹುಡುಕಿ',
    'featured': 'ಪ್ರಮುಖ ತಾಣಗಳು',
    'results': 'ಫಲಿತಾಂಶಗಳು',
    'saved': 'ಉಳಿಸಲಾಗಿದೆ',
    'add_wishlist': 'ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ',
    'plan_trip': 'ಪ್ರವಾಸ ಯೋಜಿಸಿ',
    'visitor_info': 'ಪ್ರವಾಸಿ ಮಾಹಿತಿ',
    'website': 'ಜಾಲತಾಣ',
    'map': 'ನಕ್ಷೆ',
    'photos': 'ಭಾವಚಿತ್ರಗಳು',
    'ai_insight_title': 'Go Pro AI ಒಳನೋಟ',
    'ai_summary': 'AI ಸಾರಾಂಶ ಪಡೆಯಿರಿ',
    'generating': 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    'generated_by': 'Go Pro AI ನಿಂದ ರಚಿಸಲಾಗಿದೆ',
    'wishlist_title': 'ನಿಮ್ಮ ಇಚ್ಛೆಯ ಪಟ್ಟಿ',
    'wishlist_empty': 'ನಿಮ್ಮ ಪಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ. ಅನ್ವೇಷಿಸಲು ಪ್ರಾರಂಭಿಸಿ!',
    'profile_edit': 'ಪ್ರೊಫೈಲ್ ಎಡಿಟ್ ಮಾಡಿ',
    'label_age': 'ವಯಸ್ಸು',
    'label_gender': 'ಲಿಂಗ',
    'label_currency': 'ಕರೆನ್ಸಿ',
    'label_language': 'ಭಾಷೆ',
    'label_country': 'ದೇಶ',
    'theme_dark': 'ಡಾರ್ಕ್ ಮೋಡ್',
    'theme_light': 'ಲೈಟ್ ಮೋಡ್',
    'remove': 'ತೆಗೆದುಹಾಕಿ',
    'my_plans_title': 'ನನ್ನ ಉಳಿಸಿದ ಯೋಜನೆಗಳು',
    'settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'logout': 'ಲಾಗ್ ಔಟ್',
    'personal_info': 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',
    'thinking': 'ಯೋಚಿಸುತ್ತಿದೆ...',
    'chat_sources': 'ಮೂಲಗಳು',
    'chat_related': 'ಸಂಬಂಧಿತ',
    'plan_overview': 'ಅವಲೋಕನ',
    'plan_itinerary': 'ಪ್ರಯಾಣದ ವಿವರ',
    'plan_hotel': 'ವಸತಿ',
    'plan_visa': 'ವೀಸಾ ಅಗತ್ಯತೆಗಳು',
    'plan_cta': 'ನನ್ನ ಯೋಜನೆಯನ್ನು ರೂಪಿಸಿ'
  },
  'Hindi': {
    'nav_home': 'घर',
    'nav_explore': 'खोजें',
    'nav_wishlist': 'इच्छा सूची',
    'nav_emergency': 'आपातकालीन',
    'nav_profile': 'मेरा खाता',
    'nav_login': 'लॉग इन',
    'nav_my_plans': 'मेरी योजनाएं',
    'nav_add': 'जोड़ें',
    'hero_title': 'आपका तनाव-मुक्त यात्रा योजनाकार',
    'hero_subtitle': 'गंतव्यों की खोज करें, यात्रा कार्यक्रम बनाएं और एआई के साथ यात्रा करें।',
    'search_placeholder': 'आप कहाँ जाना चाहते हैं?',
    'search_btn': 'खोजें',
    'featured': 'प्रमुख गंतव्य',
    'results': 'परिणाम',
    'saved': 'सहेजा गया',
    'add_wishlist': 'इच्छा सूची में जोड़ें',
    'plan_trip': 'यात्रा की योजना',
    'visitor_info': 'यात्री जानकारी',
    'website': 'वेबसाइट',
    'map': 'नक्शा',
    'photos': 'तस्वीरें',
    'ai_insight_title': 'Go Pro AI इनसाइट',
    'ai_summary': 'एआई सारांश',
    'generating': 'उत्पादन हो रहा है...',
    'generated_by': 'Go Pro AI द्वारा',
    'wishlist_title': 'आपकी इच्छा सूची',
    'wishlist_empty': 'आपकी सूची खाली है। अन्वेषण करें!',
    'profile_edit': 'प्रोफ़ाइल संपादित करें',
    'label_age': 'आयु',
    'label_gender': 'लिंग',
    'label_currency': 'मुद्रा',
    'label_language': 'भाषा',
    'label_country': 'देश',
    'theme_dark': 'डार्क मोड',
    'theme_light': 'लाइट मोड',
    'remove': 'हटाएं',
    'settings': 'सेटिंग्स',
    'logout': 'लॉग आउट',
    'thinking': 'सोच रहा है...',
    'chat_sources': 'स्रोत',
    'chat_related': 'संबंधित'
  }
};

export const getTranslation = (lang: string, key: string) => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['English'];
  return dict[key] || TRANSLATIONS['English'][key] || key;
};

export const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string; countryName: string }> = {
  'India': { police: '112', ambulance: '108', fire: '101', countryName: 'India' },
  'USA': { police: '911', ambulance: '911', fire: '911', countryName: 'United States' },
  'UK': { police: '999', ambulance: '999', fire: '999', countryName: 'United Kingdom' },
  'France': { police: '112', ambulance: '15', fire: '18', countryName: 'France' },
  'Germany': { police: '110', ambulance: '112', fire: '112', countryName: 'Germany' },
  'Italy': { police: '112', ambulance: '118', fire: '115', countryName: 'Italy' },
  'Spain': { police: '112', ambulance: '112', fire: '080', countryName: 'Spain' },
  'Japan': { police: '110', ambulance: '119', fire: '119', countryName: 'Japan' },
  'Australia': { police: '000', ambulance: '000', fire: '000', countryName: 'Australia' },
  'China': { police: '110', ambulance: '120', fire: '119', countryName: 'China' },
  'UAE': { police: '999', ambulance: '998', fire: '997', countryName: 'UAE' },
  'Turkey': { police: '155', ambulance: '112', fire: '110', countryName: 'Turkey' },
  'Canada': { police: '911', ambulance: '911', fire: '911', countryName: 'Canada' },
  'Default': { police: '112', ambulance: '112', fire: '112', countryName: 'Local' }
};

export const getEmergencyNumbers = (country: string) => {
  if (!country) return EMERGENCY_NUMBERS['Default'];
  const normalizedCountry = country.trim();
  const key = Object.keys(EMERGENCY_NUMBERS).find(k => 
    normalizedCountry.toLowerCase() === k.toLowerCase() || 
    normalizedCountry.toLowerCase().includes(k.toLowerCase())
  );
  return EMERGENCY_NUMBERS[key || 'Default'];
};

export const MOCK_DB: {
  cities: City[];
  attractions: Attraction[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
} = {
  cities: [
    { id: 'paris', name: 'Paris', country: 'France', baseFlight: 800, avgHotel: 200, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', experiences: ['Seine River Cruise', 'Macaron Baking Class'], bestTime: 'Apr-Jun, Oct-Nov' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', baseFlight: 1200, avgHotel: 180, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', experiences: ['Tea Ceremony', 'Sumo Practice'], bestTime: 'Mar-May, Oct-Nov' },
    { id: 'nyc', name: 'New York', country: 'USA', baseFlight: 500, avgHotel: 300, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', experiences: ['Broadway Show', 'Central Park Bike Ride'], bestTime: 'Apr-Jun, Sep-Nov' },
    { id: 'rome', name: 'Rome', country: 'Italy', baseFlight: 850, avgHotel: 150, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', experiences: ['Vatican Tour', 'Pizza Making Class'], bestTime: 'Apr-Jun, Sep-Oct' },
    { id: 'london', name: 'London', country: 'UK', baseFlight: 700, avgHotel: 250, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', experiences: ['West End Show', 'Afternoon Tea'], bestTime: 'Mar-May' },
    { id: 'dubai', name: 'Dubai', country: 'UAE', baseFlight: 900, avgHotel: 300, image: 'https://images.unsplash.com/photo-1512453979798-5ea936a7d40b?auto=format&fit=crop&w=800&q=80', experiences: ['Desert Safari', 'Dhow Cruise'], bestTime: 'Nov-Mar' },
    { id: 'sydney', name: 'Sydney', country: 'Australia', baseFlight: 1500, avgHotel: 220, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', experiences: ['Harbour Bridge Climb', 'Surf Lesson'], bestTime: 'Sep-Nov, Mar-May' },
    { id: 'agra', name: 'Agra', country: 'India', baseFlight: 1000, avgHotel: 80, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', experiences: ['Taj Mahal Sunrise', 'Mughal Heritage Walk'], bestTime: 'Oct-Mar' },
    { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', baseFlight: 1100, avgHotel: 150, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', experiences: ['Samba Show', 'Favela Tour'], bestTime: 'Dec-Mar' },
    { id: 'cairo', name: 'Cairo', country: 'Egypt', baseFlight: 800, avgHotel: 100, image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80', experiences: ['Nile Cruise', 'Pyramids Sound & Light'], bestTime: 'Oct-Apr' },
    { id: 'barcelona', name: 'Barcelona', country: 'Spain', baseFlight: 750, avgHotel: 180, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80', experiences: ['Tapas Tour', 'Flamenco Show'], bestTime: 'May-Jun, Sep-Oct' },
    { id: 'santorini', name: 'Santorini', country: 'Greece', baseFlight: 900, avgHotel: 350, image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=800&q=80', experiences: ['Catamaran Cruise', 'Wine Tasting'], bestTime: 'Apr-Oct' },
    { id: 'machupicchu', name: 'Cusco', country: 'Peru', baseFlight: 1300, avgHotel: 120, image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80', experiences: ['Inca Trail Trek', 'Chocolate Making Class'], bestTime: 'May-Sep' },
    { id: 'beijing', name: 'Beijing', country: 'China', baseFlight: 1100, avgHotel: 140, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80', experiences: ['Hutong Rickshaw Tour', 'Peking Duck Dinner'], bestTime: 'Apr-May, Sep-Oct' },
    { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', baseFlight: 700, avgHotel: 210, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80', experiences: ['Canal Cruise', 'Bike Tour'], bestTime: 'Apr-May, Sep' },
    { id: 'istanbul', name: 'Istanbul', country: 'Turkey', baseFlight: 800, avgHotel: 130, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', experiences: ['Bosphorus Cruise', 'Turkish Bath Experience'], bestTime: 'Apr-May, Sep-Nov' },
    { id: 'bangkok', name: 'Bangkok', country: 'Thailand', baseFlight: 900, avgHotel: 80, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', experiences: ['Street Food Tour', 'Floating Market'], bestTime: 'Nov-Feb' },
    { id: 'singapore', name: 'Singapore', country: 'Singapore', baseFlight: 1000, avgHotel: 250, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389ed2?auto=format&fit=crop&w=800&q=80', experiences: ['Gardens by the Bay', 'Sentosa Island'], bestTime: 'Feb-Apr' },
    { id: 'hongkong', name: 'Hong Kong', country: 'China', baseFlight: 1100, avgHotel: 200, image: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?auto=format&fit=crop&w=800&q=80', experiences: ['Victoria Peak', 'Star Ferry'], bestTime: 'Oct-Dec' },
    { id: 'seoul', name: 'Seoul', country: 'South Korea', baseFlight: 1200, avgHotel: 150, image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80', experiences: ['Gyeongbokgung Palace', 'Myeongdong Shopping'], bestTime: 'Mar-May, Sep-Nov' },
    { id: 'bali', name: 'Bali', country: 'Indonesia', baseFlight: 1300, avgHotel: 100, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', experiences: ['Ubud Monkey Forest', 'Tanah Lot Temple'], bestTime: 'Apr-Oct' },
    { id: 'mumbai', name: 'Mumbai', country: 'India', baseFlight: 900, avgHotel: 120, image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80', experiences: ['Gateway of India', 'Marine Drive'], bestTime: 'Oct-Mar' },
    { id: 'capetown', name: 'Cape Town', country: 'South Africa', baseFlight: 1400, avgHotel: 180, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e27?auto=format&fit=crop&w=800&q=80', experiences: ['Table Mountain', 'Robben Island'], bestTime: 'Jan-Apr' },
    { id: 'marrakesh', name: 'Marrakesh', country: 'Morocco', baseFlight: 800, avgHotel: 100, image: 'https://images.unsplash.com/photo-1597211684694-8f255721a861?auto=format&fit=crop&w=800&q=80', experiences: ['Medina Souks', 'Jardin Majorelle'], bestTime: 'Mar-May, Sep-Nov' },
    { id: 'losangeles', name: 'Los Angeles', country: 'USA', baseFlight: 400, avgHotel: 250, image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=800&q=80', experiences: ['Hollywood Sign', 'Santa Monica Pier'], bestTime: 'Mar-May, Sep-Nov' },
    { id: 'lasvegas', name: 'Las Vegas', country: 'USA', baseFlight: 350, avgHotel: 200, image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=800&q=80', experiences: ['The Strip', 'Casinos'], bestTime: 'Mar-May, Sep-Nov' },
    { id: 'sanfrancisco', name: 'San Francisco', country: 'USA', baseFlight: 450, avgHotel: 280, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80', experiences: ['Golden Gate Bridge', 'Alcatraz'], bestTime: 'Sep-Nov' }
  ],
  attractions: [
    { id: 'eiffel', cityId: 'paris', name: 'Eiffel Tower', category: 'Landmark', rating: 4.8, price: '$$', priceValue: 30, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?auto=format&fit=crop&w=800&q=80', gallery: ['https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?auto=format&fit=crop&w=800&q=80'], description: 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.', hours: '9:00 AM - 12:45 AM', address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris', website: 'https://www.toureiffel.paris/' },
    { id: 'louvre', cityId: 'paris', name: 'Louvre Museum', category: 'Museum', rating: 4.7, price: '$$', priceValue: 22, image: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'The world\'s largest art museum and a historic monument in Paris.', hours: '9:00 AM - 6:00 PM', address: 'Rue de Rivoli, 75001 Paris', website: 'https://www.louvre.fr/' },
    { id: 'notredame', cityId: 'paris', name: 'Notre-Dame Cathedral', category: 'History', rating: 4.7, price: 'Free', priceValue: 0, image: 'https://images.unsplash.com/photo-1478391679964-b80418ee3ca3?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Medieval Catholic cathedral on the Île de la Cité.', hours: '8:00 AM - 6:45 PM', address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', website: 'https://www.notredamedeparis.fr/' },
    
    { id: 'shibuya', cityId: 'tokyo', name: 'Shibuya Crossing', category: 'Landmark', rating: 4.6, price: 'Free', priceValue: 0, image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Famous scramble crossing in Shibuya, Tokyo.', hours: '24 Hours', address: 'Shibuya City, Tokyo', website: 'https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html' },
    { id: 'sensoji', cityId: 'tokyo', name: 'Senso-ji Temple', category: 'History', rating: 4.8, price: 'Free', priceValue: 0, image: 'https://images.unsplash.com/photo-1590559648943-305f87b1c1e5?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Ancient Buddhist temple located in Asakusa.', hours: '6:00 AM - 5:00 PM', address: '2 Chome-3-1 Asakusa, Taito City, Tokyo', website: 'https://www.senso-ji.jp/' },
    
    { id: 'statue', cityId: 'nyc', name: 'Statue of Liberty', category: 'Landmark', rating: 4.7, price: '$$', priceValue: 25, image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Colossal neoclassical sculpture on Liberty Island.', hours: '8:30 AM - 4:00 PM', address: 'New York, NY 10004', website: 'https://www.nps.gov/stli/index.htm' },
    { id: 'centralpark', cityId: 'nyc', name: 'Central Park', category: 'Park', rating: 4.9, price: 'Free', priceValue: 0, image: 'https://images.unsplash.com/photo-1576437618991-3f4129b8c94e?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Urban park in New York City located between the Upper West Side and Upper East Side.', hours: '6:00 AM - 1:00 AM', address: 'New York, NY', website: 'https://www.centralparknyc.org/' },

    { id: 'colosseum', cityId: 'rome', name: 'Colosseum', category: 'History', rating: 4.8, price: '$$', priceValue: 18, image: 'https://images.unsplash.com/photo-1552483775-fe0e3b97b14d?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Oval amphitheatre in the centre of the city of Rome, Italy.', hours: '8:30 AM - 7:00 PM', address: 'Piazza del Colosseo, 1, 00184 Roma RM', website: 'https://parcocolosseo.it/' },
    { id: 'vatican', cityId: 'rome', name: 'Vatican Museums', category: 'Museum', rating: 4.7, price: '$$', priceValue: 17, image: 'https://images.unsplash.com/photo-1542820229-081e0c12baab?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'Public art and sculpture museums in the Vatican City.', hours: '9:00 AM - 6:00 PM', address: '00120 Vatican City', website: 'http://www.museivaticani.va/' },

    { id: 'burjkhalifa', cityId: 'dubai', name: 'Burj Khalifa', category: 'Landmark', rating: 4.8, price: '$$$', priceValue: 45, image: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=800&q=80', gallery: [], description: 'The tallest building in the world.', hours: '9:00 AM - 11:00 PM', address: '1 Sheikh Mohammed bin Rashid Blvd - Dubai', website: 'https://www.burjkhalifa.ae/' },
  ],
  accommodations: [
    { id: 'hotel_paris_1', cityId: 'paris', name: 'The Ritz Paris', type: 'Luxury Hotel', rating: 5.0, price: '$$$$', priceValue: 1200, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', website: 'https://www.ritzparis.com/', amenities: ['Pool', 'Spa', 'Fine Dining', 'Bar', 'Gym'] },
    { id: 'hotel_paris_2', cityId: 'paris', name: 'Hôtel Plaza Athénée', type: 'Luxury Hotel', rating: 4.9, price: '$$$$', priceValue: 1000, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', website: 'https://www.dorchestercollection.com/paris/hotel-plaza-athenee', amenities: ['Spa', 'Eiffel View', 'Restaurant', 'Bar'] },
    { id: 'hotel_paris_3', cityId: 'paris', name: 'Le Meurice', type: 'Hotel', rating: 4.8, price: '$$$', priceValue: 800, image: 'https://images.unsplash.com/photo-1590490360182-c87295ec4270?auto=format&fit=crop&w=800&q=80', website: 'https://www.dorchestercollection.com/paris/le-meurice', amenities: ['Spa', 'Restaurant', 'Central Location'] },
    { id: 'hotel_paris_4', cityId: 'paris', name: 'Pullman Tour Eiffel', type: 'Hotel', rating: 4.5, price: '$$', priceValue: 350, image: 'https://images.unsplash.com/photo-1560200353-ce0a76b1d438?auto=format&fit=crop&w=800&q=80', website: 'https://all.accor.com/', amenities: ['Eiffel View', 'Gym', 'Bar'] },
    { id: 'hotel_paris_5', cityId: 'paris', name: 'Novotel Les Halles', type: 'Hotel', rating: 4.4, price: '$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80', website: 'https://all.accor.com/', amenities: ['Central', 'Family Friendly', 'Bar'] },
    { id: 'hotel_paris_6', cityId: 'paris', name: 'Mama Shelter Paris East', type: 'Boutique', rating: 4.3, price: '$', priceValue: 150, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', website: 'https://mamashelter.com/', amenities: ['Rooftop', 'Trendy', 'Bar'] },

    { id: 'hotel_tokyo_1', cityId: 'tokyo', name: 'Aman Tokyo', type: 'Luxury Hotel', rating: 5.0, price: '$$$$', priceValue: 1500, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', website: 'https://www.aman.com/', amenities: ['Spa', 'City View', 'Pool'] },
    { id: 'hotel_tokyo_2', cityId: 'tokyo', name: 'Park Hyatt Tokyo', type: 'Luxury Hotel', rating: 4.9, price: '$$$$', priceValue: 900, image: 'https://images.unsplash.com/photo-1496417263034-38ec4f0d6b21?auto=format&fit=crop&w=800&q=80', website: 'https://www.hyatt.com/', amenities: ['Pool', 'Bar', 'Gym', 'Views'] },
    { id: 'hotel_tokyo_3', cityId: 'tokyo', name: 'Hoshinoya Tokyo', type: 'Ryokan', rating: 4.8, price: '$$$', priceValue: 800, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', website: 'https://hoshinoya.com/', amenities: ['Onsen', 'Traditional', 'Tea'] },
    { id: 'hotel_tokyo_4', cityId: 'tokyo', name: 'Hotel Ryumeikan', type: 'Hotel', rating: 4.5, price: '$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', website: 'https://www.ryumeikan-tokyo.jp/', amenities: ['Central', 'Breakfast', 'Clean'] },
    { id: 'hotel_tokyo_5', cityId: 'tokyo', name: 'Shibuya Stream Excel', type: 'Hotel', rating: 4.4, price: '$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb7464?auto=format&fit=crop&w=800&q=80', website: 'https://www.tokyuhotels.co.jp/', amenities: ['Modern', 'Access', 'Bar'] },
    { id: 'hotel_tokyo_6', cityId: 'tokyo', name: 'Citadines Shinjuku', type: 'Apartment', rating: 4.2, price: '$', priceValue: 120, image: 'https://images.unsplash.com/photo-1522771753014-df706033d833?auto=format&fit=crop&w=800&q=80', website: 'https://www.discoverasr.com/', amenities: ['Kitchen', 'Laundry', 'Spacious'] },

    { id: 'hotel_nyc_1', cityId: 'nyc', name: 'The Plaza', type: 'Luxury Hotel', rating: 4.8, price: '$$$$', priceValue: 900, image: 'https://images.unsplash.com/photo-1559138096-7c6de4256f63?auto=format&fit=crop&w=800&q=80', website: 'https://www.theplazany.com/', amenities: ['Spa', 'Food Hall', 'History'] },
    { id: 'hotel_nyc_2', cityId: 'nyc', name: '1 Hotel Brooklyn Bridge', type: 'Luxury Hotel', rating: 4.7, price: '$$$', priceValue: 600, image: 'https://images.unsplash.com/photo-1560625699-2704259b58e7?auto=format&fit=crop&w=800&q=80', website: 'https://www.1hotels.com/', amenities: ['Pool', 'River View', 'Eco-friendly'] },
    { id: 'hotel_nyc_3', cityId: 'nyc', name: 'Arlo NoMad', type: 'Boutique', rating: 4.5, price: '$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1502021680532-838cfc650323?auto=format&fit=crop&w=800&q=80', website: 'https://www.arlohotels.com/', amenities: ['Rooftop', 'Micro Rooms', 'Modern'] },
    { id: 'hotel_nyc_4', cityId: 'nyc', name: 'CitizenM Times Square', type: 'Hotel', rating: 4.6, price: '$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80', website: 'https://www.citizenm.com/', amenities: ['Tech', 'Rooftop', 'Central'] },
    { id: 'hotel_nyc_5', cityId: 'nyc', name: 'The Standard High Line', type: 'Hotel', rating: 4.4, price: '$$$', priceValue: 400, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', website: 'https://www.standardhotels.com/', amenities: ['Views', 'Clubs', 'Gym'] },
    { id: 'hotel_nyc_6', cityId: 'nyc', name: 'Pod 39', type: 'Budget', rating: 4.1, price: '$', priceValue: 120, image: 'https://images.unsplash.com/photo-1512918760513-95f192972701?auto=format&fit=crop&w=800&q=80', website: 'https://www.thepodhotel.com/', amenities: ['Rooftop', 'Social', 'Compact'] },

    { id: 'hotel_rome_1', cityId: 'rome', name: 'Hotel de Russie', type: 'Luxury Hotel', rating: 4.9, price: '$$$$', priceValue: 1100, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', website: 'https://www.roccofortehotels.com/', amenities: ['Garden', 'Spa', 'Location'] },
    { id: 'hotel_rome_2', cityId: 'rome', name: 'Hotel Eden', type: 'Luxury Hotel', rating: 4.8, price: '$$$$', priceValue: 950, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', website: 'https://www.dorchestercollection.com/', amenities: ['Views', 'Dining', 'Service'] },
    { id: 'hotel_rome_3', cityId: 'rome', name: 'Hassler Roma', type: 'Hotel', rating: 4.7, price: '$$$', priceValue: 700, image: 'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?auto=format&fit=crop&w=800&q=80', website: 'https://www.hotelhasslerroma.com/', amenities: ['Steps View', 'Classic', 'Dining'] },
    { id: 'hotel_rome_4', cityId: 'rome', name: 'IQ Hotel Roma', type: 'Hotel', rating: 4.6, price: '$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80', website: 'https://www.iqhotelroma.it/', amenities: ['Modern', 'Gym', 'Vending'] },
    { id: 'hotel_rome_5', cityId: 'rome', name: 'Hotel Artemide', type: 'Hotel', rating: 4.8, price: '$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', website: 'https://www.hotelartemide.it/', amenities: ['Spa', 'Rooftop', 'Breakfast'] },
    { id: 'hotel_rome_6', cityId: 'rome', name: 'The Beehive', type: 'Hostel', rating: 4.4, price: '$', priceValue: 80, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', website: 'https://www.the-beehive.com/', amenities: ['Garden', 'Cafe', 'Friendly'] },
  ],
  restaurants: [
    { id: 'rest_paris_1', cityId: 'paris', name: 'Le Jules Verne', cuisine: 'French', rating: 4.8, price: '$$$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', website: 'https://www.restaurants-toureiffel.com/' },
    { id: 'rest_paris_2', cityId: 'paris', name: 'L\'Ambroisie', cuisine: 'French', rating: 4.9, price: '$$$$', priceValue: 300, image: 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', website: 'https://www.ambroisie-paris.com/' },
    { id: 'rest_paris_3', cityId: 'paris', name: 'Septime', cuisine: 'Modern French', rating: 4.7, price: '$$', priceValue: 80, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80', website: 'https://www.septime-charonne.fr/' },
    { id: 'rest_paris_4', cityId: 'paris', name: 'Frenchie', cuisine: 'Bistro', rating: 4.6, price: '$$', priceValue: 70, image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&w=800&q=80', website: 'http://www.frenchie-restaurant.com/' },
    { id: 'rest_paris_5', cityId: 'paris', name: 'Le Comptoir du Relais', cuisine: 'Bistro', rating: 4.5, price: '$$', priceValue: 50, image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80', website: 'https://www.hotel-paris-relais-saint-germain.com/' },
    { id: 'rest_paris_6', cityId: 'paris', name: 'L\'As du Fallafel', cuisine: 'Street Food', rating: 4.7, price: '$', priceValue: 15, image: 'https://images.unsplash.com/photo-1520072959219-c595dc3f3db4?auto=format&fit=crop&w=800&q=80', website: 'http://l-as-du-fallafel.zenchef.com/' },

    { id: 'rest_tokyo_1', cityId: 'tokyo', name: 'Sukiyabashi Jiro', cuisine: 'Sushi', rating: 4.9, price: '$$$$', priceValue: 300, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', website: 'https://www.sushi-jiro.jp/' },
    { id: 'rest_tokyo_2', cityId: 'tokyo', name: 'Narisawa', cuisine: 'Modern Japanese', rating: 4.8, price: '$$$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', website: 'https://www.narisawa-yoshihiro.com/' },
    { id: 'rest_tokyo_3', cityId: 'tokyo', name: 'Sushi Saito', cuisine: 'Sushi', rating: 4.9, price: '$$$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80', website: 'https://tabelog.com/' },
    { id: 'rest_tokyo_4', cityId: 'tokyo', name: 'Afuri Ramen', cuisine: 'Ramen', rating: 4.6, price: '$', priceValue: 15, image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80', website: 'https://afuri.com/' },
    { id: 'rest_tokyo_5', cityId: 'tokyo', name: 'Kanda', cuisine: 'Kaiseki', rating: 4.7, price: '$$$', priceValue: 150, image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&w=800&q=80', website: 'https://www.nihonryori-kanda.com/' },
    { id: 'rest_tokyo_6', cityId: 'tokyo', name: 'Gonpachi Nishiazabu', cuisine: 'Izakaya', rating: 4.4, price: '$$', priceValue: 50, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', website: 'https://gonpachi.jp/' },

    { id: 'rest_nyc_1', cityId: 'nyc', name: 'Le Bernardin', cuisine: 'Seafood', rating: 4.9, price: '$$$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', website: 'https://www.le-bernardin.com/' },
    { id: 'rest_nyc_2', cityId: 'nyc', name: 'Eleven Madison Park', cuisine: 'Modern American', rating: 4.8, price: '$$$$', priceValue: 350, image: 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', website: 'https://www.elevenmadisonpark.com/' },
    { id: 'rest_nyc_3', cityId: 'nyc', name: 'Katz\'s Delicatessen', cuisine: 'Deli', rating: 4.7, price: '$$', priceValue: 30, image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=800&q=80', website: 'https://katzsdelicatessen.com/' },
    { id: 'rest_nyc_4', cityId: 'nyc', name: 'Joe\'s Pizza', cuisine: 'Pizza', rating: 4.8, price: '$', priceValue: 5, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', website: 'http://www.joespizzanyc.com/' },
    { id: 'rest_nyc_5', cityId: 'nyc', name: 'Peter Luger Steak House', cuisine: 'Steakhouse', rating: 4.6, price: '$$$', priceValue: 100, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80', website: 'https://peterluger.com/' },
    { id: 'rest_nyc_6', cityId: 'nyc', name: 'Momofuku Noodle Bar', cuisine: 'Asian Fusion', rating: 4.5, price: '$$', priceValue: 40, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', website: 'https://momofuku.com/' },

    { id: 'rest_rome_1', cityId: 'rome', name: 'La Pergola', cuisine: 'Italian', rating: 4.9, price: '$$$$', priceValue: 250, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', website: 'https://romecavalieri.com/la-pergola/' },
    { id: 'rest_rome_2', cityId: 'rome', name: 'Il Pagliaccio', cuisine: 'Modern Italian', rating: 4.8, price: '$$$$', priceValue: 200, image: 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', website: 'http://www.ristoranteilpagliaccio.com/' },
    { id: 'rest_rome_3', cityId: 'rome', name: 'Roscioli Salumeria', cuisine: 'Italian', rating: 4.7, price: '$$', priceValue: 60, image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&w=800&q=80', website: 'http://www.salumeriaroscioli.com/' },
    { id: 'rest_rome_4', cityId: 'rome', name: 'Pizzarium Bonci', cuisine: 'Pizza', rating: 4.8, price: '$', priceValue: 15, image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89e7344?auto=format&fit=crop&w=800&q=80', website: 'https://www.bonci.it/' },
    { id: 'rest_rome_5', cityId: 'rome', name: 'Da Enzo al 29', cuisine: 'Roman', rating: 4.6, price: '$$', priceValue: 40, image: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&w=800&q=80', website: 'http://www.daenzoal29.com/' },
    { id: 'rest_rome_6', cityId: 'rome', name: 'Tonnarello', cuisine: 'Pasta', rating: 4.7, price: '$$', priceValue: 30, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', website: 'https://tonnarello.it/' },
  ]
};

export const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+61', country: 'AU' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+971', country: 'UAE' }
];

export const getCountryCurrency = (country?: string, fallback: string = 'USD'): string => {
  if (country === 'India') return 'INR';
  if (country === 'Japan') return 'JPY';
  if (country === 'UK') return 'GBP';
  if (country === 'France' || country === 'Germany' || country === 'Italy' || country === 'Spain') return 'EUR';
  return fallback;
};