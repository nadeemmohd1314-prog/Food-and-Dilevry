import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database storage directory and file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Utility: Hash password securely with PBKDF2
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Seed authentic Uttar Pradesh food delivery database
function getInitialData() {
  const adminPassword = hashPassword('Daniyal');
  const managerPassword = hashPassword('Manager@123456');
  const financePassword = hashPassword('Finance@123456');

  return {
    users: [
      {
        id: 'admin_nadeem',
        email: 'nadeemmohd1314@gmail.com',
        name: 'Nadeem Mohd (Super Admin)',
        role: 'super_admin',
        passwordHash: adminPassword.hash,
        passwordSalt: adminPassword.salt,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'admin_2',
        email: 'manager@fooddilvry.in',
        name: 'UP Operations Lead',
        role: 'operations_manager',
        passwordHash: managerPassword.hash,
        passwordSalt: managerPassword.salt,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'admin_3',
        email: 'finance@fooddilvry.in',
        name: 'Accounts & Audit Officer',
        role: 'finance_support',
        passwordHash: financePassword.hash,
        passwordSalt: financePassword.salt,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: [] as Array<{ token: string; userId: string; expiresAt: number }>,
    restaurants: [
      {
        id: 'rest_lko_1',
        name: 'Royal Awadh Dastarkhwan',
        tagline: 'Legacy of Royal Nawabi Dum Biryani & Galouti Kebabs',
        description: 'Authentic slow-dum Awadhi cuisine prepared with traditional copper degs and secret 32-spice royal potli.',
        city: 'Lucknow',
        locality: 'Hazratganj & Gomti Nagar',
        cuisine: ['Awadhi', 'Biryani', 'Mughlai', 'Kebabs'],
        address: '14 MG Road, Near Janpath Market, Hazratganj, Lucknow, UP 226001',
        phone: '+91 94150 28912',
        email: 'orders@royalawadh.in',
        fssaiLicense: '12721001000456',
        rating: 4.8,
        ratingCount: 1420,
        deliveryTimeMins: '30-40',
        minOrderAmount: 250,
        commissionRate: 15,
        status: 'approved',
        isOpen: true,
        featured: true,
        pureVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        id: 'rest_vns_2',
        name: 'Kashi Chat & Lassi Bhandar',
        tagline: 'Legendary Banarasi Tamatar Chaat & Thick Kulhad Lassi',
        description: 'Varanasi iconic street savories since 1968. Famous for desi ghee tamatar chaat, palak patta chaat, and saffron malai rabri lassi.',
        city: 'Varanasi',
        locality: 'Godowlia Chowk & Dashashwamedh',
        cuisine: ['Chaat', 'Street Food', 'Sweets', 'Beverages'],
        address: 'D-37/49 Dashashwamedh Ghat Road, Godowlia, Varanasi, UP 221001',
        phone: '+91 98390 11452',
        email: 'kashichat@varanasi.in',
        fssaiLicense: '12718002000891',
        rating: 4.9,
        ratingCount: 2310,
        deliveryTimeMins: '20-30',
        minOrderAmount: 120,
        commissionRate: 14,
        status: 'approved',
        isOpen: true,
        featured: true,
        pureVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        id: 'rest_knp_3',
        name: 'Kanpur Thaggu Ke Laddu & Sweets',
        tagline: 'Aisa Koi Saga Nahi, Jise Humne Thaga Nahi!',
        description: 'Famous Kanpur confectionery known for pure mawa, gond, suji, and dry fruit laddus, accompanied by steaming hot badam milk.',
        city: 'Kanpur',
        locality: 'Birhana Road & Mall Road',
        cuisine: ['Mithai', 'Desserts', 'Snacks'],
        address: '56/21 Birhana Road, Near Phoolbagh, Kanpur, UP 208001',
        phone: '+91 94151 88721',
        email: 'thaggu@kanpurladdu.in',
        fssaiLicense: '12719003000623',
        rating: 4.7,
        ratingCount: 1890,
        deliveryTimeMins: '25-35',
        minOrderAmount: 200,
        commissionRate: 15,
        status: 'approved',
        isOpen: true,
        featured: true,
        pureVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'rest_agr_4',
        name: 'Pinch of Spice Mughlai Darbar',
        tagline: 'Gourmet North Indian Delicacies in the City of Taj',
        description: 'Fine-dining rich curries, fragrant saffron gravies, Dal Makhani slow-cooked for 24 hours, and crispy butter naans.',
        city: 'Agra',
        locality: 'Fatehabad Road & Taj Ganj',
        cuisine: ['North Indian', 'Mughlai', 'Tandoor'],
        address: '1076 Fatehabad Road, Taj Ganj, Agra, UP 282001',
        phone: '+91 98970 44219',
        email: 'info@pinchofspiceagra.in',
        fssaiLicense: '12720004000319',
        rating: 4.8,
        ratingCount: 1650,
        deliveryTimeMins: '35-45',
        minOrderAmount: 300,
        commissionRate: 18,
        status: 'approved',
        isOpen: true,
        featured: false,
        pureVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'rest_pry_5',
        name: 'Prayag Anand Bhawan Thali & Meals',
        tagline: 'Wholesome Desi Ghee Purvanchal Thalis & Bedmi Poori',
        description: 'Traditional satvik culinary heritage offering complete family thalis, crispy bedmi pooris with methi hing aloo sabzi, and gulab jamun.',
        city: 'Prayagraj',
        locality: 'Civil Lines & Katra',
        cuisine: ['North Indian', 'Thali', 'Pure Veg'],
        address: '22 Sardar Patel Marg, Civil Lines, Prayagraj, UP 211001',
        phone: '+91 93350 99812',
        email: 'prayagthali@meals.in',
        fssaiLicense: '12717005000188',
        rating: 4.6,
        ratingCount: 940,
        deliveryTimeMins: '25-35',
        minOrderAmount: 180,
        commissionRate: 14,
        status: 'approved',
        isOpen: true,
        featured: false,
        pureVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'rest_noi_6',
        name: 'Noida Boulevard Artisan Burgers & Shakes',
        tagline: 'Loaded Smashed Burgers & Thick Shakes',
        description: 'Modern artisanal burger joint catering to youth and tech corridors of Noida & Greater Noida.',
        city: 'Noida',
        locality: 'Sector 18 & Sector 62',
        cuisine: ['Burgers', 'Fast Food', 'Beverages'],
        address: 'Shop 12, Ground Floor, Sector 18 Wave Mall Arcade, Noida, UP 201301',
        phone: '+91 99990 12834',
        email: 'noidaburger@boulevard.in',
        fssaiLicense: '12722006000941',
        rating: 4.7,
        ratingCount: 1120,
        deliveryTimeMins: '25-35',
        minOrderAmount: 200,
        commissionRate: 16,
        status: 'approved',
        isOpen: true,
        featured: true,
        pureVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'rest_ali_7',
        name: 'Aligarh Royal Naan & Mughlai Hub',
        tagline: 'Tandoori Sheermal & Nihari (Registration Pending)',
        description: 'New partner registration awaiting municipal health inspection and food license verification by UP Food Safety Authority.',
        city: 'Aligarh',
        locality: 'Medical Road & Centre Point',
        cuisine: ['Mughlai', 'Tandoor'],
        address: '88 Medical Road, Dodhpur, Aligarh, UP 202001',
        phone: '+91 94120 77334',
        email: 'partner@aligarhnaan.in',
        fssaiLicense: 'FSSAI-INSPECTION-PENDING',
        rating: 0,
        ratingCount: 0,
        deliveryTimeMins: '30-40',
        minOrderAmount: 200,
        commissionRate: 18,
        status: 'pending',
        isOpen: false,
        featured: false,
        pureVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date().toISOString(),
      },
    ],
    menuItems: [
      {
        id: 'menu_1',
        restaurantId: 'rest_lko_1',
        restaurantName: 'Royal Awadh Dastarkhwan',
        name: 'Lucknowi Dum Mutton Biryani',
        hindiName: 'लखनवी दम मटन बिरयानी',
        description: 'Fragrant aged long-grain basmati rice layered with tender mutton infused with saffron, kewra, and Awadhi potli spices.',
        category: 'Biryani',
        price: 380,
        discountPrice: 340,
        dietary: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 20,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_2',
        restaurantId: 'rest_lko_1',
        restaurantName: 'Royal Awadh Dastarkhwan',
        name: 'Melt-in-Mouth Galouti Kebabs (4 Pcs)',
        hindiName: 'गलौटी कबाब (४ पीस)',
        description: 'Legendary melt-in-mouth smoked minced kebabs served with crispy Mughlai Ulte Tawe Ka Paratha and mint chutney.',
        category: 'Kebabs',
        price: 290,
        dietary: 'non-veg',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 15,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_3',
        restaurantId: 'rest_lko_1',
        restaurantName: 'Royal Awadh Dastarkhwan',
        name: 'Awadhi Shahi Paneer Korma',
        hindiName: 'शाही पनीर कोरमा',
        description: 'Fresh malai paneer simmered in a decadent cashew nut, melon seed, and cardamom rich velvety gravy.',
        category: 'North Indian',
        price: 260,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 15,
        isBestseller: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_4',
        restaurantId: 'rest_vns_2',
        restaurantName: 'Kashi Chat & Lassi Bhandar',
        name: 'Banarasi Tamatar Chaat',
        hindiName: 'बनारसी टमाटर चाट',
        description: 'Varanasi signature piping hot spiced tomato mash topped with crunchy namakpara, hing water, and roasted cumin syrup.',
        category: 'Chaat',
        price: 90,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 10,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_5',
        restaurantId: 'rest_vns_2',
        restaurantName: 'Kashi Chat & Lassi Bhandar',
        name: 'Crispy Palak Patta Chaat',
        hindiName: 'पालक पत्ता चाट',
        description: 'Crisp spinach leaves batter-fried in besan, smothered with sweet yogurt, tamarind saunth chutney, and pomegranate pearls.',
        category: 'Chaat',
        price: 110,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 10,
        isBestseller: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_6',
        restaurantId: 'rest_vns_2',
        restaurantName: 'Kashi Chat & Lassi Bhandar',
        name: 'Special Kesar Pista Malai Lassi (Clay Kulhad)',
        hindiName: 'केसर पिस्ता मलाई लस्सी',
        description: 'Thick hand-churned fresh curd topped with a thick dollop of malai, rabri, saffron strands, and roasted pistachios in an earthen kulhad.',
        category: 'Beverages',
        price: 80,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 5,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_7',
        restaurantId: 'rest_knp_3',
        restaurantName: 'Kanpur Thaggu Ke Laddu & Sweets',
        name: 'Special Mawa Suji Laddu (500g Box)',
        hindiName: 'स्पेशल मावा सूजी लड्डू (५०० ग्राम)',
        description: 'Authentic Kanpur Thaggu laddus prepared with roasted semolina, pure khoya, tragacanth gum (gond), and crushed almonds.',
        category: 'Mithai',
        price: 320,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 5,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_8',
        restaurantId: 'rest_agr_4',
        restaurantName: 'Pinch of Spice Mughlai Darbar',
        name: 'Slow-Cooked Dal Makhani & Garlic Naan Combo',
        hindiName: 'दाल मखनी एवं गार्लिक नान कॉम्बो',
        description: 'Black urad lentils simmered overnight on slow charcoal embers with white butter, cream, paired with two fluffy tandoori garlic naans.',
        category: 'North Indian',
        price: 280,
        discountPrice: 250,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 20,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_9',
        restaurantId: 'rest_pry_5',
        restaurantName: 'Prayag Anand Bhawan Thali & Meals',
        name: 'Special Purvanchal Royal Deluxe Thali',
        hindiName: 'पूर्वांचल रॉयल डीलक्स थाली',
        description: 'Includes Paneer Makhani, Dal Tadka, Aloo Dum, Jeera Rice, 3 Ghee Phulkas, Boondi Raita, Salad, Roasted Papad, and 2 Warm Gulab Jamuns.',
        category: 'Thali',
        price: 240,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 15,
        isBestseller: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_10',
        restaurantId: 'rest_noi_6',
        restaurantName: 'Noida Boulevard Artisan Burgers & Shakes',
        name: 'Crispy Paneer Tikka Burger with Peri-Peri Fries',
        hindiName: 'क्रिस्पी पनीर टिक्का बर्गर',
        description: 'Cottage cheese steak coated with spiced batter, mint mayo, fresh onion rings, and a side of hot peri-peri seasoned crinkle fries.',
        category: 'Burgers',
        price: 210,
        dietary: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        preparationTimeMins: 15,
        isBestseller: false,
        createdAt: new Date().toISOString(),
      },
    ],
    drivers: [
      {
        id: 'driver_1',
        name: 'Amitabh Shukla',
        phone: '+91 94520 18392',
        email: 'amitabh.s@riders.fooddilvry.in',
        city: 'Lucknow',
        vehicleType: 'bike',
        vehicleNumber: 'UP-32-BZ-4109',
        drivingLicense: 'UP322019004821',
        rating: 4.9,
        status: 'approved',
        availability: 'available',
        activeOrdersCount: 1,
        completedDeliveries: 420,
        todayEarnings: 680,
        joinedDate: '2025-06-15',
      },
      {
        id: 'driver_2',
        name: 'Mohd. Zeeshan',
        phone: '+91 98380 44910',
        email: 'zeeshan.m@riders.fooddilvry.in',
        city: 'Varanasi',
        vehicleType: 'scooter',
        vehicleNumber: 'UP-65-AK-9021',
        drivingLicense: 'UP652020001249',
        rating: 4.95,
        status: 'approved',
        availability: 'available',
        activeOrdersCount: 0,
        completedDeliveries: 560,
        todayEarnings: 820,
        joinedDate: '2025-04-10',
      },
      {
        id: 'driver_3',
        name: 'Rohan Verma',
        phone: '+91 91250 88231',
        email: 'rohan.v@riders.fooddilvry.in',
        city: 'Kanpur',
        vehicleType: 'electric_cycle',
        vehicleNumber: 'UP-78-EC-3312',
        drivingLicense: 'UP782021008431',
        rating: 4.8,
        status: 'approved',
        availability: 'busy',
        activeOrdersCount: 1,
        completedDeliveries: 280,
        todayEarnings: 450,
        joinedDate: '2025-10-01',
      },
      {
        id: 'driver_4',
        name: 'Pawan Kashyap (New Applicant)',
        phone: '+91 96960 33419',
        email: 'pawan.kashyap@gmail.com',
        city: 'Agra',
        vehicleType: 'bike',
        vehicleNumber: 'UP-80-CA-5510',
        drivingLicense: 'UP802024000318',
        rating: 0,
        status: 'pending',
        availability: 'offline',
        activeOrdersCount: 0,
        completedDeliveries: 0,
        todayEarnings: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      },
    ],
    coupons: [
      {
        id: 'cpn_1',
        code: 'UPFOOD50',
        description: '50% OFF up to ₹100 on orders above ₹199 across Uttar Pradesh',
        hindiDescription: 'उत्तर प्रदेश में ₹१९९ से अधिक के ऑर्डर पर ५०% (अधिकतम ₹१००) की छूट',
        discountType: 'percentage',
        discountValue: 50,
        minOrderValue: 199,
        maxDiscountAmount: 100,
        expiryDate: '2027-12-31',
        usageLimit: 2000,
        usedCount: 312,
        isActive: true,
      },
      {
        id: 'cpn_2',
        code: 'LUCKNOWTREAT',
        description: 'Flat ₹60 OFF on genuine Awadhi feasts above ₹350',
        hindiDescription: 'अवधी व्यंजनों पर ₹३५० से अधिक के ऑर्डर पर सीधे ₹६० की छूट',
        discountType: 'flat',
        discountValue: 60,
        minOrderValue: 350,
        expiryDate: '2027-12-31',
        usageLimit: 1000,
        usedCount: 184,
        isActive: true,
      },
      {
        id: 'cpn_3',
        code: 'FIRSTBITE',
        description: 'Special ₹40 welcome discount on your first food delivery',
        hindiDescription: 'आपके पहले ऑर्डर पर विशेष ₹४० का स्वागत डिस्काउंट',
        discountType: 'flat',
        discountValue: 40,
        minOrderValue: 150,
        expiryDate: '2027-12-31',
        usageLimit: 5000,
        usedCount: 420,
        isActive: true,
      },
    ],
    orders: [
      {
        id: 'ord_up_101',
        orderNumber: 'FD-UP-94101',
        restaurantId: 'rest_lko_1',
        restaurantName: 'Royal Awadh Dastarkhwan',
        city: 'Lucknow',
        customer: {
          name: 'Nadeem Khan',
          phone: '+91 94150 78201',
          email: 'nadeem.khan@example.com',
          city: 'Lucknow',
          deliveryAddress: 'Flat 302, Rohtas Presidential Towers, Vibhuti Khand, Gomti Nagar',
          addressType: 'Home',
          landmark: 'Opposite High Court Gate 3',
          deliveryNotes: 'Please ring bell and leave on the porch shoe rack.',
        },
        items: [
          { menuItemId: 'menu_1', name: 'Lucknowi Dum Mutton Biryani', price: 340, quantity: 2, dietary: 'non-veg' },
          { menuItemId: 'menu_2', name: 'Melt-in-Mouth Galouti Kebabs (4 Pcs)', price: 290, quantity: 1, dietary: 'non-veg' },
        ],
        subtotal: 970,
        deliveryFee: 0, // Free delivery above ₹299
        taxAmount: 48.50, // 5% GST
        packagingFee: 25,
        discountAmount: 100, // UPFOOD50
        totalAmount: 943.50,
        couponCode: 'UPFOOD50',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'out_for_delivery',
        deliveryOtp: '4892',
        assignedDriverId: 'driver_1',
        assignedDriverName: 'Amitabh Shukla',
        assignedDriverPhone: '+91 94520 18392',
        restaurantCommissionAmount: 145.50,
        platformNetEarnings: 119.00,
        driverEarnings: 45.00,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: 'ord_up_102',
        orderNumber: 'FD-UP-94102',
        restaurantId: 'rest_vns_2',
        restaurantName: 'Kashi Chat & Lassi Bhandar',
        city: 'Varanasi',
        customer: {
          name: 'Anjali Pandey',
          phone: '+91 98391 22910',
          email: 'anjali.p@example.com',
          city: 'Varanasi',
          deliveryAddress: 'House 14/B, Lanka BHU Main Road, Varanasi',
          addressType: 'Home',
          landmark: 'Near Lanka Malviya Statue',
          deliveryNotes: 'Extra sweet chutney for tamatar chaat please.',
        },
        items: [
          { menuItemId: 'menu_4', name: 'Banarasi Tamatar Chaat', price: 90, quantity: 2, dietary: 'veg' },
          { menuItemId: 'menu_6', name: 'Special Kesar Pista Malai Lassi (Clay Kulhad)', price: 80, quantity: 2, dietary: 'veg' },
        ],
        subtotal: 340,
        deliveryFee: 0,
        taxAmount: 17.00,
        packagingFee: 20,
        discountAmount: 40,
        totalAmount: 337.00,
        couponCode: 'FIRSTBITE',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'preparing',
        deliveryOtp: '7190',
        restaurantCommissionAmount: 47.60,
        platformNetEarnings: 44.60,
        driverEarnings: 40.00,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: 'ord_up_100',
        orderNumber: 'FD-UP-94098',
        restaurantId: 'rest_knp_3',
        restaurantName: 'Kanpur Thaggu Ke Laddu & Sweets',
        city: 'Kanpur',
        customer: {
          name: 'Vikramaditya Rathore',
          phone: '+91 94152 44109',
          city: 'Kanpur',
          deliveryAddress: 'Flat 6A, KDA Signature Greens, Vikas Nagar, Kanpur',
          addressType: 'Home',
        },
        items: [
          { menuItemId: 'menu_7', name: 'Special Mawa Suji Laddu (500g Box)', price: 320, quantity: 2, dietary: 'veg' },
        ],
        subtotal: 640,
        deliveryFee: 0,
        taxAmount: 32.00,
        packagingFee: 20,
        discountAmount: 60,
        totalAmount: 632.00,
        couponCode: 'LUCKNOWTREAT',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        deliveryOtp: '3318',
        assignedDriverId: 'driver_3',
        assignedDriverName: 'Rohan Verma',
        assignedDriverPhone: '+91 91250 88231',
        restaurantCommissionAmount: 96.00,
        platformNetEarnings: 88.00,
        driverEarnings: 40.00,
        rating: 5,
        reviewComment: 'Pure desi ghee taste! Delivered fresh in 22 minutes.',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
    refunds: [
      {
        id: 'ref_1',
        orderId: 'ord_up_99',
        orderNumber: 'FD-UP-94085',
        customerName: 'Shubham Tripathi',
        customerPhone: '+91 97920 11982',
        amount: 280,
        reason: 'Item was delivered cold and spilled during heavy rain transit in Hazratganj.',
        status: 'pending',
        requestedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        refundMethod: 'upi_reversal',
      },
      {
        id: 'ref_2',
        orderId: 'ord_up_90',
        orderNumber: 'FD-UP-94060',
        customerName: 'Meera Agrawal',
        customerPhone: '+91 98890 55432',
        amount: 240,
        reason: 'Incorrect sweets packed by mistake during peak Diwali rush.',
        status: 'approved',
        requestedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        processedAt: new Date(Date.now() - 16 * 3600000).toISOString(),
        adminNotes: 'Verified with restaurant dispatch ticket. Instant UPI refund initiated.',
        refundMethod: 'upi_reversal',
      },
    ],
    payouts: [
      {
        id: 'pay_1',
        restaurantId: 'rest_lko_1',
        restaurantName: 'Royal Awadh Dastarkhwan',
        periodStart: '2026-10-01',
        periodEnd: '2026-10-07',
        grossSales: 64200.00,
        commissionDeducted: 9630.00,
        netPayoutAmount: 54570.00,
        status: 'processed',
        processedAt: '2026-10-08T10:00:00.000Z',
        utrNumber: 'HDFC-UTR-90184421-LKO',
      },
      {
        id: 'pay_2',
        restaurantId: 'rest_vns_2',
        restaurantName: 'Kashi Chat & Lassi Bhandar',
        periodStart: '2026-10-01',
        periodEnd: '2026-10-07',
        grossSales: 41800.00,
        commissionDeducted: 5852.00,
        netPayoutAmount: 35948.00,
        status: 'processed',
        processedAt: '2026-10-08T11:30:00.000Z',
        utrNumber: 'SBIN-UTR-77192084-VNS',
      },
    ],
    settings: {
      enableCashOnDelivery: true,
      maxCodOrderValue: 2000, // ₹2000 max for safety against fake orders
      enableOnlinePayments: true,
      onlineGatewayMode: 'sandbox',
      activeGateway: 'razorpay',
      taxRatePercent: 5.0, // 5% GST on Restaurant Orders in India
      baseDeliveryFee: 30.0, // ₹30 base delivery charge
      freeDeliveryThreshold: 299.0, // Free delivery for orders above ₹299
      restaurantPackagingFee: 20.0, // ₹20 packaging fee
      defaultCommissionPercent: 15,
      driverPerDeliveryFee: 40.0,
    },
  };
}

// Read database
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    // Guarantee user requested super admin credentials: nadeemmohd1314@gmail.com / Daniyal
    const targetEmail = 'nadeemmohd1314@gmail.com';
    parsed.users = parsed.users || [];
    const existing = parsed.users.find((u: any) => u.email.toLowerCase() === targetEmail);
    if (!existing) {
      const adminPass = hashPassword('Daniyal');
      parsed.users.unshift({
        id: 'admin_nadeem',
        email: targetEmail,
        name: 'Nadeem Mohd (Super Admin)',
        role: 'super_admin',
        passwordHash: adminPass.hash,
        passwordSalt: adminPass.salt,
        active: true,
        createdAt: new Date().toISOString(),
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    } else {
      const isMatch = verifyPassword('Daniyal', existing.passwordHash, existing.passwordSalt);
      if (!isMatch || existing.role !== 'super_admin' || !existing.active) {
        const adminPass = hashPassword('Daniyal');
        existing.passwordHash = adminPass.hash;
        existing.passwordSalt = adminPass.salt;
        existing.active = true;
        existing.role = 'super_admin';
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    }

    return parsed;
  } catch (err) {
    console.error('Error parsing store.json, resetting with initial data', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

// Write database
function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: any;
}

function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const db = readDb();
  const session = db.sessions?.find((s: any) => s.token === token && s.expiresAt > Date.now());
  if (session) {
    const user = db.users.find((u: any) => u.id === session.userId && u.active);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !['super_admin', 'operations_manager', 'finance_support'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access forbidden: Admin authorization required.' });
  }
  next();
}

function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: Requires role ${allowedRoles.join(' or ')}. Current role is ${req.user?.role || 'unauthenticated'}.`,
      });
    }
    next();
  };
}

app.use(authenticate);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !user.active) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Create session token (expires in 7 days)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  db.sessions = (db.sessions || []).filter((s: any) => s.expiresAt > Date.now());
  db.sessions.push({ token, userId: user.id, expiresAt });

  user.lastLogin = new Date().toISOString();
  writeDb(db);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// Current User info
app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const db = readDb();
    db.sessions = (db.sessions || []).filter((s: any) => s.token !== token);
    writeDb(db);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Create/Register Admin account (Super Admin only OR Master Key)
app.post('/api/auth/register-admin', (req: AuthenticatedRequest, res: Response) => {
  const { email, password, name, role, bootstrapKey } = req.body;
  const db = readDb();

  const hasExistingAdmins = db.users && db.users.length > 0;
  if (hasExistingAdmins) {
    const isSuperAdmin = req.user && req.user.role === 'super_admin';
    const isMasterBootstrap = bootstrapKey && bootstrapKey === (process.env.SETUP_MASTER_KEY || 'AI_STUDIO_ADMIN_MASTER_KEY');
    if (!isSuperAdmin && !isMasterBootstrap) {
      return res.status(403).json({
        error: 'Forbidden: Only an authorized Super Admin can provision new admin accounts.',
      });
    }
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An admin user with this email already exists.' });
  }

  const targetRole = role && ['super_admin', 'operations_manager', 'finance_support'].includes(role)
    ? role
    : 'operations_manager';

  const { hash, salt } = hashPassword(password);
  const newUser = {
    id: `admin_${Date.now()}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    role: targetRole,
    passwordHash: hash,
    passwordSalt: salt,
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  return res.status(201).json({
    success: true,
    message: 'Admin account provisioned successfully.',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});

// Manage Admin list (Super Admin only)
app.get('/api/auth/admins', requireAdmin, requireRoles(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const admins = db.users.map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
  return res.json(admins);
});

// Update Admin role or active state
app.put('/api/auth/admins/:id', requireAdmin, requireRoles(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, active, name } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Admin user not found.' });
  }

  if (role && ['super_admin', 'operations_manager', 'finance_support'].includes(role)) {
    user.role = role;
  }
  if (typeof active === 'boolean') {
    user.active = active;
  }
  if (name) {
    user.name = name;
  }

  writeDb(db);
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  });
});

// ==========================================
// RESTAURANT ROUTES
// ==========================================

// Get restaurants (supports city filter, pureVeg filter, search)
app.get('/api/restaurants', (req: AuthenticatedRequest, res: Response) => {
  const { status, city, search, pureVeg } = req.query;
  const db = readDb();
  let list = db.restaurants || [];

  if (status !== 'all') {
    list = list.filter((r: any) => r.status === 'approved');
  }

  if (city && typeof city === 'string' && city !== 'All') {
    list = list.filter((r: any) => r.city?.toLowerCase() === city.toLowerCase());
  }

  if (pureVeg === 'true') {
    list = list.filter((r: any) => r.pureVeg === true);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((r: any) =>
      r.name.toLowerCase().includes(q) ||
      (r.cuisine && r.cuisine.some((c: string) => c.toLowerCase().includes(q))) ||
      r.city?.toLowerCase().includes(q) ||
      r.locality?.toLowerCase().includes(q)
    );
  }

  return res.json(list);
});

// Get single restaurant
app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const db = readDb();
  const restaurant = db.restaurants?.find((r: any) => r.id === req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }
  return res.json(restaurant);
});

// Partner Registration / Admin Create Restaurant
app.post('/api/restaurants', (req: Request, res: Response) => {
  const {
    name, tagline, description, city, locality, cuisine, address, phone, email,
    fssaiLicense, deliveryTimeMins, minOrderAmount, commissionRate, imageUrl, bannerUrl, isOpen, pureVeg, status
  } = req.body;

  if (!name || !address || !phone || !city) {
    return res.status(400).json({ error: 'Restaurant name, city, address, and phone are required.' });
  }

  const db = readDb();
  const newRestaurant = {
    id: `rest_${Date.now()}`,
    name,
    tagline: tagline || '',
    description: description || '',
    city: city || 'Lucknow',
    locality: locality || '',
    cuisine: Array.isArray(cuisine) ? cuisine : typeof cuisine === 'string' ? cuisine.split(',').map((s: string) => s.trim()) : ['North Indian'],
    address,
    phone,
    email: email || '',
    fssaiLicense: fssaiLicense || `FSSAI-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
    rating: 5.0,
    ratingCount: 1,
    deliveryTimeMins: deliveryTimeMins || '30-40',
    minOrderAmount: Number(minOrderAmount) || 200,
    commissionRate: Number(commissionRate) || db.settings.defaultCommissionPercent || 15,
    status: status || 'pending', // new partners start in pending review
    isOpen: typeof isOpen === 'boolean' ? isOpen : true,
    featured: false,
    pureVeg: Boolean(pureVeg),
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  };

  db.restaurants.unshift(newRestaurant);
  writeDb(db);

  return res.status(201).json(newRestaurant);
});

// Update Restaurant (Admin or Partner)
app.put('/api/restaurants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.restaurants.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  const updated = {
    ...db.restaurants[index],
    ...req.body,
    cuisine: Array.isArray(req.body.cuisine) ? req.body.cuisine : db.restaurants[index].cuisine,
    minOrderAmount: req.body.minOrderAmount !== undefined ? Number(req.body.minOrderAmount) : db.restaurants[index].minOrderAmount,
    commissionRate: req.body.commissionRate !== undefined ? Number(req.body.commissionRate) : db.restaurants[index].commissionRate,
  };

  db.restaurants[index] = updated;
  writeDb(db);

  return res.json(updated);
});

// Approve or Suspend Restaurant (Admin only)
app.patch('/api/restaurants/:id/status', requireAdmin, requireRoles(['super_admin', 'operations_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['approved', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be approved, pending, or suspended.' });
  }

  const db = readDb();
  const restaurant = db.restaurants.find((r: any) => r.id === id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  restaurant.status = status;
  if (status === 'suspended') {
    restaurant.isOpen = false;
  }
  writeDb(db);

  return res.json(restaurant);
});

// Delete Restaurant (Super Admin only)
app.delete('/api/restaurants/:id', requireAdmin, requireRoles(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.restaurants = db.restaurants.filter((r: any) => r.id !== id);
  db.menuItems = db.menuItems.filter((m: any) => m.restaurantId !== id);
  writeDb(db);
  return res.json({ success: true, message: 'Restaurant and related menu items removed.' });
});

// ==========================================
// FOOD & MENU ROUTES
// ==========================================

// Get Menu items
app.get('/api/menu', (req: Request, res: Response) => {
  const { restaurantId, category, dietary, search } = req.query;
  const db = readDb();
  let items = db.menuItems || [];

  if (restaurantId && typeof restaurantId === 'string') {
    items = items.filter((m: any) => m.restaurantId === restaurantId);
  }

  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter((m: any) => m.category.toLowerCase() === category.toLowerCase());
  }

  if (dietary && typeof dietary === 'string' && dietary !== 'all') {
    items = items.filter((m: any) => m.dietary === dietary);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter((m: any) =>
      m.name.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }

  return res.json(items);
});

// Create Menu item
app.post('/api/menu', (req: Request, res: Response) => {
  const { restaurantId, name, hindiName, description, category, price, discountPrice, dietary, imageUrl, isAvailable, preparationTimeMins, isBestseller } = req.body;

  if (!name || !price || !category || !restaurantId) {
    return res.status(400).json({ error: 'Restaurant, dish name, category, and price are required.' });
  }

  const db = readDb();
  const restaurant = db.restaurants.find((r: any) => r.id === restaurantId);
  if (!restaurant) {
    return res.status(404).json({ error: 'Selected restaurant does not exist.' });
  }

  const newItem = {
    id: `menu_${Date.now()}`,
    restaurantId,
    restaurantName: restaurant.name,
    name,
    hindiName: hindiName || '',
    description: description || '',
    category,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    dietary: dietary || 'veg',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
    preparationTimeMins: Number(preparationTimeMins) || 15,
    isBestseller: Boolean(isBestseller),
    createdAt: new Date().toISOString(),
  };

  db.menuItems.unshift(newItem);
  writeDb(db);

  return res.status(201).json(newItem);
});

// Update Menu item
app.put('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.menuItems.findIndex((m: any) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const current = db.menuItems[index];
  const updated = {
    ...current,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    discountPrice: req.body.discountPrice !== undefined ? (req.body.discountPrice ? Number(req.body.discountPrice) : undefined) : current.discountPrice,
    preparationTimeMins: req.body.preparationTimeMins !== undefined ? Number(req.body.preparationTimeMins) : current.preparationTimeMins,
  };

  db.menuItems[index] = updated;
  writeDb(db);

  return res.json(updated);
});

// Toggle Item In-Stock Availability
app.patch('/api/menu/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  const db = readDb();
  const item = db.menuItems.find((m: any) => m.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  item.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !item.isAvailable;
  writeDb(db);

  return res.json(item);
});

// Delete Menu item
app.delete('/api/menu/:id', requireAdmin, requireRoles(['super_admin', 'operations_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.menuItems = db.menuItems.filter((m: any) => m.id !== id);
  writeDb(db);
  return res.json({ success: true, message: 'Menu item deleted.' });
});

// ==========================================
// ORDER MANAGEMENT ROUTES
// ==========================================

// Get orders
app.get('/api/orders', (req: Request, res: Response) => {
  const { status, restaurantId, city, search, customerPhone } = req.query;
  const db = readDb();
  let list = db.orders || [];

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter((o: any) => o.orderStatus === status);
  }

  if (restaurantId && typeof restaurantId === 'string' && restaurantId !== 'all') {
    list = list.filter((o: any) => o.restaurantId === restaurantId);
  }

  if (city && typeof city === 'string' && city !== 'All') {
    list = list.filter((o: any) => o.city?.toLowerCase() === city.toLowerCase());
  }

  if (customerPhone && typeof customerPhone === 'string') {
    list = list.filter((o: any) => o.customer.phone === customerPhone);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((o: any) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.restaurantName.toLowerCase().includes(q)
    );
  }

  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json(list);
});

// Place customer order
app.post('/api/orders', (req: Request, res: Response) => {
  const {
    restaurantId, customer, items, paymentMethod, couponCode, deliveryNotes
  } = req.body;

  if (!restaurantId || !customer || !items || !items.length) {
    return res.status(400).json({ error: 'Incomplete order details. Items and delivery details are required.' });
  }

  if (!customer.name || !customer.phone || !customer.deliveryAddress) {
    return res.status(400).json({ error: 'Customer name, mobile number, and delivery address are required.' });
  }

  const db = readDb();
  const restaurant = db.restaurants.find((r: any) => r.id === restaurantId);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  if (!restaurant.isOpen || restaurant.status !== 'approved') {
    return res.status(400).json({ error: 'This restaurant is currently closed or not taking orders.' });
  }

  const settings = db.settings;
  if (paymentMethod === 'cod' && !settings.enableCashOnDelivery) {
    return res.status(400).json({ error: 'Cash on Delivery (COD) is temporarily disabled.' });
  }

  // Calculate items subtotal from server database
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const requestedItem of items) {
    const dbItem = db.menuItems.find((m: any) => m.id === requestedItem.menuItemId);
    if (!dbItem || !dbItem.isAvailable) {
      return res.status(400).json({
        error: `Dish "${requestedItem.name || 'Selected item'}" is currently unavailable or out of stock.`,
      });
    }
    const unitPrice = dbItem.discountPrice || dbItem.price;
    const qty = Math.max(1, Number(requestedItem.quantity) || 1);
    subtotal += unitPrice * qty;

    verifiedItems.push({
      menuItemId: dbItem.id,
      name: dbItem.name,
      price: unitPrice,
      quantity: qty,
      dietary: dbItem.dietary,
      specialInstructions: requestedItem.specialInstructions || '',
    });
  }

  // Minimum order amount
  if (subtotal < restaurant.minOrderAmount) {
    return res.status(400).json({
      error: `Minimum order amount for ${restaurant.name} is ₹${restaurant.minOrderAmount}. Current subtotal is ₹${subtotal}.`,
    });
  }

  // Handle coupon
  let discountAmount = 0;
  let validatedCouponCode: string | undefined = undefined;

  if (couponCode && typeof couponCode === 'string') {
    const coupon = db.coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (coupon) {
      if (subtotal >= coupon.minOrderValue && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        if (coupon.discountType === 'percentage') {
          let discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
          discountAmount = discount;
        } else {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        validatedCouponCode = coupon.code;
      }
    }
  }

  // Delivery fee, packaging, GST
  const deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.baseDeliveryFee;
  const packagingFee = settings.restaurantPackagingFee || 20;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * settings.taxRatePercent) / 100).toFixed(2));
  const totalAmount = Number((taxableAmount + deliveryFee + packagingFee + taxAmount).toFixed(2));

  // Max COD check
  if (paymentMethod === 'cod' && totalAmount > settings.maxCodOrderValue) {
    return res.status(400).json({
      error: `Cash on Delivery is limited to orders up to ₹${settings.maxCodOrderValue} for safety. Please choose UPI or Online payment.`,
    });
  }

  // Generate 4-digit secure delivery OTP for rider proof of delivery
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  // Commission calculation
  const commissionRate = restaurant.commissionRate || settings.defaultCommissionPercent || 15;
  const restaurantCommissionAmount = Number(((subtotal * commissionRate) / 100).toFixed(2));
  const driverEarnings = settings.driverPerDeliveryFee || 40;
  const platformNetEarnings = Number((restaurantCommissionAmount + deliveryFee + taxAmount + packagingFee - discountAmount - driverEarnings).toFixed(2));

  const orderNumber = `FD-UP-${Math.floor(10000 + Math.random() * 90000)}`;
  const newOrder = {
    id: `ord_${Date.now()}`,
    orderNumber,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    city: customer.city || restaurant.city || 'Lucknow',
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email || '',
      city: customer.city || restaurant.city || 'Lucknow',
      deliveryAddress: customer.deliveryAddress.trim(),
      addressType: customer.addressType || 'Home',
      landmark: customer.landmark || '',
      deliveryNotes: deliveryNotes || customer.deliveryNotes || '',
    },
    items: verifiedItems,
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    packagingFee,
    taxAmount,
    discountAmount: Number(discountAmount.toFixed(2)),
    totalAmount,
    couponCode: validatedCouponCode,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    orderStatus: 'pending',
    deliveryOtp,
    restaurantCommissionAmount,
    platformNetEarnings,
    driverEarnings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  writeDb(db);

  return res.status(201).json(newOrder);
});

// Update Order Status (Admin / Restaurant / Rider)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { orderStatus, cancellationReason, paymentStatus } = req.body;

  const validStatuses = ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ error: 'Invalid order status transition.' });
  }

  const db = readDb();
  const order = db.orders.find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.orderStatus = orderStatus;
  order.updatedAt = new Date().toISOString();

  if (cancellationReason) {
    order.cancellationReason = cancellationReason;
  }

  if (orderStatus === 'delivered') {
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
  } else if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  // Update driver workload if completed
  if (orderStatus === 'delivered' && order.assignedDriverId) {
    const driver = db.drivers.find((d: any) => d.id === order.assignedDriverId);
    if (driver) {
      driver.activeOrdersCount = Math.max(0, (driver.activeOrdersCount || 1) - 1);
      driver.completedDeliveries = (driver.completedDeliveries || 0) + 1;
      driver.todayEarnings = (driver.todayEarnings || 0) + (order.driverEarnings || 40);
      driver.availability = driver.activeOrdersCount === 0 ? 'available' : 'busy';
    }
  }

  writeDb(db);
  return res.json(order);
});

// Rider Action: Accept, Pick Up, Verify OTP and Deliver
app.patch('/api/orders/:id/rider-action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, driverId, otp } = req.body;

  const db = readDb();
  const order = db.orders.find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (action === 'accept_order') {
    const driver = db.drivers.find((d: any) => d.id === driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }
    order.assignedDriverId = driver.id;
    order.assignedDriverName = driver.name;
    order.assignedDriverPhone = driver.phone;
    order.orderStatus = 'preparing';
    driver.activeOrdersCount = (driver.activeOrdersCount || 0) + 1;
    driver.availability = 'busy';
  } else if (action === 'picked_up') {
    order.orderStatus = 'out_for_delivery';
  } else if (action === 'verify_otp_deliver') {
    if (!otp || String(otp).trim() !== String(order.deliveryOtp)) {
      return res.status(400).json({ error: 'Invalid Delivery OTP! Ask customer to show the 4-digit code in their app.' });
    }
    order.orderStatus = 'delivered';
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    if (order.assignedDriverId) {
      const driver = db.drivers.find((d: any) => d.id === order.assignedDriverId);
      if (driver) {
        driver.activeOrdersCount = Math.max(0, (driver.activeOrdersCount || 1) - 1);
        driver.completedDeliveries = (driver.completedDeliveries || 0) + 1;
        driver.todayEarnings = (driver.todayEarnings || 0) + (order.driverEarnings || 40);
        driver.availability = driver.activeOrdersCount === 0 ? 'available' : 'busy';
      }
    }
  }

  order.updatedAt = new Date().toISOString();
  writeDb(db);
  return res.json(order);
});

// Assign Driver (Admin only)
app.patch('/api/orders/:id/assign-driver', requireAdmin, requireRoles(['super_admin', 'operations_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { driverId } = req.body;

  const db = readDb();
  const order = db.orders.find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (!driverId) {
    order.assignedDriverId = undefined;
    order.assignedDriverName = undefined;
    order.assignedDriverPhone = undefined;
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return res.json(order);
  }

  const driver = db.drivers.find((d: any) => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Delivery partner not found.' });
  }

  if (driver.status !== 'approved') {
    return res.status(400).json({ error: 'Cannot assign delivery to an unapproved or suspended driver.' });
  }

  order.assignedDriverId = driver.id;
  order.assignedDriverName = driver.name;
  order.assignedDriverPhone = driver.phone;
  order.updatedAt = new Date().toISOString();

  driver.activeOrdersCount = (driver.activeOrdersCount || 0) + 1;
  driver.availability = 'busy';

  if (order.orderStatus === 'pending' || order.orderStatus === 'accepted') {
    order.orderStatus = 'preparing';
  }

  writeDb(db);
  return res.json(order);
});

// Customer Rate Order
app.post('/api/orders/:id/rate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, reviewComment } = req.body;

  const db = readDb();
  const order = db.orders.find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.rating = Math.max(1, Math.min(5, Number(rating) || 5));
  if (reviewComment) {
    order.reviewComment = reviewComment.trim();
  }

  // Update restaurant rating average
  const restaurant = db.restaurants.find((r: any) => r.id === order.restaurantId);
  if (restaurant) {
    const currentTotal = restaurant.rating * restaurant.ratingCount;
    restaurant.ratingCount = (restaurant.ratingCount || 0) + 1;
    restaurant.rating = Number(((currentTotal + order.rating) / restaurant.ratingCount).toFixed(1));
  }

  writeDb(db);
  return res.json({ success: true, order });
});

// ==========================================
// DELIVERY FLEET ROUTES
// ==========================================

app.get('/api/drivers', (req: Request, res: Response) => {
  const { city } = req.query;
  const db = readDb();
  let list = db.drivers || [];
  if (city && typeof city === 'string' && city !== 'All') {
    list = list.filter((d: any) => d.city?.toLowerCase() === city.toLowerCase());
  }
  return res.json(list);
});

app.post('/api/drivers', (req: Request, res: Response) => {
  const { name, phone, email, city, vehicleType, vehicleNumber, drivingLicense } = req.body;
  if (!name || !phone || !vehicleNumber || !drivingLicense) {
    return res.status(400).json({ error: 'Name, phone, vehicle number, and driving license number are required.' });
  }

  const db = readDb();
  const newDriver = {
    id: `driver_${Date.now()}`,
    name,
    phone,
    email: email || '',
    city: city || 'Lucknow',
    vehicleType: vehicleType || 'bike',
    vehicleNumber,
    drivingLicense,
    rating: 5.0,
    status: 'pending',
    availability: 'offline',
    activeOrdersCount: 0,
    completedDeliveries: 0,
    todayEarnings: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  };

  db.drivers.unshift(newDriver);
  writeDb(db);

  return res.status(201).json(newDriver);
});

app.patch('/api/drivers/:id/status', requireAdmin, requireRoles(['super_admin', 'operations_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, availability } = req.body;

  const db = readDb();
  const driver = db.drivers.find((d: any) => d.id === id);
  if (!driver) {
    return res.status(404).json({ error: 'Delivery partner not found.' });
  }

  if (status && ['approved', 'pending', 'suspended'].includes(status)) {
    driver.status = status;
    if (status === 'suspended') {
      driver.availability = 'offline';
    }
  }

  if (availability && ['available', 'busy', 'offline'].includes(availability)) {
    driver.availability = availability;
  }

  writeDb(db);
  return res.json(driver);
});

app.put('/api/drivers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.drivers.findIndex((d: any) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Driver not found.' });
  }

  db.drivers[index] = { ...db.drivers[index], ...req.body };
  writeDb(db);
  return res.json(db.drivers[index]);
});

// ==========================================
// COUPON ROUTES
// ==========================================

app.get('/api/coupons', (req: Request, res: Response) => {
  const db = readDb();
  return res.json(db.coupons || []);
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  const db = readDb();
  const coupon = db.coupons.find((c: any) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon promo code.' });
  }

  const total = Number(cartTotal) || 0;
  if (total < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Coupon "${coupon.code}" requires minimum order of ₹${coupon.minOrderValue}.`,
    });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Coupon redemption limit reached.' });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (total * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = Math.min(coupon.discountValue, total);
  }

  return res.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discountAmount: Number(discount.toFixed(2)),
  });
});

