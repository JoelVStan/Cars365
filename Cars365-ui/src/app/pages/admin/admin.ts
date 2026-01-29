import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarsService } from '../../services/car.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule,DragDropModule],
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

  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  isGalleryUploading = false;
  existingImages: any[] = [];

  brands: any[] = [];
  models: any[] = [];

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
    private router: Router,
    private toast: ToastService,
    private brandService: BrandService
  ) {
    this.carForm = this.fb.group({
      carBrandId: ['', Validators.required],
      carModelId: ['', Validators.required],
      type: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1990)]],
      variant: [''],

      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],

      // 🔹 NEW FIELDS
      kmsDriven: [0, Validators.required],
      ownership: [1, Validators.required],
      registrationCode: ['', Validators.required],
      registrationYear: ['', Validators.required],
      engineCC: ['', Validators.required],
      insuranceTill: [''],
      hasSpareKey: ['', Validators.required],

      price: ['', [Validators.required, Validators.min(10000)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadBrands();
    // 🔹 Watch brand change → load models
    this.carForm.get('carBrandId')?.valueChanges.subscribe(brandId => {
      const id = Number(brandId); // ✅ FIX

      this.carForm.patchValue({ carModelId: null });
      this.models = [];

      if (!id) return;

      this.brandService.getModelsByBrand(id).subscribe(res => {
        this.models = res;
      });
    });

    if (id) {
      this.carId = +id;
      this.isEditMode = true;
      this.loadCarForEdit(this.carId);
    }
  }

  loadBrands() {
    this.brandService.getBrands().subscribe(res => {
      this.brands = res;
    });
  }





  onReorder(event: CdkDragDrop<any[]>) {
    moveItemInArray(
      this.existingImages,
      event.previousIndex,
      event.currentIndex
    );

    const orderedIds = this.existingImages.map(img => img.id);

    this.carsService
      .reorderCarImages(this.carId!, orderedIds)
      .subscribe(() => {
        this.toast.success('Image order updated');
      });
  }

  loadCarForEdit(id: number) {
    this.carsService.getCarById(id).subscribe(car => {

      // 🔹 Patch everything EXCEPT model first
      this.carForm.patchValue({
        carBrandId: car.carBrandId,
        type: car.type,
        year: car.year,
        variant: car.variant,
        fuelType: car.fuelType,
        transmission: car.transmission,
        price: car.price,
        description: car.description,
        kmsDriven: car.kmsDriven,
        ownership: car.ownership,
        registrationCode: car.registrationCode,
        registrationYear: car.registrationYear?.substring(0, 7),
        engineCC: car.engineCC,
        insuranceTill: car.insuranceTill?.substring(0, 7),
        hasSpareKey: car.hasSpareKey
      });

      // 🔹 NOW load models for the selected brand
      if (car.carBrandId) {
        this.brandService.getModelsByBrand(car.carBrandId).subscribe(res => {
          this.models = res;

          // 🔹 Patch model ONLY after models are available
          this.carForm.patchValue({
            carModelId: car.carModelId
          });
        });
      }

      this.carsService.getCarImages(id).subscribe(images => {
        this.existingImages = images.map(img => ({
          ...img,
          fullUrl: `https://localhost:7193${img.imageUrl}`
        }));
      });

       


      this.imagePreview = `https://localhost:7193${car.imageUrl}?t=${Date.now()}`;
      this.hasExistingImage = true; // 👈 IMPORTANT
      this.currentStep = 1;
      this.loadGalleryImages(id);

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
      this.toast.error('Please fill all fields');
      return;
    }

    const formData = new FormData();

    Object.entries(this.carForm.value).forEach(([key, value]) => {

      // ✅ FIX for month fields
      if (
        (key === 'registrationYear' || key === 'insuranceTill') &&
        value
      ) {
        formData.append(key, `${value}-01`);
      }
      // ✅ FIX for boolean select
      else if (key === 'hasSpareKey') {
        formData.append(key, String(value));
      }
      else {
        formData.append(key, value as string);
      }
    });

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    

    if (this.isEditMode && this.carId) {
      this.carsService.updateCar(this.carId, formData).subscribe(() => {
        this.toast.warning('Car updated successfully');
        this.router.navigate(['/cars']);
      });
    } else {
      this.carsService.addCar(formData).subscribe(() => {
        this.toast.success('Car added successfully');
        this.router.navigate(['/cars']);
      });
    }
    console.log('Form submitted', this.carForm.value);
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
    const { carBrandId, carModelId, year, fuelType, transmission, type } =
      this.carForm.value;

    const brandName = this.brands.find(b => b.id === Number(carBrandId))?.name || '';
    const modelName = this.models.find(m => m.id === Number(carModelId))?.name || '';

    if (!brandName || !modelName || !year || !fuelType || !transmission || !type) {
      this.toast.error('Please fill Brand, Model, Year, Type, Fuel and Transmission first');
      return;
    }

    const templates = [
      // 1
      `${year} ${brandName} ${modelName} ${fuelType} ${transmission} in excellent condition. Well maintained with a smooth driving experience.`,

      // 2
      `Premium ${type} – ${year} ${brandName} ${modelName}. Reliable ${fuelType} engine with comfortable ${transmission.toLowerCase()} transmission.`,

      // 3
      `Well-kept ${year} ${brandName} ${modelName}, ideal for city and highway drives. Clean interiors and dependable performance.`,

      // 4
      `${year} ${brandName} ${modelName} ${fuelType} variant. Carefully maintained, responsive handling, and ready for daily use.`,

      // 5
      `Spacious and comfortable ${type}. This ${year} ${brandName} ${modelName} offers a smooth ${transmission.toLowerCase()} drive and strong road presence.`,

      // 6
      `Single-owner–maintained ${year} ${brandName} ${modelName}. Known for reliability, fuel efficiency, and low maintenance costs.`,

      // 7
      `${brandName} ${modelName} (${year}) in great overall condition. Suitable for both family use and long-distance travel.`,

      // 8
      `Clean and well-maintained ${year} ${brandName} ${modelName} with ${fuelType} engine. Drives smoothly and feels solid on the road.`,

      // 9
      `${type} with excellent ride quality. This ${year} ${brandName} ${modelName} is a great balance of comfort, performance, and value.`,

      // 10
      `Value-for-money ${year} ${brandName} ${modelName}. Comfortable seating, smooth ${transmission.toLowerCase()} transmission, and reliable ownership experience.`
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
        this.toast.error('Please complete Image, Brand, Model and Year');
        return;
      }
    }

    if (this.currentStep === 2) {
      if (
        this.carForm.get('type')?.invalid ||
        this.carForm.get('fuelType')?.invalid ||
        this.carForm.get('transmission')?.invalid ||
        this.carForm.get('price')?.invalid ||
        this.carForm.get('kmsDriven')?.invalid ||
        this.carForm.get('ownership')?.invalid ||
        this.carForm.get('registrationCode')?.invalid ||
        this.carForm.get('registrationYear')?.invalid ||
        this.carForm.get('engineCC')?.invalid ||
        this.carForm.get('hasSpareKey')?.invalid
      ) {
        this.toast.error('Please complete all vehicle specifications');
        return;
      }
    }

    this.currentStep++;
  }


  prevStep() {
    this.currentStep--;
  }

  onGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // ✅ Convert FileList to array (IMPORTANT)
    const files = Array.from(input.files);

    // ✅ Append instead of replace (supports re-selection)
    files.forEach(file => {
      this.galleryFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.galleryPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });

    // ✅ Reset input so user can re-select same files if needed
    input.value = '';
  }



  uploadGallery() {
    if (!this.carId || this.galleryFiles.length === 0) return;

    this.isGalleryUploading = true;

    this.carsService.uploadCarImages(this.carId, this.galleryFiles).subscribe({
      next: () => {
        this.toast.success('Gallery images uploaded');
        this.galleryFiles = [];
        this.galleryPreviews = [];
        this.isGalleryUploading = false;
        this.loadGalleryImages(this.carId!);
      },
      error: () => {
        this.toast.error('Failed to upload images');
        this.isGalleryUploading = false;
      }
    });
  }


  deleteImage(imageId: number) {
    if (!confirm('Delete this image?')) return;

    this.carsService.deleteCarImage(imageId).subscribe(() => {
      this.toast.success('Image deleted');
      this.existingImages = this.existingImages.filter(i => i.id !== imageId);
    });
  }

  setPrimary(imageId: number) {
    this.carsService.setPrimaryImage(imageId).subscribe(() => {
      this.toast.success('Primary image updated');

      this.existingImages.forEach(img =>
        img.isPrimary = img.id === imageId
      );
    });
  }

  loadGalleryImages(carId: number) {
    this.carsService.getCarImages(carId).subscribe(images => {
      const baseUrl = 'https://localhost:7193';

      this.existingImages = images
        .sort((a: any, b: any) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return a.sortOrder - b.sortOrder;
        })
        .map((img: any) => ({
          ...img,
          fullUrl: `${baseUrl}${img.imageUrl}?t=${Date.now()}`
        }));
    });
  }



}
