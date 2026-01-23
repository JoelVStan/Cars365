import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarsService } from '../../services/car.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  carForm;
  carId: number | null = null;
  isEditMode = false;
  currentStep = 1;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  isImageLoading = false;
  hasExistingImage = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ✅ Dropdown data
  carTypes = [
    'Hatchback',
    'Sedan',
    'SUV',
    'MUV',
    'Coupe',
    'Convertible',
    'Pickup',
    'Van'
  ];

  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];

  transmissions = ['Manual', 'Automatic'];

  constructor(
    private fb: FormBuilder,
    private carsService: CarsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      type: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1990)]],
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(10000)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.carId = +id;
      this.isEditMode = true;
      this.loadCarForEdit(this.carId);
    }
  }

  loadCarForEdit(id: number) {
    this.carsService.getCarById(id).subscribe(car => {

      this.carForm.patchValue({
        brand: car.brand,
        model: car.model,
        type: car.type,
        year: car.year,
        fuelType: car.fuelType,
        transmission: car.transmission,
        price: car.price,
        description: car.description
      });

      this.imagePreview = `https://localhost:7193${car.imageUrl}?t=${Date.now()}`;
      this.hasExistingImage = true; // 👈 IMPORTANT
      this.currentStep = 1;
    });
  }


  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedImageFile = input.files[0];
    this.isImageLoading = true;
    this.imagePreview = null;

    const reader = new FileReader();

    reader.onload = () => {
      // ⏳ Artificial delay (1.5 seconds)
      setTimeout(() => {
        this.imagePreview = reader.result as string;
        this.isImageLoading = false;
      }, 1500);
    };

    reader.readAsDataURL(this.selectedImageFile);
  }

  removeImage() {
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.hasExistingImage = false;
    this.isImageLoading = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }


  submit() {
    if (this.carForm.invalid || (!this.isEditMode && !this.selectedImageFile)) {
      this.carForm.markAllAsTouched();
      alert('Please fill all fields');
      return;
    }

    const formData = new FormData();
    Object.entries(this.carForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    if (this.isEditMode && this.carId) {
      // ✅ UPDATE
      this.carsService.updateCar(this.carId, formData).subscribe(() => {
        alert('Car updated successfully');
        this.router.navigate(['/cars']);
      });
    } else {
      // ✅ ADD
      this.carsService.addCar(formData).subscribe(() => {
        alert('Car added successfully');
        this.router.navigate(['/cars']);
      });
    }
  }


  formatPriceToLakhs(price: number | string | null | undefined): string {
    if (price == null || price === '') return '';

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 1000) return '';

    const lakhs = numericPrice / 100000;
    const formatted =
      lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2);

    return `${formatted} Lacs`;
  }

  generateDescription() {
    const { brand, model, year, fuelType, transmission, type } =
      this.carForm.value;

    if (!brand || !model || !year || !fuelType || !transmission || !type) {
      alert('Please fill Brand, Model, Year, Type, Fuel and Transmission first');
      return;
    }

    const templates = [
      // 1
      `${year} ${brand} ${model} ${fuelType} ${transmission} in excellent condition. Well maintained with a smooth driving experience.`,

      // 2
      `Premium ${type} – ${year} ${brand} ${model}. Reliable ${fuelType} engine with comfortable ${transmission.toLowerCase()} transmission.`,

      // 3
      `Well-kept ${year} ${brand} ${model}, ideal for city and highway drives. Clean interiors and dependable performance.`,

      // 4
      `${year} ${brand} ${model} ${fuelType} variant. Carefully maintained, responsive handling, and ready for daily use.`,

      // 5
      `Spacious and comfortable ${type}. This ${year} ${brand} ${model} offers a smooth ${transmission.toLowerCase()} drive and strong road presence.`,

      // 6
      `Single-owner–maintained ${year} ${brand} ${model}. Known for reliability, fuel efficiency, and low maintenance costs.`,

      // 7
      `${brand} ${model} (${year}) in great overall condition. Suitable for both family use and long-distance travel.`,

      // 8
      `Clean and well-maintained ${year} ${brand} ${model} with ${fuelType} engine. Drives smoothly and feels solid on the road.`,

      // 9
      `${type} with excellent ride quality. This ${year} ${brand} ${model} is a great balance of comfort, performance, and value.`,

      // 10
      `Value-for-money ${year} ${brand} ${model}. Comfortable seating, smooth ${transmission.toLowerCase()} transmission, and reliable ownership experience.`
    ];

    const randomDescription =
      templates[Math.floor(Math.random() * templates.length)];

    this.carForm.patchValue({
      description: randomDescription
    });
  }

  nextStep() {
    if (this.currentStep === 1) {
      const hasImage = !!this.imagePreview || !!this.selectedImageFile;

      if (
        !hasImage ||
        this.carForm.get('brand')?.invalid ||
        this.carForm.get('model')?.invalid ||
        this.carForm.get('year')?.invalid
      ) {
        alert('Please complete Image, Brand, Model and Year');
        return;
      }
    }

    if (this.currentStep === 2) {
      if (
        this.carForm.get('type')?.invalid ||
        this.carForm.get('fuelType')?.invalid ||
        this.carForm.get('transmission')?.invalid ||
        this.carForm.get('price')?.invalid
      ) {
        alert('Please complete specifications and pricing');
        return;
      }
    }

    this.currentStep++;
  }


  prevStep() {
    this.currentStep--;
  }



}