app.post('/api/coupons', requireAdmin, requireRoles(['super_admin', 'operations_manager']), (req: AuthenticatedRequest, res: Response) => {
  const { code, description, hindiDescription, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Coupon code and discount value are required.' });
  }

  const db = readDb();
  const existing = db.coupons.find((c: any) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (existing) {
    return res.status(409).json({ error: 'Coupon with this code already exists.' });
  }

  const newCoupon = {
    id: `cpn_${Date.now()}`,
    code: code.trim().toUpperCase(),
    description: description || '',
    hindiDescription: hindiDescription || '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue) || 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
    expiryDate: expiryDate || '2027-12-31',
    usageLimit: Number(usageLimit) || 1000,
    usedCount: 0,
    isActive: true,
  };

  db.coupons.unshift(newCoupon);
  writeDb(db);

  return res.status(201).json(newCoupon);
});

app.patch('/api/coupons/:id/toggle', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const coupon = db.coupons.find((c: any) => c.id === id);
  if (!coupon) {
    return res.status(404).json({ error: 'Coupon not found.' });
  }
  coupon.isActive = !coupon.isActive;
  writeDb(db);
  return res.json(coupon);
});

app.delete('/api/coupons/:id', requireAdmin, requireRoles(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  db.coupons = db.coupons.filter((c: any) => c.id !== id);
  writeDb(db);
  return res.json({ success: true, message: 'Coupon deleted.' });
});

