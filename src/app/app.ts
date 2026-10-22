import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { HeadBar } from './components/head-bar/head-bar';
import { SearchBar } from './components/search-bar/search-bar';
import { Auto } from './interfaces/auto';
@Component({
  imports: [RouterOutlet, HeadBar, SearchBar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
}) 
export class App implements OnInit {
  title = 'My showroom'

  // Angular gives us the HttpClient tool automatically (dependency injection)
  constructor(private http: HttpClient) {}

  // runs once at startup: download the scraped cars and add them to our list
  ngOnInit() {
    this.http.get<Auto[]>('cars.json').subscribe({
      next: (scrapedCars) => {
        // new array = old 16 cars + scraped cars (a NEW array tells the child something changed)
        this.autoList = [...this.autoList, ...scrapedCars]
      },
      error: (err) => console.log('cars.json not loaded, keeping the 16 default cars', err)
    })
  }
  selectedCar?:Auto
  selectCar(auto:Auto){
    this.selectedCar = auto
  }
  autoList:Auto[]=[
    {     
      id:1,
      brand: "Mercedes Benz",
      model: "C-CLASS",
      price: 230,
      power: 9,
      photo: "CLASS-C.webp",
      availability  :4,
      description:"The Mercedes-Benz C-Class is a line of luxury compact executive cars, known for blending sporty exterior styling with a sophisticated, high-tech interior. It features advanced technology like a digital cockpit, and many models include a mild hybrid system for efficiency and boost. "
    },
    {
      id:2,
      brand: "Mercedes Benz",
      model: "GLA",
      price: 203,
      power: 8,
      photo: "GLA.webp",
      availability  :4,
      description:"The Mercedes-Benz GLA is a compact luxury SUV, based on the A-Class platform, available with petrol and diesel engines, in front-wheel drive or all-wheel drive (4MATIC). It is characterized by modern technologies, innovative driver assistance systems, an enhanced design and high level of comfort, making it the smallest SUV in the brand's lineup."
    },
    {
      id:3,
      brand: "Mercedes Benz",
      model: "GLE",
      price: 450,
      power: 17,
      photo: "GLE.webp",
      availability  :4,
      description:"The Mercedes-Benz GLE is a luxury SUV known for its combination of sportiness and luxurious comfort, available in several versions, including hybrid models and high-performance 'Mercedes-AMG' versions. The range includes models such as the 'Urban Edition', 'Hybrid Drive', 'AMG Line', 'Mercedes-AMG 53 4MATIC+', and 'Mercedes-AMG 63 S 4MATIC+'. The vehicle is distinguished by its spacious and luxurious interior, intelligent technology, and driver-focused design."
    },
    {
      id:4,
      brand: "Jaguar",
      model: "F-Pace",
      price: 399,
      power: 16,
      photo: "FPACE.webp",
      availability  :4,
      description:"The Jaguar F-PACE is a luxury SUV that blends performance and design, featuring a refreshed exterior including new headlights, a redesigned grille, and more dynamic exterior finishes. The interior has been reimagined to be luxurious and spacious, equipped with the Pivi Pro infotainment system with a large 11.4-inch touchscreen, premium materials, and a selection of seats and colors."
    },
    {
      id:5,
      brand: "Jaguar",
      model: "E-PACE",
      price: 350,
      power: 12,
      photo: "EPACE.webp",
      availability  :4,
      description:"The Jaguar E-PACE is a compact luxury SUV that combines sporty design with modern technology. It features a driver-focused interior, an 11.4-inch infotainment screen, plug-in hybrid powertrains, and personalization options such as the R-Dynamic trim. The driving experience is agile, with all-wheel-drive options and a suspension designed to balance performance and comfort."
    },
    {
      id:6,
      brand: "Audi",
      model: "Q3 CROSSBACK",
      price: 230,
      power: 9,
      photo: "Q3.webp",
      availability  :3,
      description:"The Audi Q3 Sportback is a compact SUV with a coupé-like design that combines sporty style and versatility. It stands out with its dynamic silhouette, modern and technologically advanced interior, as well as its spacious cabin and modular trunk. It offers a wide range of powertrains, including plug-in hybrid TFSIe versions."
    },
    {
      id:7,
      brand: "Audi",
      model: "Q5",
      price: 350,
      power: 16,
      photo: "Q5.webp",
      availability :3,
      description:"The Audi Q5 is a luxury SUV that combines performance, technology, and comfort. It features a turbocharged engine, quattro all-wheel drive, and several powertrain options, including mild-hybrid diesel and gasoline versions. Its exterior design is characterized by a distinctive grille, flowing lines, and modern LED headlights, while the interior boasts a large touchscreen and comfortable seats."
    },
    {
      id:8,
      brand: "Audi",
      model: "A3 SPORTBACK",
      price: 145,
      power: 8,
      photo: "A3.webp",
      availability :3,
      description:"The Audi A3 Sportback is a compact car distinguished by its sporty design and modern technology. It offers a versatile interior, a modular trunk, and a range of high-performance engines, both internal combustion and plug-in hybrid. Features include options such as the virtual cockpit and various trim levels, including the S line, which accentuates its athletic look."
    },
    {
      id:9,
      brand: "BMW",
      model: "X2 SDRIVE PACK",
      price: 245,
      power: 8,
      photo: "X2.webp",
      availability :3,
      description:"The BMW X2 sDrive pack describes a front-wheel-drive model that typically includes a Sporty M Sport design and is often paired with a 'Tech/Pro Pack'. Key features common to sDrive models with the Tech/Pro pack include an M Sport brake system, M Adaptive Suspension, and features for convenience and technology like Adaptive LED Headlights, Parking Assistant, and Heated Sport Seats. The 'sDrive' designation indicates two-wheel drive, in contrast to the all-wheel-drive 'xDrive' models."
    },
    {
      id:10,
      brand: "BMW",
      model: "IX",
      price: 432,
      power: 11,
      photo: "IX.webp",
      availability :3,
      description:"The BMW iX is a fully electric luxury SUV characterized by its futuristic design, minimalist yet spacious interior, and advanced technology. It offers a long electric range, semi-autonomous driving (up to level 3 on certain models), and exceptional comfort thanks to its features and driver assistance systems. Options include performance packages such as the M Sport package for enhanced aesthetics and performance."
    },
    {
      id:11,
      brand: "BMW",
      model: "X3 HYBRIDE",
      price: 355,
      power: 11,
      photo: "X3.webp",
      availability :3,
      description:"The BMW X3 plug-in hybrid is a family SUV combining a 2.0L gasoline engine with an electric motor, delivering a combined output of approximately 299 horsepower and an electric range of up to 90 km. It is characterized by its performance (0 to 100 km/h in approximately 6.1 seconds), its luxurious interior featuring advanced technologies such as the BMW Curved Display, and low fuel consumption, although this increases once the battery is depleted. Its 19.7 kWh battery can be recharged in approximately 2 hours and 15 minutes using an 11 kW AC charging station."
    },
    {
      id:12,
      brand: "Land Rover",
      model: "Range Rover Evoque",
      price: 340,
      power: 9,
      photo: "EVOQUE.webp",
      availability  :4,
      description:"The Range Rover Evoque is a compact luxury SUV distinguished by its modern design, clean lines inspired by Range Rover DNA (floating roof, continuous beltline), and sophisticated interior. It combines an elegant exterior with premium features, such as Pixel LED headlights, large wheels, and high-quality materials like Windsor leather. In terms of performance, it offers plug-in hybrid (PHEV) powertrains with an electric range of up to 61 km."
    },
    {
      id:13,
      brand: "Land Rover",
      model: "Defender 90",
      price: 398,
      power: 21,
      photo: "DEFENDER.webp",
      availability  :4,
      description:"The Land Rover Defender 90 is a compact off-road vehicle, renowned for its iconic design, small proportions, and off-road capabilities. It combines a modern and comfortable interior with robust features such as impressive ground clearance and optional equipment like an electric winch. Powerful versions like the Defender 90 V8, with a 525 hp petrol engine, can accelerate from 0 to 100 km/h in 5.2 seconds."
    },
    {
      id:14,
      brand: "Land Rover",
      model: "Range Rover",
      price: 702,
      power: 24,
      photo: "RANGE.webp",
      availability  :4,
      description:"The Land Rover Range Rover is a luxury crossover SUV known for its combination of luxury, performance, and off-road capability. It features sophisticated design with iconic lines, a refined interior, and advanced technology. Available in various configurations including short and long wheelbases, different engine options (including V8, mild-hybrid, and plug-in hybrid), the Range Rover is designed to be both a capable all-terrain vehicle and a high-end family vehicle."
    },
    {
      id:15,
      brand: "Alfa Romeo",
      model: "Stelvio",
      price: 268,
      power: 18,
      photo: "STELVIO.webp",
      availability  :11,
      description:"The Alfa Romeo Stelvio is a sporty and elegant SUV, characterized by its distinctive Italian design, dynamic performance, and optimal weight distribution. It is available with a range of gasoline and diesel engines, with power outputs from 150 hp for the entry-level model to over 500 hp for the Quadrifoglio version, and is equipped with advanced driver assistance systems, such as Level 2 autonomous driving. Its interior combines comfort and sportiness, with premium finishes and a large 525-liter trunk."
    },
    {
      id:16,
      brand: "Alfa Romeo",
      model: "Giulia",
      price: 198,
      power: 18,
      photo: "GIULIA.webp",
      availability  :11,
      description:"The Alfa Romeo Giulia is a premium sports sedan renowned for its elegant design, dynamic performance, and advanced technology. It is available with a range of engines, including a 280-horsepower turbocharged gasoline engine and 160- or 210-horsepower diesel options. The Giulia features a customizable 12.3-inch digital instrument cluster, an 8.8-inch touchscreen with navigation, and advanced driver assistance systems."
    }
  ]
}