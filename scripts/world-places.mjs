// Hand-picked world cities and landmarks used for the "Cities" and "Landmarks" questions.
// Format: "Name|ISO3 country code". Capitals are left out (they already have their own questions).
// Names that exist in two nearby countries are left out, so every question has exactly one right answer.

export const CITIES = [...`
Barcelona|ESP Seville|ESP Bilbao|ESP Málaga|ESP Granada|ESP Valencia|ESP
Porto|PRT Faro|PRT Funchal|PRT
Milan|ITA Venice|ITA Florence|ITA Naples|ITA Turin|ITA Pisa|ITA Verona|ITA Bologna|ITA Palermo|ITA
Munich|DEU Hamburg|DEU Frankfurt|DEU Cologne|DEU Stuttgart|DEU Düsseldorf|DEU Dresden|DEU Leipzig|DEU Nuremberg|DEU
Marseille|FRA Lyon|FRA Nice|FRA Bordeaux|FRA Toulouse|FRA Strasbourg|FRA Cannes|FRA Lille|FRA
Manchester|GBR Liverpool|GBR Edinburgh|GBR Glasgow|GBR Oxford|GBR Cardiff|GBR Belfast|GBR Bristol|GBR
Cork|IRL Galway|IRL
Rotterdam|NLD Utrecht|NLD Eindhoven|NLD The Hague|NLD
Antwerp|BEL Bruges|BEL Ghent|BEL
Geneva|CHE Zurich|CHE Basel|CHE Lucerne|CHE
Salzburg|AUT Innsbruck|AUT Graz|AUT
Gothenburg|SWE Malmö|SWE Trondheim|NOR Tromsø|NOR Aarhus|DNK Odense|DNK Tampere|FIN Turku|FIN Akureyri|ISL
Kraków|POL Gdańsk|POL Wrocław|POL Poznań|POL Brno|CZE Debrecen|HUN Cluj-Napoca|ROU Plovdiv|BGR
Thessaloniki|GRC Split|HRV Dubrovnik|HRV Novi Sad|SRB Mostar|BIH Kotor|MNE Ohrid|MKD
Saint Petersburg|RUS Kazan|RUS Novosibirsk|RUS Vladivostok|RUS Lviv|UKR Odesa|UKR Kharkiv|UKR
Kaunas|LTU Tartu|EST Batumi|GEO
Istanbul|TUR Izmir|TUR Antalya|TUR Bursa|TUR
Osaka|JPN Kyoto|JPN Yokohama|JPN Sapporo|JPN Hiroshima|JPN Nagoya|JPN Fukuoka|JPN Nara|JPN
Busan|KOR Incheon|KOR Daegu|KOR
Shanghai|CHN Guangzhou|CHN Shenzhen|CHN Chengdu|CHN Xi'an|CHN Hangzhou|CHN Wuhan|CHN Chongqing|CHN Harbin|CHN Lhasa|CHN
Mumbai|IND Kolkata|IND Chennai|IND Bengaluru|IND Jaipur|IND Agra|IND Varanasi|IND Ahmedabad|IND
Karachi|PAK Lahore|PAK Peshawar|PAK Chittagong|BGD Kandy|LKA Galle|LKA Pokhara|NPL
Ho Chi Minh City|VNM Da Nang|VNM Hoi An|VNM Chiang Mai|THA Phuket|THA Pattaya|THA
Siem Reap|KHM Luang Prabang|LAO Mandalay|MMR Yangon|MMR George Town|MYS Malacca|MYS
Surabaya|IDN Denpasar|IDN Yogyakarta|IDN Bandung|IDN Medan|IDN Cebu|PHL Davao|PHL
Dubai|ARE Sharjah|ARE Jeddah|SAU Mecca|SAU Medina|SAU
Isfahan|IRN Shiraz|IRN Tabriz|IRN Mashhad|IRN Basra|IRQ Mosul|IRQ Erbil|IRQ Aleppo|SYR
Aqaba|JOR Tel Aviv|ISR Haifa|ISR Samarkand|UZB Bukhara|UZB Almaty|KAZ Osh|KGZ Herat|AFG Kandahar|AFG Salalah|OMN Aden|YEM
New York|USA Los Angeles|USA Chicago|USA San Francisco|USA Miami|USA Seattle|USA Boston|USA Las Vegas|USA
New Orleans|USA Houston|USA Dallas|USA Atlanta|USA Denver|USA Honolulu|USA Nashville|USA Philadelphia|USA Detroit|USA
Toronto|CAN Vancouver|CAN Montreal|CAN Calgary|CAN Quebec City|CAN Halifax|CAN Edmonton|CAN Winnipeg|CAN
Guadalajara|MEX Monterrey|MEX Cancún|MEX Tijuana|MEX Oaxaca|MEX Puebla|MEX Acapulco|MEX
Antigua Guatemala|GTM Santiago de Cuba|CUB Montego Bay|JAM Punta Cana|DOM
Cartagena|COL Medellín|COL Cali|COL Barranquilla|COL Guayaquil|ECU Cusco|PER Arequipa|PER Iquitos|PER
Rio de Janeiro|BRA São Paulo|BRA Salvador|BRA Manaus|BRA Recife|BRA Fortaleza|BRA Florianópolis|BRA Porto Alegre|BRA Belo Horizonte|BRA
Córdoba|ARG Mendoza|ARG Rosario|ARG Ushuaia|ARG Bariloche|ARG Valparaíso|CHL Punta Arenas|CHL
Santa Cruz de la Sierra|BOL Punta del Este|URY Ciudad del Este|PRY Maracaibo|VEN
Sydney|AUS Melbourne|AUS Brisbane|AUS Adelaide|AUS Darwin|AUS Hobart|AUS Cairns|AUS Gold Coast|AUS
Auckland|NZL Christchurch|NZL Queenstown|NZL Dunedin|NZL Rotorua|NZL Nadi|FJI Lae|PNG
`.matchAll(/\s*(.+?)\|([A-Z]{3})/g)].map(([, n, c]) => ({ n: n.trim(), c }));