// ==========================================
// FINANCE & BUSINESS REPORTS
// ==========================================

app.get('/api/finance/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const orders = db.orders || [];
  const restaurants = db.restaurants || [];
  const drivers = db.drivers || [];

  const completedOrders = orders.filter((o: any) => o.orderStatus === 'delivered');
  const pendingOrders = orders.filter((o: any) => ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.orderStatus));
  const cancelledOrders = orders.filter((o: any) => o.orderStatus === 'cancelled');

  const totalGrossSales = orders.reduce((sum: number, o: any) => o.orderStatus !== 'cancelled' ? sum + (o.totalAmount || 0) : sum, 0);
  const totalCommissionEarned = orders.reduce((sum: number, o: any) => o.orderStatus !== 'cancelled' ? sum + (o.restaurantCommissionAmount || 0) : sum, 0);
  const totalPlatformEarnings = orders.reduce((sum: number, o: any) => o.orderStatus !== 'cancelled' ? sum + (o.platformNetEarnings || 0) : sum, 0);

  // COD vs UPI split
  const codTotal = orders.filter((o: any) => o.paymentMethod === 'cod' && o.orderStatus !== 'cancelled').reduce((s: number, o: any) => s + o.totalAmount, 0);
  const upiTotal = orders.filter((o: any) => o.paymentMethod !== 'cod' && o.orderStatus !== 'cancelled').reduce((s: number, o: any) => s + o.totalAmount, 0);

  // Restaurant commission breakdown
  const restaurantEarnings = restaurants.map((r: any) => {
    const rOrders = orders.filter((o: any) => o.restaurantId === r.id && o.orderStatus !== 'cancelled');
    const gross = rOrders.reduce((sum: number, o: any) => sum + (o.subtotal || 0), 0);
    const comm = rOrders.reduce((sum: number, o: any) => sum + (o.restaurantCommissionAmount || 0), 0);
    const payable = gross - comm;
    return {
      restaurantId: r.id,
      restaurantName: r.name,
      city: r.city,
      commissionRate: r.commissionRate,
      orderCount: rOrders.length,
      grossSales: Number(gross.toFixed(2)),
      commissionDeducted: Number(comm.toFixed(2)),
      payableToRestaurant: Number(payable.toFixed(2)),
    };
  });

  return res.json({
    kpis: {
      totalOrders: orders.length,
      completedOrdersCount: completedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      activeRestaurantsCount: restaurants.filter((r: any) => r.status === 'approved').length,
      activeDriversCount: drivers.filter((d: any) => d.status === 'approved').length,
      totalGrossSales: Number(totalGrossSales.toFixed(2)),
      totalCommissionEarned: Number(totalCommissionEarned.toFixed(2)),
      totalPlatformEarnings: Number(totalPlatformEarnings.toFixed(2)),
      codVolume: Number(codTotal.toFixed(2)),
      upiVolume: Number(upiTotal.toFixed(2)),
    },
    restaurantEarnings,
    payoutHistory: db.payouts || [],
  });
});

