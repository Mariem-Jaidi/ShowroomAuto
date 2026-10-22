import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Auto } from '../../interfaces/auto';

@Component({
  imports: [FontAwesomeModule],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar implements OnChanges {
  faMagnifyingGlass = faMagnifyingGlass

  // data coming FROM the parent (app.ts)
  @Input() autos: Auto[] = []

  // event going TO the parent (app.ts)
  @Output() onSelectCar = new EventEmitter<Auto>()

  // the list actually displayed in the page
  selectedAutos: Auto[] = []

  // current filter values
  currentBrand: string = ''
  currentModel: string = ''
  currentPower: string = ''
  currentSort: string = ''

  // runs when the component is created AND every time @Input() autos receives a new list
  ngOnChanges() {
    this.applyFilters()
  }

  // this method runs every time any filter changes
  applyFilters() {
    let result = this.autos

    // filter by brand (text input)
    if (this.currentBrand) {
      result = result.filter(x =>
        x.brand.toLowerCase().startsWith(this.currentBrand.toLowerCase())
      )
    }

    // filter by model (dropdown)
    if (this.currentModel) {
      result = result.filter(x => x.model === this.currentModel)
    }

    // filter by power range (dropdown)
    if (this.currentPower === 'low') {
      result = result.filter(x => x.power < 10)
    }
    else if (this.currentPower === 'mid') {
      result = result.filter(x => x.power >= 10 && x.power <= 15)
    }
    else if (this.currentPower === 'high') {
      result = result.filter(x => x.power > 15)
    }

    // sort (price or power). slice() makes a copy so the original list is not modified
    if (this.currentSort === 'price-asc') {
      result = result.slice().sort((a, b) => a.price - b.price)
    }
    else if (this.currentSort === 'price-desc') {
      result = result.slice().sort((a, b) => b.price - a.price)
    }
    else if (this.currentSort === 'power-asc') {
      result = result.slice().sort((a, b) => a.power - b.power)
    }
    else if (this.currentSort === 'power-desc') {
      result = result.slice().sort((a, b) => b.power - a.power)
    }

    this.selectedAutos = result
  }

  // called when user types in the brand input
  selectAutos(brand: string) {
    this.currentBrand = brand
    // the old model may not belong to the new brand, so we clear it
    this.currentModel = ''
    this.applyFilters()
  }

  filterByModel(model: string) {
    this.currentModel = model
    this.applyFilters()
  }

  filterByPower(power: string) {
    this.currentPower = power
    this.applyFilters()
  }

  sortCars(sortValue: string) {
    this.currentSort = sortValue
    this.applyFilters()
  }

  // puts every filter back to its default value
  resetFilters(brandInput: HTMLInputElement, modelSelect: HTMLSelectElement,
               powerSelect: HTMLSelectElement, sortSelect: HTMLSelectElement) {
    brandInput.value = ''
    modelSelect.value = ''
    powerSelect.value = ''
    sortSelect.value = ''
    this.currentBrand = ''
    this.currentModel = ''
    this.currentPower = ''
    this.currentSort = ''
    this.applyFilters()
  }

  // builds the list of unique models based on the current brand filter
  getModels(): string[] {
    let source = this.autos
    if (this.currentBrand) {
      source = source.filter(x =>
        x.brand.toLowerCase().startsWith(this.currentBrand.toLowerCase())
      )
    }
    let models: string[] = []
    for (let car of source) {
      if (!models.includes(car.model)) {
        models.push(car.model)
      }
    }
    return models
  }

  selectCar(auto: Auto) {
    this.onSelectCar.emit(auto)
  }
}