export const LANDMARKS = [
  ["the Eiffel Tower", "FRA"], ["the Louvre", "FRA"], ["Mont Saint-Michel", "FRA"], ["the Palace of Versailles", "FRA"],
  ["the Colosseum", "ITA"], ["the Leaning Tower of Pisa", "ITA"], ["the Trevi Fountain", "ITA"], ["the Amalfi Coast", "ITA"],
  ["the Sagrada Família", "ESP"], ["the Alhambra", "ESP"], ["Park Güell", "ESP"],
  ["Big Ben", "GBR"], ["Stonehenge", "GBR"], ["Tower Bridge", "GBR"], ["Edinburgh Castle", "GBR"], ["the Giant's Causeway", "GBR"],
  ["the Brandenburg Gate", "DEU"], ["Neuschwanstein Castle", "DEU"], ["Cologne Cathedral", "DEU"],
  ["the Acropolis", "GRC"], ["Santorini", "GRC"], ["Meteora", "GRC"],
  ["the Charles Bridge", "CZE"], ["Hallstatt", "AUT"], ["Schönbrunn Palace", "AUT"], ["the Jungfraujoch", "CHE"],
  ["the Cliffs of Moher", "IRL"], ["the Atomium", "BEL"], ["the Kinderdijk windmills", "NLD"], ["the Anne Frank House", "NLD"],
  ["the Little Mermaid statue", "DNK"], ["Tivoli Gardens", "DNK"], ["the Geirangerfjord", "NOR"], ["the Blue Lagoon", "ISL"],
  ["Hagia Sophia", "TUR"], ["Cappadocia", "TUR"], ["Pamukkale", "TUR"], ["Mount Ararat", "TUR"],
  ["Red Square", "RUS"], ["Lake Baikal", "RUS"], ["Belém Tower", "PRT"], ["Pena Palace", "PRT"],
  ["Plitvice Lakes", "HRV"], ["Lake Bled", "SVN"], ["the Wieliczka Salt Mine", "POL"], ["Bran Castle", "ROU"],
  ["the Rila Monastery", "BGR"], ["St Peter's Basilica", "VAT"], ["the Bay of Kotor", "MNE"], ["the Hungarian Parliament Building", "HUN"],
  ["the Great Wall", "CHN"], ["the Forbidden City", "CHN"], ["the Terracotta Army", "CHN"], ["the Li River karst hills", "CHN"],
  ["Mount Fuji", "JPN"], ["the Fushimi Inari Shrine", "JPN"], ["the Itsukushima Shrine", "JPN"],
  ["the Taj Mahal", "IND"], ["the Golden Temple", "IND"], ["the Hawa Mahal", "IND"], ["the Gateway of India", "IND"],
  ["Angkor Wat", "KHM"], ["the Petronas Towers", "MYS"], ["the Batu Caves", "MYS"], ["Marina Bay Sands", "SGP"],
  ["the Burj Khalifa", "ARE"], ["the Sheikh Zayed Grand Mosque", "ARE"], ["Petra", "JOR"], ["Wadi Rum", "JOR"],
  ["Persepolis", "IRN"], ["Ha Long Bay", "VNM"], ["Borobudur", "IDN"], ["Komodo National Park", "IDN"],
  ["Bagan", "MMR"], ["the Shwedagon Pagoda", "MMR"], ["Sigiriya", "LKA"], ["Boudhanath Stupa", "NPL"],
  ["the Chocolate Hills", "PHL"], ["the Banaue Rice Terraces", "PHL"], ["the Grand Palace", "THA"], ["Wat Arun", "THA"],
  ["Gyeongbokgung Palace", "KOR"], ["the Registan", "UZB"], ["Tiger's Nest Monastery", "BTN"], ["the Badshahi Mosque", "PAK"],
  ["Hegra", "SAU"], ["the Museum of Islamic Art", "QAT"],
  ["the Statue of Liberty", "USA"], ["the Grand Canyon", "USA"], ["the Golden Gate Bridge", "USA"], ["Mount Rushmore", "USA"],
  ["Yellowstone", "USA"], ["Times Square", "USA"], ["the Hollywood Sign", "USA"], ["the Space Needle", "USA"], ["Alcatraz", "USA"],
  ["the CN Tower", "CAN"], ["Banff National Park", "CAN"], ["the Château Frontenac", "CAN"],
  ["Chichén Itzá", "MEX"], ["Teotihuacan", "MEX"], ["Tulum", "MEX"],
  ["Machu Picchu", "PER"], ["the Nazca Lines", "PER"], ["Christ the Redeemer", "BRA"], ["Sugarloaf Mountain", "BRA"],
  ["Copacabana Beach", "BRA"], ["Lençóis Maranhenses", "BRA"], ["Angel Falls", "VEN"], ["the Salar de Uyuni", "BOL"],
  ["the Galápagos Islands", "ECU"], ["Torres del Paine", "CHL"], ["the moai of Easter Island", "CHL"], ["the Atacama Desert", "CHL"],
  ["the Perito Moreno Glacier", "ARG"], ["the Panama Canal", "PAN"], ["Tikal", "GTM"], ["Old Havana", "CUB"],
  ["Caño Cristales", "COL"], ["Arenal Volcano", "CRI"], ["the Great Blue Hole", "BLZ"],
  ["the Sydney Opera House", "AUS"], ["Uluru", "AUS"], ["the Great Barrier Reef", "AUS"], ["the Twelve Apostles", "AUS"],
  ["Milford Sound", "NZL"], ["Hobbiton", "NZL"], ["the Rock Islands", "PLW"], ["Mount Yasur", "VUT"],
  ["the Pyramids of Giza", "EGY"], ["Mount Kilimanjaro", "TZA"], ["Table Mountain", "ZAF"], ["the Serengeti", "TZA"],
].map(([n, c]) => ({ n, c }));