app.post('/api/finance/payouts', requireAdmin, requireRoles(['super_admin', 'finance_support']), (req: AuthenticatedRequest, res: Response) => {
  const { restaurantId, grossSales, commissionDeducted, netPayoutAmount, periodStart, periodEnd } = req.body;

  const db = readDb();
  const restaurant = db.restaurants.find((r: any) => r.id === restaurantId);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  const newPayout = {
    id: `pay_${Date.now()}`,
    restaurantId,
    restaurantName: restaurant.name,
    periodStart: periodStart || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    periodEnd: periodEnd || new Date().toISOString().split('T')[0],
    grossSales: Number(grossSales),
    commissionDeducted: Number(commissionDeducted),
    netPayoutAmount: Number(netPayoutAmount),
    status: 'processed',
    processedAt: new Date().toISOString(),
    utrNumber: `NEFT-UTR-${Math.floor(10000000 + Math.random() * 90000000)}-UP`,
  };

  db.payouts = db.payouts || [];
  db.payouts.unshift(newPayout);
  writeDb(db);

  return res.status(201).json(newPayout);
});

// ==========================================
// REFUNDS
// ==========================================

app.get('/api/refunds', (req: Request, res: Response) => {
  const db = readDb();
  return res.json(db.refunds || []);
});

