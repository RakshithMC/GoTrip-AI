-- GoTrip AI Catalog Seed Migration
-- Migration File: 002_seed_gotrip_catalog.sql
-- Contains static travel catalog data for cities, attractions, accommodations, and restaurants.

-- ==========================================
-- 1. SEED CITIES (27 records)
-- ==========================================
INSERT INTO cities (id, name, country, base_flight, avg_hotel, image, experiences, best_time)
VALUES
  ('paris', 'Paris', 'France', 800, 200, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', '["Seine River Cruise","Macaron Baking Class"]'::jsonb, 'Apr-Jun, Oct-Nov'),
  ('tokyo', 'Tokyo', 'Japan', 1200, 180, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', '["Tea Ceremony","Sumo Practice"]'::jsonb, 'Mar-May, Oct-Nov'),
  ('nyc', 'New York', 'USA', 500, 300, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', '["Broadway Show","Central Park Bike Ride"]'::jsonb, 'Apr-Jun, Sep-Nov'),
  ('rome', 'Rome', 'Italy', 850, 150, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', '["Vatican Tour","Pizza Making Class"]'::jsonb, 'Apr-Jun, Sep-Oct'),
  ('london', 'London', 'UK', 700, 250, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', '["West End Show","Afternoon Tea"]'::jsonb, 'Mar-May'),
  ('dubai', 'Dubai', 'UAE', 900, 300, 'https://images.unsplash.com/photo-1512453979798-5ea936a7d40b?auto=format&fit=crop&w=800&q=80', '["Desert Safari","Dhow Cruise"]'::jsonb, 'Nov-Mar'),
  ('sydney', 'Sydney', 'Australia', 1500, 220, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', '["Harbour Bridge Climb","Surf Lesson"]'::jsonb, 'Sep-Nov, Mar-May'),
  ('agra', 'Agra', 'India', 1000, 80, 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80', '["Taj Mahal Sunrise","Mughal Heritage Walk"]'::jsonb, 'Oct-Mar'),
  ('rio', 'Rio de Janeiro', 'Brazil', 1100, 150, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', '["Samba Show","Favela Tour"]'::jsonb, 'Dec-Mar'),
  ('cairo', 'Cairo', 'Egypt', 800, 100, 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80', '["Nile Cruise","Pyramids Sound & Light"]'::jsonb, 'Oct-Apr'),
  ('barcelona', 'Barcelona', 'Spain', 750, 180, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80', '["Tapas Tour","Flamenco Show"]'::jsonb, 'May-Jun, Sep-Oct'),
  ('santorini', 'Santorini', 'Greece', 900, 350, 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=800&q=80', '["Catamaran Cruise","Wine Tasting"]'::jsonb, 'Apr-Oct'),
  ('machupicchu', 'Cusco', 'Peru', 1300, 120, 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80', '["Inca Trail Trek","Chocolate Making Class"]'::jsonb, 'May-Sep'),
  ('beijing', 'Beijing', 'China', 1100, 140, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80', '["Hutong Rickshaw Tour","Peking Duck Dinner"]'::jsonb, 'Apr-May, Sep-Oct'),
  ('amsterdam', 'Amsterdam', 'Netherlands', 700, 210, 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80', '["Canal Cruise","Bike Tour"]'::jsonb, 'Apr-May, Sep'),
  ('istanbul', 'Istanbul', 'Turkey', 800, 130, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', '["Bosphorus Cruise","Turkish Bath Experience"]'::jsonb, 'Apr-May, Sep-Nov'),
  ('bangkok', 'Bangkok', 'Thailand', 900, 80, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', '["Street Food Tour","Floating Market"]'::jsonb, 'Nov-Feb'),
  ('singapore', 'Singapore', 'Singapore', 1000, 250, 'https://images.unsplash.com/photo-1525625293386-3f8f99389ed2?auto=format&fit=crop&w=800&q=80', '["Gardens by the Bay","Sentosa Island"]'::jsonb, 'Feb-Apr'),
  ('hongkong', 'Hong Kong', 'China', 1100, 200, 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?auto=format&fit=crop&w=800&q=80', '["Victoria Peak","Star Ferry"]'::jsonb, 'Oct-Dec'),
  ('seoul', 'Seoul', 'South Korea', 1200, 150, 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80', '["Gyeongbokgung Palace","Myeongdong Shopping"]'::jsonb, 'Mar-May, Sep-Nov'),
  ('bali', 'Bali', 'Indonesia', 1300, 100, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', '["Ubud Monkey Forest","Tanah Lot Temple"]'::jsonb, 'Apr-Oct'),
  ('mumbai', 'Mumbai', 'India', 900, 120, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80', '["Gateway of India","Marine Drive"]'::jsonb, 'Oct-Mar'),
  ('capetown', 'Cape Town', 'South Africa', 1400, 180, 'https://images.unsplash.com/photo-1580060839134-75a5edca2e27?auto=format&fit=crop&w=800&q=80', '["Table Mountain","Robben Island"]'::jsonb, 'Jan-Apr'),
  ('marrakesh', 'Marrakesh', 'Morocco', 800, 100, 'https://images.unsplash.com/photo-1597211684694-8f255721a861?auto=format&fit=crop&w=800&q=80', '["Medina Souks","Jardin Majorelle"]'::jsonb, 'Mar-May, Sep-Nov'),
  ('losangeles', 'Los Angeles', 'USA', 400, 250, 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=800&q=80', '["Hollywood Sign","Santa Monica Pier"]'::jsonb, 'Mar-May, Sep-Nov'),
  ('lasvegas', 'Las Vegas', 'USA', 350, 200, 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=800&q=80', '["The Strip","Casinos"]'::jsonb, 'Mar-May, Sep-Nov'),
  ('sanfrancisco', 'San Francisco', 'USA', 450, 280, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80', '["Golden Gate Bridge","Alcatraz"]'::jsonb, 'Sep-Nov')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  base_flight = EXCLUDED.base_flight,
  avg_hotel = EXCLUDED.avg_hotel,
  image = EXCLUDED.image,
  experiences = EXCLUDED.experiences,
  best_time = EXCLUDED.best_time;

-- ==========================================
-- 2. SEED ATTRACTIONS (10 records)
-- ==========================================
INSERT INTO attractions (id, city_id, name, category, rating, price, price_value, image, gallery, description, hours, address, website, map_uri)
VALUES
  ('eiffel', 'paris', 'Eiffel Tower', 'Landmark', 4.8, '$$', 30, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?auto=format&fit=crop&w=800&q=80"]'::jsonb, 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.', '9:00 AM - 12:45 AM', 'Champ de Mars, 5 Av. Anatole France, 75007 Paris', 'https://www.toureiffel.paris/', NULL),
  ('louvre', 'paris', 'Louvre Museum', 'Museum', 4.7, '$$', 22, 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'The world''s largest art museum and a historic monument in Paris.', '9:00 AM - 6:00 PM', 'Rue de Rivoli, 75001 Paris', 'https://www.louvre.fr/', NULL),
  ('notredame', 'paris', 'Notre-Dame Cathedral', 'History', 4.7, 'Free', 0, 'https://images.unsplash.com/photo-1478391679964-b80418ee3ca3?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Medieval Catholic cathedral on the Île de la Cité.', '8:00 AM - 6:45 PM', '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', 'https://www.notredamedeparis.fr/', NULL),
  ('shibuya', 'tokyo', 'Shibuya Crossing', 'Landmark', 4.6, 'Free', 0, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Famous scramble crossing in Shibuya, Tokyo.', '24 Hours', 'Shibuya City, Tokyo', 'https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html', NULL),
  ('sensoji', 'tokyo', 'Senso-ji Temple', 'History', 4.8, 'Free', 0, 'https://images.unsplash.com/photo-1590559648943-305f87b1c1e5?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Ancient Buddhist temple located in Asakusa.', '6:00 AM - 5:00 PM', '2 Chome-3-1 Asakusa, Taito City, Tokyo', 'https://www.senso-ji.jp/', NULL),
  ('statue', 'nyc', 'Statue of Liberty', 'Landmark', 4.7, '$$', 25, 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Colossal neoclassical sculpture on Liberty Island.', '8:30 AM - 4:00 PM', 'New York, NY 10004', 'https://www.nps.gov/stli/index.htm', NULL),
  ('centralpark', 'nyc', 'Central Park', 'Park', 4.9, 'Free', 0, 'https://images.unsplash.com/photo-1576437618991-3f4129b8c94e?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Urban park in New York City located between the Upper West Side and Upper East Side.', '6:00 AM - 1:00 AM', 'New York, NY', 'https://www.centralparknyc.org/', NULL),
  ('colosseum', 'rome', 'Colosseum', 'History', 4.8, '$$', 18, 'https://images.unsplash.com/photo-1552483775-fe0e3b97b14d?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Oval amphitheatre in the centre of the city of Rome, Italy.', '8:30 AM - 7:00 PM', 'Piazza del Colosseo, 1, 00184 Roma RM', 'https://parcocolosseo.it/', NULL),
  ('vatican', 'rome', 'Vatican Museums', 'Museum', 4.7, '$$', 17, 'https://images.unsplash.com/photo-1542820229-081e0c12baab?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'Public art and sculpture museums in the Vatican City.', '9:00 AM - 6:00 PM', '00120 Vatican City', 'http://www.museivaticani.va/', NULL),
  ('burjkhalifa', 'dubai', 'Burj Khalifa', 'Landmark', 4.8, '$$$', 45, 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=800&q=80', '[]'::jsonb, 'The tallest building in the world.', '9:00 AM - 11:00 PM', '1 Sheikh Mohammed bin Rashid Blvd - Dubai', 'https://www.burjkhalifa.ae/', NULL)
ON CONFLICT (id) DO UPDATE SET
  city_id = EXCLUDED.city_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  rating = EXCLUDED.rating,
  price = EXCLUDED.price,
  price_value = EXCLUDED.price_value,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  description = EXCLUDED.description,
  hours = EXCLUDED.hours,
  address = EXCLUDED.address,
  website = EXCLUDED.website,
  map_uri = EXCLUDED.map_uri;

-- ==========================================
-- 3. SEED ACCOMMODATIONS (24 records)
-- ==========================================
INSERT INTO accommodations (id, city_id, name, type, rating, price, price_value, price_per_night, image, website, address, amenities)
VALUES
  ('hotel_paris_1', 'paris', 'The Ritz Paris', 'Luxury Hotel', 5, '$$$$', 1200, 1200, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'https://www.ritzparis.com/', NULL, '["Pool","Spa","Fine Dining","Bar","Gym"]'::jsonb),
  ('hotel_paris_2', 'paris', 'Hôtel Plaza Athénée', 'Luxury Hotel', 4.9, '$$$$', 1000, 1000, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', 'https://www.dorchestercollection.com/paris/hotel-plaza-athenee', NULL, '["Spa","Eiffel View","Restaurant","Bar"]'::jsonb),
  ('hotel_paris_3', 'paris', 'Le Meurice', 'Hotel', 4.8, '$$$', 800, 800, 'https://images.unsplash.com/photo-1590490360182-c87295ec4270?auto=format&fit=crop&w=800&q=80', 'https://www.dorchestercollection.com/paris/le-meurice', NULL, '["Spa","Restaurant","Central Location"]'::jsonb),
  ('hotel_paris_4', 'paris', 'Pullman Tour Eiffel', 'Hotel', 4.5, '$$', 350, 350, 'https://images.unsplash.com/photo-1560200353-ce0a76b1d438?auto=format&fit=crop&w=800&q=80', 'https://all.accor.com/', NULL, '["Eiffel View","Gym","Bar"]'::jsonb),
  ('hotel_paris_5', 'paris', 'Novotel Les Halles', 'Hotel', 4.4, '$$', 250, 250, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80', 'https://all.accor.com/', NULL, '["Central","Family Friendly","Bar"]'::jsonb),
  ('hotel_paris_6', 'paris', 'Mama Shelter Paris East', 'Boutique', 4.3, '$', 150, 150, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'https://mamashelter.com/', NULL, '["Rooftop","Trendy","Bar"]'::jsonb),
  ('hotel_tokyo_1', 'tokyo', 'Aman Tokyo', 'Luxury Hotel', 5, '$$$$', 1500, 1500, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', 'https://www.aman.com/', NULL, '["Spa","City View","Pool"]'::jsonb),
  ('hotel_tokyo_2', 'tokyo', 'Park Hyatt Tokyo', 'Luxury Hotel', 4.9, '$$$$', 900, 900, 'https://images.unsplash.com/photo-1496417263034-38ec4f0d6b21?auto=format&fit=crop&w=800&q=80', 'https://www.hyatt.com/', NULL, '["Pool","Bar","Gym","Views"]'::jsonb),
  ('hotel_tokyo_3', 'tokyo', 'Hoshinoya Tokyo', 'Ryokan', 4.8, '$$$', 800, 800, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', 'https://hoshinoya.com/', NULL, '["Onsen","Traditional","Tea"]'::jsonb),
  ('hotel_tokyo_4', 'tokyo', 'Hotel Ryumeikan', 'Hotel', 4.5, '$$', 200, 200, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', 'https://www.ryumeikan-tokyo.jp/', NULL, '["Central","Breakfast","Clean"]'::jsonb),
  ('hotel_tokyo_5', 'tokyo', 'Shibuya Stream Excel', 'Hotel', 4.4, '$$', 250, 250, 'https://images.unsplash.com/photo-1445019980597-93fa8acb7464?auto=format&fit=crop&w=800&q=80', 'https://www.tokyuhotels.co.jp/', NULL, '["Modern","Access","Bar"]'::jsonb),
  ('hotel_tokyo_6', 'tokyo', 'Citadines Shinjuku', 'Apartment', 4.2, '$', 120, 120, 'https://images.unsplash.com/photo-1522771753014-df706033d833?auto=format&fit=crop&w=800&q=80', 'https://www.discoverasr.com/', NULL, '["Kitchen","Laundry","Spacious"]'::jsonb),
  ('hotel_nyc_1', 'nyc', 'The Plaza', 'Luxury Hotel', 4.8, '$$$$', 900, 900, 'https://images.unsplash.com/photo-1559138096-7c6de4256f63?auto=format&fit=crop&w=800&q=80', 'https://www.theplazany.com/', NULL, '["Spa","Food Hall","History"]'::jsonb),
  ('hotel_nyc_2', 'nyc', '1 Hotel Brooklyn Bridge', 'Luxury Hotel', 4.7, '$$$', 600, 600, 'https://images.unsplash.com/photo-1560625699-2704259b58e7?auto=format&fit=crop&w=800&q=80', 'https://www.1hotels.com/', NULL, '["Pool","River View","Eco-friendly"]'::jsonb),
  ('hotel_nyc_3', 'nyc', 'Arlo NoMad', 'Boutique', 4.5, '$$', 250, 250, 'https://images.unsplash.com/photo-1502021680532-838cfc650323?auto=format&fit=crop&w=800&q=80', 'https://www.arlohotels.com/', NULL, '["Rooftop","Micro Rooms","Modern"]'::jsonb),
  ('hotel_nyc_4', 'nyc', 'CitizenM Times Square', 'Hotel', 4.6, '$$', 200, 200, 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80', 'https://www.citizenm.com/', NULL, '["Tech","Rooftop","Central"]'::jsonb),
  ('hotel_nyc_5', 'nyc', 'The Standard High Line', 'Hotel', 4.4, '$$$', 400, 400, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'https://www.standardhotels.com/', NULL, '["Views","Clubs","Gym"]'::jsonb),
  ('hotel_nyc_6', 'nyc', 'Pod 39', 'Budget', 4.1, '$', 120, 120, 'https://images.unsplash.com/photo-1512918760513-95f192972701?auto=format&fit=crop&w=800&q=80', 'https://www.thepodhotel.com/', NULL, '["Rooftop","Social","Compact"]'::jsonb),
  ('hotel_rome_1', 'rome', 'Hotel de Russie', 'Luxury Hotel', 4.9, '$$$$', 1100, 1100, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 'https://www.roccofortehotels.com/', NULL, '["Garden","Spa","Location"]'::jsonb),
  ('hotel_rome_2', 'rome', 'Hotel Eden', 'Luxury Hotel', 4.8, '$$$$', 950, 950, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'https://www.dorchestercollection.com/', NULL, '["Views","Dining","Service"]'::jsonb),
  ('hotel_rome_3', 'rome', 'Hassler Roma', 'Hotel', 4.7, '$$$', 700, 700, 'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?auto=format&fit=crop&w=800&q=80', 'https://www.hotelhasslerroma.com/', NULL, '["Steps View","Classic","Dining"]'::jsonb),
  ('hotel_rome_4', 'rome', 'IQ Hotel Roma', 'Hotel', 4.6, '$$', 200, 200, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80', 'https://www.iqhotelroma.it/', NULL, '["Modern","Gym","Vending"]'::jsonb),
  ('hotel_rome_5', 'rome', 'Hotel Artemide', 'Hotel', 4.8, '$$', 250, 250, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', 'https://www.hotelartemide.it/', NULL, '["Spa","Rooftop","Breakfast"]'::jsonb),
  ('hotel_rome_6', 'rome', 'The Beehive', 'Hostel', 4.4, '$', 80, 80, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', 'https://www.the-beehive.com/', NULL, '["Garden","Cafe","Friendly"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  city_id = EXCLUDED.city_id,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  rating = EXCLUDED.rating,
  price = EXCLUDED.price,
  price_value = EXCLUDED.price_value,
  price_per_night = EXCLUDED.price_per_night,
  image = EXCLUDED.image,
  website = EXCLUDED.website,
  address = EXCLUDED.address,
  amenities = EXCLUDED.amenities;

-- ==========================================
-- 4. SEED RESTAURANTS (24 records)
-- ==========================================
INSERT INTO restaurants (id, city_id, name, cuisine, rating, price, price_value, image, website)
VALUES
  ('rest_paris_1', 'paris', 'Le Jules Verne', 'French', 4.8, '$$$$', 200, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', 'https://www.restaurants-toureiffel.com/'),
  ('rest_paris_2', 'paris', 'L''Ambroisie', 'French', 4.9, '$$$$', 300, 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', 'https://www.ambroisie-paris.com/'),
  ('rest_paris_3', 'paris', 'Septime', 'Modern French', 4.7, '$$', 80, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80', 'https://www.septime-charonne.fr/'),
  ('rest_paris_4', 'paris', 'Frenchie', 'Bistro', 4.6, '$$', 70, 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&w=800&q=80', 'http://www.frenchie-restaurant.com/'),
  ('rest_paris_5', 'paris', 'Le Comptoir du Relais', 'Bistro', 4.5, '$$', 50, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80', 'https://www.hotel-paris-relais-saint-germain.com/'),
  ('rest_paris_6', 'paris', 'L''As du Fallafel', 'Street Food', 4.7, '$', 15, 'https://images.unsplash.com/photo-1520072959219-c595dc3f3db4?auto=format&fit=crop&w=800&q=80', 'http://l-as-du-fallafel.zenchef.com/'),
  ('rest_tokyo_1', 'tokyo', 'Sukiyabashi Jiro', 'Sushi', 4.9, '$$$$', 300, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 'https://www.sushi-jiro.jp/'),
  ('rest_tokyo_2', 'tokyo', 'Narisawa', 'Modern Japanese', 4.8, '$$$$', 250, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'https://www.narisawa-yoshihiro.com/'),
  ('rest_tokyo_3', 'tokyo', 'Sushi Saito', 'Sushi', 4.9, '$$$$', 200, 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80', 'https://tabelog.com/'),
  ('rest_tokyo_4', 'tokyo', 'Afuri Ramen', 'Ramen', 4.6, '$', 15, 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80', 'https://afuri.com/'),
  ('rest_tokyo_5', 'tokyo', 'Kanda', 'Kaiseki', 4.7, '$$$', 150, 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&w=800&q=80', 'https://www.nihonryori-kanda.com/'),
  ('rest_tokyo_6', 'tokyo', 'Gonpachi Nishiazabu', 'Izakaya', 4.4, '$$', 50, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'https://gonpachi.jp/'),
  ('rest_nyc_1', 'nyc', 'Le Bernardin', 'Seafood', 4.9, '$$$$', 250, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', 'https://www.le-bernardin.com/'),
  ('rest_nyc_2', 'nyc', 'Eleven Madison Park', 'Modern American', 4.8, '$$$$', 350, 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', 'https://www.elevenmadisonpark.com/'),
  ('rest_nyc_3', 'nyc', 'Katz''s Delicatessen', 'Deli', 4.7, '$$', 30, 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=800&q=80', 'https://katzsdelicatessen.com/'),
  ('rest_nyc_4', 'nyc', 'Joe''s Pizza', 'Pizza', 4.8, '$', 5, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 'http://www.joespizzanyc.com/'),
  ('rest_nyc_5', 'nyc', 'Peter Luger Steak House', 'Steakhouse', 4.6, '$$$', 100, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80', 'https://peterluger.com/'),
  ('rest_nyc_6', 'nyc', 'Momofuku Noodle Bar', 'Asian Fusion', 4.5, '$$', 40, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', 'https://momofuku.com/'),
  ('rest_rome_1', 'rome', 'La Pergola', 'Italian', 4.9, '$$$$', 250, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', 'https://romecavalieri.com/la-pergola/'),
  ('rest_rome_2', 'rome', 'Il Pagliaccio', 'Modern Italian', 4.8, '$$$$', 200, 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800&q=80', 'http://www.ristoranteilpagliaccio.com/'),
  ('rest_rome_3', 'rome', 'Roscioli Salumeria', 'Italian', 4.7, '$$', 60, 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&w=800&q=80', 'http://www.salumeriaroscioli.com/'),
  ('rest_rome_4', 'rome', 'Pizzarium Bonci', 'Pizza', 4.8, '$', 15, 'https://images.unsplash.com/photo-1574126154517-d1e0d89e7344?auto=format&fit=crop&w=800&q=80', 'https://www.bonci.it/'),
  ('rest_rome_5', 'rome', 'Da Enzo al 29', 'Roman', 4.6, '$$', 40, 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&w=800&q=80', 'http://www.daenzoal29.com/'),
  ('rest_rome_6', 'rome', 'Tonnarello', 'Pasta', 4.7, '$$', 30, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', 'https://tonnarello.it/')
ON CONFLICT (id) DO UPDATE SET
  city_id = EXCLUDED.city_id,
  name = EXCLUDED.name,
  cuisine = EXCLUDED.cuisine,
  rating = EXCLUDED.rating,
  price = EXCLUDED.price,
  price_value = EXCLUDED.price_value,
  image = EXCLUDED.image,
  website = EXCLUDED.website;