app.post('/api/refunds', (req: Request, res: Response) => {
  const { orderId, reason, amount } = req.body;
  if (!orderId || !reason) {
    return res.status(400).json({ error: 'Order ID and refund reason are required.' });
  }

  const db = readDb();
  const order = db.orders.find((o: any) => o.id === orderId || o.orderNumber === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const refundAmt = amount ? Math.min(Number(amount), order.totalAmount) : order.totalAmount;

  const newRefund = {
    id: `ref_${Date.now()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    amount: Number(refundAmt.toFixed(2)),
    reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    refundMethod: 'upi_reversal',
  };

  db.refunds = db.refunds || [];
  db.refunds.unshift(newRefund);
  writeDb(db);

  return res.status(201).json(newRefund);
});

app.patch('/api/refunds/:id/action', requireAdmin, requireRoles(['super_admin', 'finance_support']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, adminNotes } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve or reject.' });
  }

  const db = readDb();
  const refund = db.refunds.find((r: any) => r.id === id);
  if (!refund) {
    return res.status(404).json({ error: 'Refund record not found.' });
  }

  refund.status = action === 'approve' ? 'approved' : 'rejected';
  refund.processedAt = new Date().toISOString();
  refund.adminNotes = adminNotes || (action === 'approve' ? 'Approved and UPI reversal triggered.' : 'Rejected after audit.');

  if (action === 'approve') {
    const order = db.orders.find((o: any) => o.id === refund.orderId);
    if (order) {
      order.paymentStatus = 'refunded';
    }
  }

  writeDb(db);
  return res.json(refund);
});

// ==========================================
// SETTINGS
// ==========================================

app.get('/api/settings', (req: Request, res: Response) => {
  const db = readDb();
  return res.json(db.settings);
});

app.put('/api/settings', requireAdmin, requireRoles(['super_admin']), (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...req.body,
    maxCodOrderValue: Number(req.body.maxCodOrderValue) || db.settings.maxCodOrderValue,
    taxRatePercent: Number(req.body.taxRatePercent) || db.settings.taxRatePercent,
    baseDeliveryFee: Number(req.body.baseDeliveryFee) || db.settings.baseDeliveryFee,
    freeDeliveryThreshold: Number(req.body.freeDeliveryThreshold) || db.settings.freeDeliveryThreshold,
    restaurantPackagingFee: Number(req.body.restaurantPackagingFee) || db.settings.restaurantPackagingFee,
    defaultCommissionPercent: Number(req.body.defaultCommissionPercent) || db.settings.defaultCommissionPercent,
  };

  writeDb(db);
  return res.json(db.settings);
});

// Image upload
app.post('/api/upload', (req: Request, res: Response) => {
  const { dataUrl } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'Image data URL is required.' });
  }

  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return res.json({ url: dataUrl });
  }

  const uploadDir = path.join(DATA_DIR, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data.' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const safeFilename = `up_food_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${cleanExt}`;
    const filePath = path.join(uploadDir, safeFilename);

    fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
    return res.json({ url: `/api/uploads/${safeFilename}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process image upload.' });
  }
});

app.use('/api/uploads', express.static(path.join(DATA_DIR, 'uploads')));

// System info
app.get('/api/system/status', (req: Request, res: Response) => {
  const db = readDb();
  return res.json({
    status: 'online',
    platform: 'Food and dilvry - Uttar Pradesh',
    timestamp: new Date().toISOString(),
    databaseType: 'JSON_PERSISTENT_STORE',
    firebaseReady: true,
    supportedCities: ['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad', 'Bareilly', 'Gorakhpur', 'Aligarh'],
    totalRestaurants: db.restaurants?.length || 0,
    totalMenuItems: db.menuItems?.length || 0,
    totalOrders: db.orders?.length || 0,
    totalDrivers: db.drivers?.length || 0,
    configuredAdmins: db.users?.length || 0,
  });
});

// ==========================================
// VITE DEV SERVER & STATIC MOUNTING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Food and dilvry platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
